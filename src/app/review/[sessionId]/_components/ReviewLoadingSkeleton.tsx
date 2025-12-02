export function ReviewLoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 animate-fadeIn">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          
          {/* Concept Cards Skeleton */}
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                    <div className="h-10 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Button Skeleton */}
          <div className="h-12 w-full bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
