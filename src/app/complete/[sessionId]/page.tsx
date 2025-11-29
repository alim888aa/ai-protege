'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useEffect, useCallback } from 'react';
import { generateSummary, SummaryResponse } from '../../actions/generateSummary';

type CompletionState = 'loading' | 'summary' | 'completed' | 'error';

export default function CompletionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const session = useQuery(api.mutations.getSession, { sessionId });
  const markCompleteMutation = useMutation(api.mutations.markComplete);
  const saveSummaryMutation = useMutation(api.mutations.saveSummary);

  const [state, setState] = useState<CompletionState>('loading');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!session) return;

    // If summary already exists in session, use it (persist across refreshes)
    if (session.summary) {
      setSummary({
        summary: session.summary.text,
        keyConceptsCovered: session.summary.keyConceptsCovered,
        analogiesUsed: session.summary.analogiesUsed,
      });
      setState(session.completed ? 'completed' : 'summary');
      return;
    }

    // Generate new summary
    try {
      setState('loading');
      const result = await generateSummary(sessionId);
      setSummary(result);
      
      // Save summary to database for persistence
      await saveSummaryMutation({
        sessionId,
        summary: {
          text: result.summary,
          keyConceptsCovered: result.keyConceptsCovered,
          analogiesUsed: result.analogiesUsed,
        },
      });
      
      setState('summary');
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      setState('error');
    }
  }, [session, sessionId, saveSummaryMutation]);

  useEffect(() => {
    if (session && !summary && state === 'loading') {
      fetchSummary();
    }
  }, [session, summary, state, fetchSummary]);


  const handleCorrect = async () => {
    try {
      await markCompleteMutation({ sessionId });
      setState('completed');
    } catch (err) {
      console.error('Failed to mark complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to save completion');
    }
  };

  const handleClarify = () => {
    router.push(`/review/${sessionId}`);
  };

  const handleNewSession = () => {
    router.push('/');
  };

  // Loading state
  if (state === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generating Summary...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            I&apos;m thinking about everything you taught me. This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Session not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={handleNewSession}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }


  // Completed state - show celebration
  if (state === 'completed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Celebration Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Completion Message */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Great Teaching!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            You&apos;ve helped me learn <span className="font-semibold text-green-600 dark:text-green-400">{session.topic}</span>!
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for being such a patient teacher. The Feynman Technique really works - 
            by teaching me, you&apos;ve deepened your own understanding too!
          </p>

          {/* Key Concepts Badge */}
          {summary && summary.keyConceptsCovered.length > 0 && (
            <div className="mb-8 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Concepts Mastered:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {summary.keyConceptsCovered.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                  >
                    ✓ {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start New Session Button */}
          <button
            onClick={handleNewSession}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }


  // Summary state - show AI's summary with action buttons
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 page-transition">
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 animate-fadeIn">
          {/* Header with AI Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                I think I understand {session.topic} now!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let me explain it back to you...
              </p>
            </div>
          </div>

          {/* AI Summary */}
          {summary && (
            <div className="mb-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {summary.summary}
                  </p>
                </div>
              </div>

              {/* Analogies Used */}
              {summary.analogiesUsed.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    💡 Analogies that helped me understand:
                  </p>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 text-sm space-y-1">
                    {summary.analogiesUsed.map((analogy, index) => (
                      <li key={index}>{analogy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Concepts */}
              {summary.keyConceptsCovered.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summary.keyConceptsCovered.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Did I get it right?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleClarify}
                className="flex-1 px-6 py-4 border-2 border-amber-500 text-amber-600 dark:text-amber-400 rounded-xl font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 btn-press focus-ring-smooth"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Let me clarify...
                </span>
              </button>
              <button
                onClick={handleCorrect}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  That&apos;s correct!
                </span>
              </button>
            </div>
          </div>

          {/* Start New Session Link */}
          <div className="mt-6 text-center">
            <button
              onClick={handleNewSession}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm underline"
            >
              or start a new session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
