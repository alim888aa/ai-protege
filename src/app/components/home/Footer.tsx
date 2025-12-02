export function Footer() {
  return (
    <footer className="pb-10 pt-6">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full border border-orange-200 dark:border-orange-800">
          <span className="text-lg">🎃</span>
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Made for Kiroween Hackathon
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Built with Kiro AI
        </p>
      </div>
    </footer>
  );
}
