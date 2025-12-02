'use client';

import { useCallback, MutableRefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { ExcalidrawAPI } from '@/app/components/ExcalidrawWrapper';
import { calculateTopicPosition, createBoundaryElement } from '@/app/utils/topicAreaManager';

interface UseNavigationHandlersProps {
  sessionId: string;
  conceptIndex: number;
  totalConcepts: number;
  currentConceptId: string;
  dialogueInput: string;
  canvasElementsRef: MutableRefObject<readonly unknown[]>;
  excalidrawApiRef: MutableRefObject<ExcalidrawAPI | null>;
}

export function useNavigationHandlers({
  sessionId,
  conceptIndex,
  totalConcepts,
  currentConceptId,
  dialogueInput,
  canvasElementsRef,
  excalidrawApiRef,
}: UseNavigationHandlersProps) {
  const router = useRouter();
  const saveExplanation = useMutation(api.mutations.saveExplanation);
  const updateProgress = useMutation(api.mutations.updateProgress);

  const handleNextTopic = useCallback(async () => {
    try {
      await saveExplanation({
        sessionId,
        conceptId: currentConceptId,
        textExplanation: dialogueInput,
        canvasData: JSON.stringify(canvasElementsRef.current),
      });
      await updateProgress({ sessionId, conceptIndex: conceptIndex + 1 });

      const nextTopicIndex = conceptIndex + 1;
      const nextPosition = calculateTopicPosition(nextTopicIndex);

      if (excalidrawApiRef.current) {
        const nextConcept = totalConcepts > nextTopicIndex ? `concept-${nextTopicIndex}` : '';
        const nextBoundary = createBoundaryElement(nextTopicIndex, nextConcept);
        const currentElements = excalidrawApiRef.current.getSceneElements();
        excalidrawApiRef.current.updateScene({
          elements: [...currentElements, nextBoundary],
          appState: { scrollX: -nextPosition.x + 100, scrollY: -nextPosition.y + 100 },
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
    router.push(`/teach/${sessionId}/${conceptIndex + 1}`);
  }, [
    conceptIndex,
    totalConcepts,
    sessionId,
    currentConceptId,
    dialogueInput,
    canvasElementsRef,
    excalidrawApiRef,
    saveExplanation,
    updateProgress,
    router,
  ]);

  const handleBackToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleCompleteSession = useCallback(async () => {
    try {
      await saveExplanation({
        sessionId,
        conceptId: currentConceptId,
        textExplanation: dialogueInput,
        canvasData: JSON.stringify(canvasElementsRef.current),
      });
      await updateProgress({ sessionId, conceptIndex: conceptIndex + 1 });
    } catch (err) {
      console.error('Failed to save:', err);
    }
    router.push(`/complete/${sessionId}`);
  }, [
    sessionId,
    currentConceptId,
    dialogueInput,
    conceptIndex,
    canvasElementsRef,
    saveExplanation,
    updateProgress,
    router,
  ]);

  return { handleNextTopic, handleBackToDashboard, handleCompleteSession };
}
