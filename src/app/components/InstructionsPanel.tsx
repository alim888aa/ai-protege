'use client';

import { PenTool, FileText, Link2, Target, Lightbulb } from 'lucide-react';

export function InstructionsPanel() {
  const instructions = [
    { icon: PenTool, text: 'Draw diagrams to visualize the concepts' },
    { icon: FileText, text: 'Write a detailed explanation in your own words' },
    { icon: Link2, text: 'Connect ideas and show relationships' },
    { icon: Target, text: 'Focus on clarity and completeness' },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Instructions</h2>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {instructions.map((item, index) => (
          <li
            key={index}
            className="flex items-start animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <item.icon className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <div
        className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 animate-fadeIn"
        style={{ animationDelay: '0.4s' }}
      >
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Click &quot;Done Explaining&quot; when ready, and the AI student will ask you
            questions!
          </span>
        </p>
      </div>
    </div>
  );
}
