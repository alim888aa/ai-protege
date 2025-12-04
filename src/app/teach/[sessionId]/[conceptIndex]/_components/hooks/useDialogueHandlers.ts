'use client';

import { useCallback, RefObject } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { exportTopicCanvasForAI } from '@/app/utils/excalidrawExport';
import { Message } from '../useTeachingReducer';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface UseDialogueHandlersProps {
  sessionId: string;
  currentConcept: Concept;
  canvasElementsRef: RefObject<readonly unknown[] | null>;
  dialogueMessages: Message[];
  hasSourceMaterial: boolean;
  state: {
    dialogueInput: string;
    isSubmitting: boolean;
    isGeneratingHint: boolean;
    hints: (string | null)[];
  };
  actions: {
    submitStart: () => void;
    submitSuccess: () => void;
    submitError: (error: string) => void;
    streamStart: () => void;
    streamUpdate: (content: string) => void;
    streamEnd: () => void;
    openHintModal: () => void;
    hintGenerateStart: () => void;
    hintStreamUpdate: (content: string) => void;
    hintGenerateSuccess: (hintNumber: number, content: string) => void;
    hintGenerateError: (error: string) => void;
  };
}

// Get the Convex site URL for HTTP endpoints
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site') ?? '';

export function useDialogueHandlers({
  sessionId,
  currentConcept,
  canvasElementsRef,
  dialogueMessages,
  hasSourceMaterial,
  state,
  actions,
}: UseDialogueHandlersProps) {
  const saveExplanation = useMutation(api.mutations.saveExplanation);
  const saveDialogue = useMutation(api.mutations.saveDialogue);
  const createStream = useMutation(api.streaming.mutations.createStream);


  const handleSubmit = useCallback(async () => {
    if (!state.dialogueInput.trim() || state.isSubmitting) return;

    const userContent = state.dialogueInput;
    actions.submitStart();
    actions.streamStart();

    try {
      await saveExplanation({
        sessionId,
        conceptId: currentConcept.id,
        textExplanation: userContent,
        canvasData: JSON.stringify(canvasElementsRef.current),
      });

      let canvasImage: string | null = null;
      try {
        canvasImage = await exportTopicCanvasForAI(canvasElementsRef.current ?? [], currentConcept.id);
      } catch {
        // Continue without canvas image
      }

      const allMessages = [
        ...dialogueMessages.filter((m) => m.id !== 'pending-user'),
        { role: 'user' as const, content: userContent },
      ];

      // Use Convex HTTP streaming for sessions with source material
      // Fall back to Vercel API for manual sessions without source
      if (hasSourceMaterial) {
        // Create a stream ID first
        const { streamId } = await createStream({});

        // Start the HTTP stream request (don't await - it streams)
        const streamPromise = fetch(`${CONVEX_SITE_URL}/chat-stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            conceptId: currentConcept.id,
            streamId,
            userMessage: userContent,
            canvasImage: canvasImage ?? undefined,
            dialogueHistory: allMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        // Read the streaming response
        const response = await streamPromise;
        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let content = '';
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          actions.streamUpdate(content);
        }

        // Save the dialogue with final content
        const messagesToSave = [
          ...allMessages,
          { role: 'ai' as const, content, timestamp: Date.now() },
        ].map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: 'timestamp' in m ? m.timestamp : Date.now(),
        }));

        await saveDialogue({
          sessionId,
          conceptId: currentConcept.id,
          messages: messagesToSave,
        });

        actions.submitSuccess();
        actions.streamEnd();
      } else {
        // Fallback to existing Vercel API route for manual sessions
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
            concept: currentConcept,
            ragChunks: [],
            canvasImage,
          }),
        });

        if (!response.ok) throw new Error('Failed to get AI response');
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let content = '';
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          actions.streamUpdate(content);
        }

        const messagesToSave = [
          ...allMessages,
          { role: 'ai' as const, content, timestamp: Date.now() },
        ].map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: 'timestamp' in m ? m.timestamp : Date.now(),
        }));

        await saveDialogue({
          sessionId,
          conceptId: currentConcept.id,
          messages: messagesToSave,
        });

        actions.submitSuccess();
        actions.streamEnd();
      }
    } catch (err) {
      actions.submitError(err instanceof Error ? err.message : 'Failed to submit');
      actions.streamEnd();
    }
  }, [
    state.dialogueInput,
    state.isSubmitting,
    actions,
    sessionId,
    currentConcept,
    dialogueMessages,
    canvasElementsRef,
    saveExplanation,
    saveDialogue,
    hasSourceMaterial,
    createStream,
  ]);


  const handleGenerateHint = useCallback(
    async (hintNumber: number) => {
      if (state.isGeneratingHint) return;
      actions.hintGenerateStart();

      try {
        const userProgress = dialogueMessages
          .filter((m) => m.role === 'user')
          .map((m) => m.content)
          .join('\n');

        // Use Convex HTTP streaming for sessions with source material
        if (hasSourceMaterial) {
          // Create a stream ID first
          const { streamId } = await createStream({});

          // Start the HTTP stream request
          const response = await fetch(`${CONVEX_SITE_URL}/hint-stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              conceptId: currentConcept.id,
              streamId,
              hintCount: hintNumber,
              userExplanation: userProgress || '',
              dialogueHistory: dialogueMessages.map((m) => ({ role: m.role, content: m.content })),
            }),
          });

          if (!response.ok) throw new Error('Failed to generate hint');

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          let content = '';
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            content += decoder.decode(value, { stream: true });
            actions.hintStreamUpdate(content);
          }

          actions.hintGenerateSuccess(hintNumber, content);
        } else {
          // Fallback to existing Vercel API route for manual sessions
          const elements = canvasElementsRef.current ?? [];
          const userDrawings = (
            elements as Array<{
              customData?: { isBoundary?: boolean };
              isDeleted?: boolean;
            }>
          ).filter((el) => !el.customData?.isBoundary && !el.isDeleted);
          const hasDrawings = userDrawings.length > 0;

          let canvasImage: string | null = null;
          if (hasDrawings) {
            try {
              canvasImage = await exportTopicCanvasForAI(elements, currentConcept.id);
            } catch {
              // Continue without canvas
            }
          }

          const drawingContext = hasDrawings && canvasImage ? 'They have also drawn a diagram (see image).' : '';
          const hintPrompt = userProgress
            ? `The student is trying to explain "${currentConcept.title}" and has written: "${userProgress}". ${drawingContext} Give them hint #${hintNumber} to help improve their explanation.`
            : `The student is trying to explain "${currentConcept.title}" but hasn't written anything yet. ${drawingContext} Give them hint #${hintNumber} to help them get started.`;

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: hintPrompt }],
              concept: currentConcept,
              ragChunks: [],
              canvasImage: hasDrawings ? canvasImage : null,
              isHintRequest: true,
            }),
          });

          if (!response.ok) throw new Error('Failed to generate hint');
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          let content = '';
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            content += decoder.decode(value, { stream: true });
            actions.hintStreamUpdate(content);
          }

          actions.hintGenerateSuccess(hintNumber, content);
        }
      } catch (err) {
        actions.hintGenerateError(err instanceof Error ? err.message : 'Failed to generate hint');
      }
    },
    [state.isGeneratingHint, actions, currentConcept, dialogueMessages, canvasElementsRef, hasSourceMaterial, sessionId, createStream]
  );

  const handleHintClick = useCallback(() => {
    actions.openHintModal();
    if (state.hints[0] === null) handleGenerateHint(1);
  }, [actions, state.hints, handleGenerateHint]);

  return { handleSubmit, handleGenerateHint, handleHintClick, saveExplanation };
}
