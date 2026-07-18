'use client';

import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
}

export function LoadingIndicator({
  message = 'Evaluating your teaching...',
  subMessage = 'This may take a few seconds',
}: LoadingIndicatorProps) {
  return (
    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg animate-fadeIn">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">{message}</p>
          <p className="text-sm text-violet-600 dark:text-violet-300 mt-1">{subMessage}</p>
        </div>
      </div>
      {/* Progress dots animation */}
      <div className="flex justify-center gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
