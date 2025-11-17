'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { EvaluationResult } from '@/app/actions/evaluateTeaching';

function ResultsContent() {
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

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Helper function to get progress bar color
  const getProgressBarColor = (score: number): string => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
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
            Here's how you did teaching the AI
          </p>
        </div>

        {/* Overall Score - Large Display */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-12 mb-8 text-center">
          <div className="mb-4">
            <span className="text-gray-600 dark:text-gray-400 text-xl font-medium">
              Overall Score
            </span>
          </div>
          <div className={`text-8xl font-bold ${getScoreColor(evaluation.overallScore)} mb-4`}>
            {evaluation.overallScore}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-lg">out of 100</div>
        </div>

        {/* Score Breakdowns */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Score Breakdown
          </h2>
          
          <div className="space-y-6">
            {/* Clarity Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Clarity
                </span>
                <span className={`text-lg font-bold ${getScoreColor(evaluation.clarityScore)}`}>
                  {evaluation.clarityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getProgressBarColor(evaluation.clarityScore)} transition-all duration-500`}
                  style={{ width: `${evaluation.clarityScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                How well you explained concepts
              </p>
            </div>

            {/* Accuracy Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Accuracy
                </span>
                <span className={`text-lg font-bold ${getScoreColor(evaluation.accuracyScore)}`}>
                  {evaluation.accuracyScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getProgressBarColor(evaluation.accuracyScore)} transition-all duration-500`}
                  style={{ width: `${evaluation.accuracyScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Factual correctness of your teaching
              </p>
            </div>

            {/* Completeness Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Completeness
                </span>
                <span className={`text-lg font-bold ${getScoreColor(evaluation.completenessScore)}`}>
                  {evaluation.completenessScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getProgressBarColor(evaluation.completenessScore)} transition-all duration-500`}
                  style={{ width: `${evaluation.completenessScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Coverage of key concepts from source
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Detailed Feedback
          </h2>

          <div className="space-y-6">
            {/* Unclear Sections */}
            {evaluation.feedback.unclearSections.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Unclear Sections
                </h3>
                <ul className="space-y-2">
                  {evaluation.feedback.unclearSections.map((section, idx) => (
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
            {evaluation.feedback.inaccuracies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                  <span className="mr-2">❌</span>
                  Inaccuracies
                </h3>
                <ul className="space-y-2">
                  {evaluation.feedback.inaccuracies.map((inaccuracy, idx) => (
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
            {evaluation.feedback.missingConcepts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                  <span className="mr-2">📝</span>
                  Missing Concepts
                </h3>
                <ul className="space-y-2">
                  {evaluation.feedback.missingConcepts.map((concept, idx) => (
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
            {evaluation.feedback.unclearSections.length === 0 &&
              evaluation.feedback.inaccuracies.length === 0 &&
              evaluation.feedback.missingConcepts.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✅</div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                    Great job! Your teaching was clear, accurate, and complete.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Questions to Consider - Frankenstein Element */}
        {evaluation.feedback.clarifyingQuestions.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-8 mb-8 border-2 border-purple-200 dark:border-purple-700">
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-4 flex items-center">
              <span className="mr-2">🤔</span>
              Questions to Consider
            </h2>
            <p className="text-purple-800 dark:text-purple-300 mb-4 text-sm">
              These questions highlight differences between your visual and textual explanations
            </p>
            <ul className="space-y-3">
              {evaluation.feedback.clarifyingQuestions.map((question, idx) => (
                <li
                  key={idx}
                  className="text-purple-900 dark:text-purple-200 pl-4 border-l-4 border-purple-400 py-2 bg-white/50 dark:bg-zinc-800/50 rounded-r"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}

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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading results...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
