'use client';

export function InstructionsPanel() {
  const instructions = [
    { emoji: '✏️', text: 'Draw diagrams to visualize the concepts' },
    { emoji: '📝', text: 'Write a detailed explanation in your own words' },
    { emoji: '🔗', text: 'Connect ideas and show relationships' },
    { emoji: '🎯', text: 'Focus on clarity and completeness' },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Instructions
      </h2>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {instructions.map((item, index) => (
          <li 
            key={index}
            className="flex items-start animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="mr-2">{item.emoji}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> Click "Done Explaining" when ready, and the AI student will ask you questions!
        </p>
      </div>
    </div>
  );
}
