export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Generating Summary...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          I&apos;m thinking about everything you taught me. This may take a moment...
        </p>
      </div>
    </div>
  );
}
