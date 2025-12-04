'use client';

import { useEffect, useCallback } from 'react';
import { GraduationCap, PenTool, MessageCircle, Lightbulb, Sparkles } from 'lucide-react';

interface TeachingWelcomeScreenProps {
  topicName: string;
  onDismiss: () => void;
}

export function TeachingWelcomeScreen({ topicName, onDismiss }: TeachingWelcomeScreenProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onDismiss();
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onDismiss}
    >
      <div
        className="relative max-w-lg w-full mx-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.95);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out;
          }
        `}</style>
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <GraduationCap className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Welcome to the Teaching Canvas
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Teach <span className="font-semibold text-indigo-600 dark:text-indigo-400">&quot;{topicName}&quot;</span> by drawing and explaining
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-700/50">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Draw diagrams</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the toolbar to sketch concepts, flowcharts, or any visual aids
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-700/50">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Explain in chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Type your explanations in the chat panel on the right
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-700/50">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Get hints if stuck</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the hint button anytime you need guidance
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Start Teaching
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Press Enter, Space, or Escape to dismiss
        </p>
      </div>
    </div>
  );
}
