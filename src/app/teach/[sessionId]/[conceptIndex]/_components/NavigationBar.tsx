'use client';

import React from 'react';
import { Home, ChevronRight, Check } from 'lucide-react';

interface NavigationBarProps {
  topicName: string;
  currentIndex: number;
  totalTopics: number;
  canProceed: boolean;
  isLastTopic: boolean;
  onNextTopic: () => void;
  onCompleteSession: () => void;
  onBackToDashboard: () => void;
}

export function NavigationBar({
  topicName,
  currentIndex,
  totalTopics,
  canProceed,
  isLastTopic,
  onNextTopic,
  onCompleteSession,
  onBackToDashboard,
}: NavigationBarProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 px-4 py-3 animate-fadeIn">
      {/* Back to Dashboard */}
      <button
        onClick={onBackToDashboard}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
        title="Back to Dashboard"
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200 dark:bg-zinc-600" />

      {/* Topic progress */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
          {topicName}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Topic {currentIndex + 1}/{totalTopics}
        </span>
      </div>

      {/* Navigation button */}
      {canProceed && (
        <button
          onClick={isLastTopic ? onCompleteSession : onNextTopic}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors btn-press flex items-center gap-2"
        >
          {isLastTopic ? (
            <>
              Complete Session
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              Next Topic
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
