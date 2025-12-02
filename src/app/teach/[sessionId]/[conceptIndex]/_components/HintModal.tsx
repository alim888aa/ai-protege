'use client';

import React, { useEffect, useRef } from 'react';
import { Lightbulb, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: (string | null)[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onGenerateHint: (hintNumber: number) => void;
  isGenerating: boolean;
  streamingHint: string;
}

export function HintModal({
  isOpen,
  onClose,
  hints,
  currentPage,
  onPageChange,
  onGenerateHint,
  isGenerating,
  streamingHint,
}: HintModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHint = hints[currentPage];
  const totalHints = 3;
  const generatedCount = hints.filter((h) => h !== null).length;
  const allHintsUsed = generatedCount >= totalHints;
  const needsGeneration = currentHint === null && !isGenerating;
  const isCurrentlyStreaming = isGenerating && currentPage === generatedCount;

  const displayContent = isCurrentlyStreaming ? streamingHint : currentHint || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 id="hint-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Hint
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            aria-label="Close hint modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-[200px]">
          {needsGeneration && currentPage > 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                Ready to generate hint {currentPage + 1}?
              </p>
              <button
                onClick={() => onGenerateHint(currentPage + 1)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Generate Hint
              </button>
            </div>
          ) : displayContent ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {displayContent}
                {isCurrentlyStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-amber-500 rounded-sm animate-pulse" />
                )}
              </p>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Generating hint...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <p className="text-gray-500 dark:text-gray-400">No hint available yet.</p>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 rounded-b-xl">
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous hint"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
              {currentPage + 1} / {totalHints}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalHints - 1}
              className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next hint"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Status indicator */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {allHintsUsed ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">No more hints available</span>
            ) : (
              <span>
                {generatedCount} of {totalHints} hints used
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
