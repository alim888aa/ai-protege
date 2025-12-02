import { getScoreColor } from './utils';

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 mb-8 text-center">
      <div className="mb-4">
        <span className="text-gray-600 dark:text-gray-400 text-xl font-medium">
          Overall Score
        </span>
      </div>
      <div className={`text-8xl font-bold ${getScoreColor(score)} mb-4`}>
        {score}
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-lg">out of 100</div>
    </div>
  );
}
