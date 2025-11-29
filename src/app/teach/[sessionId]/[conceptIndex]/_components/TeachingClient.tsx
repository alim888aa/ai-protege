'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { ErrorDisplay } from '@/app/components/ErrorDisplay';
import { TeachingLayout } from './TeachingLayout';

interface TeachingClientProps {
  sessionId: string;
  conceptIndex: number;
}

export function TeachingClient({ sessionId, conceptIndex }: TeachingClientProps) {
  const session = useQuery(api.mutations.getSession, { sessionId });

  // Derived data
  const currentConcept = session?.concepts?.[conceptIndex];
  const totalConcepts = session?.concepts?.length ?? 0;

  const currentDialogue = useMemo(
    () => session?.dialogues?.find((d) => d.conceptId === currentConcept?.id),
    [session?.dialogues, currentConcept?.id]
  );

  const currentExplanation = useMemo(
    () => session?.explanations?.find((e) => e.conceptId === currentConcept?.id),
    [session?.explanations, currentConcept?.id]
  );

  // Loading state
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <LoadingIndicator />
      </div>
    );
  }

  // Validation
  if (conceptIndex < 0 || conceptIndex >= totalConcepts || !currentConcept) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <ErrorDisplay message="Concept not found" />
      </div>
    );
  }

  return (
    <TeachingLayout
      sessionId={sessionId}
      session={session}
      conceptIndex={conceptIndex}
      currentConcept={currentConcept}
      totalConcepts={totalConcepts}
      currentDialogue={currentDialogue}
      currentExplanation={currentExplanation}
    />
  );
}
