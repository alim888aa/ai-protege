'use client';

export function SessionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
      {/* Topic title */}
      <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
      {/* Source URL */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-3" />
      {/* Progress */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-4" />
      {/* Action buttons row */}
      <div className="flex justify-between items-center">
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  );
}
