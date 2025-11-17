'use client';

export function InstructionsPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Instructions
      </h2>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li className="flex items-start">
          <span className="mr-2">✏️</span>
          <span>Draw diagrams to visualize the concepts</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">📝</span>
          <span>Write a detailed explanation in your own words</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">🔗</span>
          <span>Connect ideas and show relationships</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">🎯</span>
          <span>Focus on clarity and completeness</span>
        </li>
      </ul>
    </div>
  );
}
