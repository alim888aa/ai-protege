'use client';

import { TopicInputStep } from './TopicInputStep';
import { SourceSelectionStep, type SourceType } from './SourceSelectionStep';

export type Step = 'topic' | 'source';

export interface NewLessonCardProps {
  step: Step;
  topic: string;
  setTopic: (topic: string) => void;
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  sourceUrl: string;
  setSourceUrl: (url: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  isProcessing: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  onStart: () => void;
}

export function NewLessonCard({
  step,
  topic,
  setTopic,
  sourceType,
  setSourceType,
  sourceUrl,
  setSourceUrl,
  pdfFile,
  setPdfFile,
  isProcessing,
  error,
  setError,
  onNext,
  onBack,
  onStart,
}: NewLessonCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 mb-12 max-w-xl mx-auto h-[320px] overflow-hidden relative">
      {/* Topic Input Step */}
      <div
        className={`absolute inset-0 p-8 transition-all duration-300 ease-out ${
          step === 'topic' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <TopicInputStep topic={topic} setTopic={setTopic} onNext={onNext} />
      </div>
      {/* Source Selection Step */}
      <div
        className={`absolute inset-0 p-8 transition-all duration-300 ease-out ${
          step === 'source' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <SourceSelectionStep
          topic={topic}
          sourceType={sourceType}
          setSourceType={setSourceType}
          sourceUrl={sourceUrl}
          setSourceUrl={setSourceUrl}
          pdfFile={pdfFile}
          setPdfFile={setPdfFile}
          isProcessing={isProcessing}
          error={error}
          setError={setError}
          onBack={onBack}
          onStart={onStart}
        />
      </div>
    </div>
  );
}
