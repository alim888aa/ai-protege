'use client';

import { X } from 'lucide-react';

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
      <span>{error}</span>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
