'use client';

import { useCallback, useMemo, MutableRefObject } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { exportTopicCanvasForAI } from '@/app/utils/excalidrawExport';
import { Message } from '../useTeachingReducer';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface DialogueMessage {
  role: string;
  content: string;
  timestamp: number;
  type?: string;
}

interface UseDialogueHandlersProps {
  sessionId: string;
  currentConcept: Concept;
  canvasElementsRef: MutableRefObject<readonly unknown[]>;
  dialogueMessages: Message[];
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

export function useDialogueHandlers({
  sessionId,
  currentConcept,
  canvasElementsRef,
  dialogueMessages,
  state,
  actions,
}: UseDialogueHandlersProps) {
  const saveExplanation = useMutation(api.mutations.saveExplanation);
  const saveDialogue = useMutation(api.mutations.saveDialogue);

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
        canvasImage = await exportTopicCanvasForAI(canvasElementsRef.current, currentConcept.id);
      } catch {
        // Continue without canvas image
      }

      const allMessages = [
        ...dialogueMessages.filter((m) => m.id !== 'pending-user'),
        { role: 'user' as const, content: userContent },
      ];

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
    } catch (err) {
      actions.submitError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
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
  ]);

  const handleGenerateHint = useCallback(
    async (hintNumber: number) => {
      if (state.isGeneratingHint) return;
      actions.hintGenerateStart();

      try {
        const userDrawings = (
          canvasElementsRef.current as Array<{
            customData?: { isBoundary?: boolean };
            isDeleted?: boolean;
          }>
        ).filter((el) => !el.customData?.isBoundary && !el.isDeleted);
        const hasDrawings = userDrawings.length > 0;

        let canvasImage: string | null = null;
        if (hasDrawings) {
          try {
            canvasImage = await exportTopicCanvasForAI(canvasElementsRef.current, currentConcept.id);
          } catch {
            // Continue without canvas
          }
        }

        const userProgress = dialogueMessages
          .filter((m) => m.role === 'user')
          .map((m) => m.content)
          .join('\n');

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
      } catch (err) {
        actions.hintGenerateError(err instanceof Error ? err.message : 'Failed to generate hint');
      }
    },
    [state.isGeneratingHint, actions, currentConcept, dialogueMessages, canvasElementsRef]
  );

  const handleHintClick = useCallback(() => {
    actions.openHintModal();
    if (state.hints[0] === null) handleGenerateHint(1);
  }, [actions, state.hints, handleGenerateHint]);

  return { handleSubmit, handleGenerateHint, handleHintClick, saveExplanation };
}
