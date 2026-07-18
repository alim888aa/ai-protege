interface QuestionsSectionProps {
  questions: string[];
}

export function QuestionsSection({ questions }: QuestionsSectionProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-8 mb-8 border-2 border-violet-200 dark:border-violet-700">
      <h2 className="text-2xl font-bold text-violet-900 dark:text-violet-200 mb-4 flex items-center">
        <span className="mr-2">🤔</span>
        Questions to Consider
      </h2>
      <p className="text-violet-800 dark:text-violet-300 mb-4 text-sm">
        These questions highlight differences between your visual and textual explanations
      </p>
      <ul className="space-y-3">
        {questions.map((question, idx) => (
          <li
            key={idx}
            className="text-violet-900 dark:text-violet-200 pl-4 border-l-4 border-violet-400 py-2 bg-white/50 dark:bg-zinc-800/50 rounded-r"
          >
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
}
