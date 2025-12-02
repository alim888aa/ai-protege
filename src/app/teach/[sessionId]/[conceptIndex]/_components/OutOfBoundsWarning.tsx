'use client';

import { AlertTriangle } from 'lucide-react';

interface OutOfBoundsWarningProps {
  isVisible: boolean;
  onScrollBack: () => void;
}

export function OutOfBoundsWarning({ isVisible, onScrollBack }: OutOfBoundsWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
      <div className="flex items-center gap-3 bg-amber-100 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-100 px-4 py-2 rounded-lg shadow-lg">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">You&apos;re outside the topic area</span>
        <button
          onClick={onScrollBack}
          className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
