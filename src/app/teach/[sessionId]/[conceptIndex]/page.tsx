import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { TeachingClient } from './_components/TeachingClient';

interface PageProps {
  params: Promise<{
    sessionId: string;
    conceptIndex: string;
  }>;
}

export default async function TeachingPage({ params }: PageProps) {
  const { sessionId, conceptIndex } = await params;
  const conceptIdx = parseInt(conceptIndex, 10);

  // Validate params
  if (!sessionId || isNaN(conceptIdx) || conceptIdx < 0) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TeachingClient sessionId={sessionId} conceptIndex={conceptIdx} />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <LoadingIndicator />
    </div>
  );
}
