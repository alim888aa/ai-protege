import type { EvaluationResult } from '@/app/actions/evaluateTeaching';
import { getScoreColor, getProgressBarColor } from './utils';

interface ScoreBreakdownProps {
  evaluation: EvaluationResult;
}

interface ScoreItemProps {
  label: string;
  score: number;
  description: string;
}

function ScoreItem({ label, score, description }: ScoreItemProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {label}
        </span>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${getProgressBarColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
}

export function ScoreBreakdown({ evaluation }: ScoreBreakdownProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Score Breakdown
      </h2>
      
      <div className="space-y-6">
        <ScoreItem
          label="Clarity"
          score={evaluation.clarityScore}
          description="How well you explained concepts"
        />
        <ScoreItem
          label="Accuracy"
          score={evaluation.accuracyScore}
          description="Factual correctness of your teaching"
        />
        <ScoreItem
          label="Completeness"
          score={evaluation.completenessScore}
          description="Coverage of key concepts from source"
        />
      </div>
    </div>
  );
}
