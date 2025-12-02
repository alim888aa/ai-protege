interface ExportButtonsProps {
  isExporting: string | null;
  exportError: string | null;
  onExportExcalidraw: () => void;
  onExportPNG: () => void;
  variant?: 'default' | 'compact';
}

export function ExportButtons({
  isExporting,
  exportError,
  onExportExcalidraw,
  onExportPNG,
  variant = 'default',
}: ExportButtonsProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div className={isCompact ? '' : 'mb-8 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg'}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
        Download your study notes:
      </p>
      {exportError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3 text-center">{exportError}</p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onExportExcalidraw}
          disabled={isExporting !== null}
          className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting === 'excalidraw' ? 'Exporting...' : isCompact ? 'Excalidraw' : 'Download as Excalidraw'}
        </button>
        <button
          onClick={onExportPNG}
          disabled={isExporting !== null}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isExporting === 'png' ? 'Exporting...' : isCompact ? 'PNG' : 'Download as PNG'}
        </button>
      </div>
    </div>
  );
}
