'use client';

import { useRef } from 'react';
import { Globe, FileText, PenLine, CheckCircle2, Info, Loader2 } from 'lucide-react';

export type SourceType = 'url' | 'pdf' | 'none';

export interface SourceSelectionStepProps {
  topic: string;
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  sourceUrl: string;
  setSourceUrl: (url: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  isProcessing: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onBack: () => void;
  onStart: () => void;
}

export function SourceSelectionStep({
  topic,
  sourceType,
  setSourceType,
  sourceUrl,
  setSourceUrl,
  pdfFile,
  setPdfFile,
  isProcessing,
  error,
  setError,
  onBack,
  onStart,
}: SourceSelectionStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        setPdfFile(null);
        return;
      }
      if (file.size > 1024 * 1024) {
        setError('PDF file is too large. Maximum size is 1MB.');
        setPdfFile(null);
        return;
      }
      setError(null);
      setPdfFile(file);
    }
  };

  const isStartDisabled =
    isProcessing ||
    !topic.trim() ||
    (sourceType === 'url' && !sourceUrl.trim()) ||
    (sourceType === 'pdf' && !pdfFile);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
          Select your source material
        </h2>

        {/* Source Type Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Web URL Option */}
          <button
            type="button"
            onClick={() => {
              setSourceType('url');
              setError(null);
            }}
            disabled={isProcessing}
            className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
              sourceType === 'url'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-zinc-700 hover:border-blue-300 dark:hover:border-blue-500'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {sourceType === 'url' && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div
              className={`p-1.5 rounded-lg mb-1 ${sourceType === 'url' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-zinc-600'}`}
            >
              <Globe
                className={`w-5 h-5 ${sourceType === 'url' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              />
            </div>
            <span
              className={`text-xs font-medium ${sourceType === 'url' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Web URL
            </span>
          </button>

          {/* PDF Upload Option */}
          <button
            type="button"
            onClick={() => {
              setSourceType('pdf');
              setError(null);
            }}
            disabled={isProcessing}
            className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
              sourceType === 'pdf'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-zinc-700 hover:border-blue-300 dark:hover:border-blue-500'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {sourceType === 'pdf' && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div
              className={`p-1.5 rounded-lg mb-1 ${sourceType === 'pdf' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-zinc-600'}`}
            >
              <FileText
                className={`w-5 h-5 ${sourceType === 'pdf' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              />
            </div>
            <span
              className={`text-xs font-medium ${sourceType === 'pdf' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              PDF
            </span>
          </button>

          {/* Manual Option */}
          <button
            type="button"
            onClick={() => {
              setSourceType('none');
              setError(null);
            }}
            disabled={isProcessing}
            className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
              sourceType === 'none'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-zinc-700 hover:border-blue-300 dark:hover:border-blue-500'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {sourceType === 'none' && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div
              className={`p-1.5 rounded-lg mb-1 ${sourceType === 'none' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-zinc-600'}`}
            >
              <PenLine
                className={`w-5 h-5 ${sourceType === 'none' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              />
            </div>
            <span
              className={`text-xs font-medium ${sourceType === 'none' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Manual
            </span>
          </button>
        </div>

        {/* URL Input */}
        {sourceType === 'url' && (
          <div className="mb-3 flex justify-center">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isProcessing}
              className="w-4/5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>
        )}

        {/* PDF Upload */}
        {sourceType === 'pdf' && (
          <div className="mb-3 flex justify-center">
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`w-4/5 px-3 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                pdfFile
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
              />
              {pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium truncate max-w-[150px]">{pdfFile.name}</span>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  <p>Click to upload PDF (max 1MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Info */}
        {sourceType === 'none' && (
          <div className="mb-3 flex justify-center">
            <div className="w-4/5 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  You'll define your own concepts. The AI will use general knowledge to help you learn.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onStart}
          disabled={isStartDisabled}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            'Start'
          )}
        </button>
      </div>
    </div>
  );
}
