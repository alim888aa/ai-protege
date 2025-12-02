'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { EvaluationResult } from '@/app/actions/evaluateTeaching';
import { ScoreDisplay } from './ScoreDisplay';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FeedbackSection } from './FeedbackSection';
import { QuestionsSection } from './QuestionsSection';

export function ResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Parse evaluation data from URL search params
      const encodedData = searchParams.get('data');
      if (!encodedData) {
        setError('No evaluation data found. Please complete a teaching session first.');
        return;
      }

      const decodedData = decodeURIComponent(encodedData);
      const parsedEvaluation = JSON.parse(decodedData) as EvaluationResult;
      setEvaluation(parsedEvaluation);
    } catch (err) {
      console.error('Error parsing evaluation data:', err);
      setError('Failed to load evaluation results. The data may be corrupted.');
    }
  }, [searchParams]);

  const handleStartNewSession = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error Loading Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleStartNewSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Teaching Evaluation Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s how you did teaching the AI
          </p>
        </div>

        <ScoreDisplay score={evaluation.overallScore} />
        <ScoreBreakdown evaluation={evaluation} />
        <FeedbackSection feedback={evaluation.feedback} />
        <QuestionsSection questions={evaluation.feedback.clarifyingQuestions} />

        {/* Start New Session Button */}
        <div className="text-center">
          <button
            onClick={handleStartNewSession}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg hover:shadow-xl"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
