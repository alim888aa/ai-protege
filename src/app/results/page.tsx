import { Suspense } from 'react';
import { ResultsClient } from './_components';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">Loading results...</div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsClient />
    </Suspense>
  );
}
