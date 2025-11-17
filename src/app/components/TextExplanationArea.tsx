'use client';

interface TextExplanationAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  characterLimit: number;
  disabled?: boolean;
}

export function TextExplanationArea({
  value,
  onChange,
  characterLimit,
  disabled = false,
}: TextExplanationAreaProps) {
  const characterCount = value.length;

  return (
    <div className="h-full bg-white dark:bg-zinc-800 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-300 dark:border-zinc-700 flex justify-between items-center">
        <label
          htmlFor="explanation"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Text Explanation
        </label>
        <span
          className={`text-sm font-medium ${
            characterCount > characterLimit * 0.9
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {characterCount} / {characterLimit}
        </span>
      </div>
      <textarea
        id="explanation"
        value={value}
        onChange={onChange}
        placeholder="Explain the topic in your own words. Describe what you drew and how the concepts connect..."
        disabled={disabled}
        className="flex-1 px-6 py-4 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
