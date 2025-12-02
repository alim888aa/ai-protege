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
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{message}</p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">{subMessage}</p>
        </div>
      </div>
      {/* Progress dots animation */}
      <div className="flex justify-center gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
