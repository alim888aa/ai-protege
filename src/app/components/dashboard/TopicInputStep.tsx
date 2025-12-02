'use client';

export interface TopicInputStepProps {
  topic: string;
  setTopic: (topic: string) => void;
  onNext: () => void;
}

export function TopicInputStep({ topic, setTopic, onNext }: TopicInputStepProps) {
  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-full max-w-md">
        <label
          htmlFor="topic"
          className="block text-lg font-medium text-gray-900 dark:text-white mb-4 text-center"
        >
          What topic would you like to learn?
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., React Hooks, Photosynthesis"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && topic.trim()) {
              onNext();
            }
          }}
        />
      </div>
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!topic.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
