'use client';

import { useCallback, MutableRefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { ExcalidrawAPI } from '@/app/components/ExcalidrawWrapper';
import { calculateTopicPosition, createBoundaryElement } from '@/app/utils/topicAreaManager';
import { cacheSessionData } from '@/app/utils/sessionCache';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface Dialogue {
  conceptId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: number;
    type?: string;
  }>;
}

interface Explanation {
  conceptId: string;
  textExplanation: string;
  canvasData?: string;
}

interface UseNavigationHandlersProps {
  sessionId: string;
  conceptIndex: number;
  totalConcepts: number;
  currentConceptId: string;
  dialogueInput: string;
  canvasElementsRef: MutableRefObject<readonly unknown[]>;
  excalidrawApiRef: MutableRefObject<ExcalidrawAPI | null>;
  // Session data for caching
  topic: string;
  concepts: Concept[];
  dialogues: Dialogue[];
  explanations: Explanation[];
}

export function useNavigationHandlers({
  sessionId,
  conceptIndex,
  totalConcepts,
  currentConceptId,
  dialogueInput,
  canvasElementsRef,
  excalidrawApiRef,
  topic,
  concepts,
  dialogues,
  explanations,
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
    const currentCanvasData = JSON.stringify(canvasElementsRef.current);
    
    try {
      await saveExplanation({
        sessionId,
        conceptId: currentConceptId,
        textExplanation: dialogueInput,
        canvasData: currentCanvasData,
      });
      await updateProgress({ sessionId, conceptIndex: conceptIndex + 1 });
    } catch (err) {
      console.error('Failed to save:', err);
    }

    // Cache session data for fast completion page load
    // Include the current explanation that was just saved
    const updatedExplanations = [...explanations];
    const existingIdx = updatedExplanations.findIndex(e => e.conceptId === currentConceptId);
    const currentExplanation = {
      conceptId: currentConceptId,
      textExplanation: dialogueInput,
      canvasData: currentCanvasData,
    };
    if (existingIdx >= 0) {
      updatedExplanations[existingIdx] = currentExplanation;
    } else {
      updatedExplanations.push(currentExplanation);
    }

    cacheSessionData(sessionId, {
      topic,
      concepts,
      dialogues,
      explanations: updatedExplanations,
    });

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
    topic,
    concepts,
    dialogues,
    explanations,
  ]);

  return { handleNextTopic, handleBackToDashboard, handleCompleteSession };
}
