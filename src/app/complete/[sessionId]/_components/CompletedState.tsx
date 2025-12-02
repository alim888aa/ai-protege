import { SummaryResponse } from '../../../actions/generateSummary';
import { ExportButtons } from './ExportButtons';

interface CompletedStateProps {
  topic: string;
  summary: SummaryResponse | null;
  isExporting: string | null;
  exportError: string | null;
  onExportExcalidraw: () => void;
  onExportPNG: () => void;
  onBackToDashboard: () => void;
}

export function CompletedState({
  topic,
  summary,
  isExporting,
  exportError,
  onExportExcalidraw,
  onExportPNG,
  onBackToDashboard,
}: CompletedStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* Celebration Icon */}
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Completion Message */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Great Teaching!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          You&apos;ve helped me learn <span className="font-semibold text-green-600 dark:text-green-400">{topic}</span>!
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thank you for being such a patient teacher. The Feynman Technique really works - 
          by teaching me, you&apos;ve deepened your own understanding too!
        </p>

        {/* Key Concepts Badge */}
        {summary && summary.keyConceptsCovered.length > 0 && (
          <div className="mb-8 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Concepts Mastered:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {summary.keyConceptsCovered.map((concept, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Export Options */}
        <ExportButtons
          isExporting={isExporting}
          exportError={exportError}
          onExportExcalidraw={onExportExcalidraw}
          onExportPNG={onExportPNG}
        />

        {/* Back to Dashboard Button */}
        <button
          onClick={onBackToDashboard}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
