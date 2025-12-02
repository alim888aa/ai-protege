import { SummaryResponse } from '../../../actions/generateSummary';
import { ExportButtons } from './ExportButtons';

interface SummaryStateProps {
  topic: string;
  summary: SummaryResponse | null;
  isExporting: string | null;
  exportError: string | null;
  onCorrect: () => void;
  onClarify: () => void;
  onExportExcalidraw: () => void;
  onExportPNG: () => void;
  onBackToDashboard: () => void;
}

export function SummaryState({
  topic,
  summary,
  isExporting,
  exportError,
  onCorrect,
  onClarify,
  onExportExcalidraw,
  onExportPNG,
  onBackToDashboard,
}: SummaryStateProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 page-transition">
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 animate-fadeIn">
          {/* Header with AI Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                I think I understand {topic} now!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let me explain it back to you...
              </p>
            </div>
          </div>

          {/* AI Summary */}
          {summary && (
            <div className="mb-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {summary.summary}
                  </p>
                </div>
              </div>

              {/* Analogies Used */}
              {summary.analogiesUsed.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                    </svg>
                    Analogies that helped me understand:
                  </p>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 text-sm space-y-1">
                    {summary.analogiesUsed.map((analogy, index) => (
                      <li key={index}>{analogy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Concepts */}
              {summary.keyConceptsCovered.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summary.keyConceptsCovered.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Did I get it right?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onClarify}
                className="flex-1 px-6 py-4 border-2 border-amber-500 text-amber-600 dark:text-amber-400 rounded-xl font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 btn-press focus-ring-smooth"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Let me clarify...
                </span>
              </button>
              <button
                onClick={onCorrect}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  That&apos;s correct!
                </span>
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <ExportButtons
              isExporting={isExporting}
              exportError={exportError}
              onExportExcalidraw={onExportExcalidraw}
              onExportPNG={onExportPNG}
              variant="compact"
            />
          </div>

          {/* Back to Dashboard Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToDashboard}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm underline"
            >
              or go back to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
