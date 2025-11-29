'use client';

import { Editor } from 'tldraw';
import { DrawingCanvas } from '@/app/components/DrawingCanvas';
import { JargonHighlightedTextarea } from '@/app/components/JargonHighlightedTextarea';

const CHARACTER_LIMIT = 5000;

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface LeftPanelProps {
  sessionId: string;
  topic: string;
  currentConcept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  textExplanation: string;
  isSubmitting: boolean;
  onTextChange: (value: string) => void;
  onEditorMount: (editor: Editor) => void;
}

export function LeftPanel({
  sessionId,
  topic,
  currentConcept,
  conceptIndex,
  totalConcepts,
  textExplanation,
  isSubmitting,
  onTextChange,
  onEditorMount,
}: LeftPanelProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= CHARACTER_LIMIT) {
      onTextChange(e.target.value);
    }
  };

  return (
    <div className="w-[60%] flex flex-col border-r border-gray-300 dark:border-zinc-700 animate-fadeIn">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700 px-6 py-4">
        {/* Progress Indicator - Prominent styling */}
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full transition-all duration-300">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              Concept {conceptIndex + 1}/{totalConcepts}
            </span>
          </div>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {currentConcept.title}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teach the AI: {topic}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {currentConcept.description}
        </p>
      </header>

      {/* Canvas */}
      <div className="h-[60%] border-b border-gray-300 dark:border-zinc-700">
        <DrawingCanvas onEditorMount={onEditorMount} />
      </div>

      {/* Text Area */}
      <div className="h-[40%]">
        <JargonHighlightedTextarea
          sessionId={sessionId}
          value={textExplanation}
          onChange={handleTextChange}
          characterLimit={CHARACTER_LIMIT}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
