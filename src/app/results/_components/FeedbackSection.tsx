interface FeedbackSectionProps {
  feedback: {
    unclearSections: string[];
    inaccuracies: string[];
    missingConcepts: string[];
    clarifyingQuestions: string[];
  };
}

export function FeedbackSection({ feedback }: FeedbackSectionProps) {
  const hasNoFeedback =
    feedback.unclearSections.length === 0 &&
    feedback.inaccuracies.length === 0 &&
    feedback.missingConcepts.length === 0;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Detailed Feedback
      </h2>

      <div className="space-y-6">
        {/* Unclear Sections */}
        {feedback.unclearSections.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              Unclear Sections
            </h3>
            <ul className="space-y-2">
              {feedback.unclearSections.map((section, idx) => (
                <li
                  key={idx}
                  className="text-gray-700 dark:text-gray-300 pl-4 border-l-4 border-yellow-400 py-2"
                >
                  {section}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Inaccuracies */}
        {feedback.inaccuracies.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
              <span className="mr-2">❌</span>
              Inaccuracies
            </h3>
            <ul className="space-y-2">
              {feedback.inaccuracies.map((inaccuracy, idx) => (
                <li
                  key={idx}
                  className="text-gray-700 dark:text-gray-300 pl-4 border-l-4 border-red-400 py-2"
                >
                  {inaccuracy}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Concepts */}
        {feedback.missingConcepts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
              <span className="mr-2">📝</span>
              Missing Concepts
            </h3>
            <ul className="space-y-2">
              {feedback.missingConcepts.map((concept, idx) => (
                <li
                  key={idx}
                  className="text-gray-700 dark:text-gray-300 pl-4 border-l-4 border-blue-400 py-2"
                >
                  {concept}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show positive message if no feedback */}
        {hasNoFeedback && (
          <div className="text-center py-8">
            <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✅</div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Great job! Your teaching was clear, accurate, and complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
