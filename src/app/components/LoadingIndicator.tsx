'use client';

interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
}

export function LoadingIndicator({ 
  message = 'Evaluating your teaching...', 
  subMessage = 'This may take a few seconds' 
}: LoadingIndicatorProps) {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="relative">
            <svg
              className="animate-spin h-6 w-6 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {message}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
            {subMessage}
          </p>
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
