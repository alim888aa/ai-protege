'use client';

import { useCallback, RefObject } from 'react';
import { useAuth } from '@clerk/nextjs';
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
  state,
  actions,
}: UseDialogueHandlersProps) {
  const { getToken } = useAuth();
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
        canvasImage = await exportTopicCanvasForAI(canvasElementsRef.current ?? [], currentConcept.id);
      } catch {
        // Continue without canvas image
      }

      const dialogueHistory = dialogueMessages.filter((m) => m.id !== 'pending-user');
      const allMessages = [
        ...dialogueHistory,
        { role: 'user' as const, content: userContent },
      ];

      const authToken = await getToken({ template: 'convex' });
      if (!authToken) throw new Error('Your session expired. Please sign in again.');

      const response = await fetch(`${CONVEX_SITE_URL}/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          sessionId,
          conceptId: currentConcept.id,
          userMessage: userContent,
          canvasImage: canvasImage ?? undefined,
          dialogueHistory: dialogueHistory.map((m) => ({ role: m.role, content: m.content })),
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
    getToken,
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

        const authToken = await getToken({ template: 'convex' });
        if (!authToken) throw new Error('Your session expired. Please sign in again.');

        const response = await fetch(`${CONVEX_SITE_URL}/hint-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            sessionId,
            conceptId: currentConcept.id,
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
      } catch (err) {
        actions.hintGenerateError(err instanceof Error ? err.message : 'Failed to generate hint');
      }
    },
    [state.isGeneratingHint, actions, currentConcept, dialogueMessages, getToken, sessionId]
  );

  const handleHintClick = useCallback(() => {
    actions.openHintModal();
    if (state.hints[0] === null) handleGenerateHint(1);
  }, [actions, state.hints, handleGenerateHint]);

  return { handleSubmit, handleGenerateHint, handleHintClick, saveExplanation };
}
