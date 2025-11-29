'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { extractConcepts } from './actions/extractConcepts';

export default function Home() {
  const router = useRouter();
  const scrapeSource = useAction(api.actions.scrapeSource.scrapeSource);
  const updateConceptsInSourceMaterial = useMutation(api.mutations.updateConceptsInSourceMaterial);

  const [topic, setTopic] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL validation function
  const validateUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP/HTTPS
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return 'Only HTTP and HTTPS URLs are supported.';
      }

      // Block localhost and private IPs
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return 'Cannot use localhost or private IP addresses.';
      }

      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    if (!sourceUrl.trim()) {
      setError('Please enter a source URL.');
      return;
    }

    // Validate URL format
    const urlError = validateUrl(sourceUrl);
    if (urlError) {
      setError(urlError);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Scrape the source material
      const result = await scrapeSource({
        topic: topic.trim(),
        sourceUrl: sourceUrl.trim(),
      });

      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      if (!result.sessionId || !result.sourceText) {
        setError('Failed to create session. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Step 2: Extract concepts from the scraped content
      try {
        const concepts = await extractConcepts(topic.trim(), result.sourceText);
        
        if (!concepts || concepts.length === 0) {
          setError('Failed to extract concepts from the source material. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Step 3: Store concepts in the sourceMaterial table
        await updateConceptsInSourceMaterial({
          sessionId: result.sessionId,
          concepts: concepts,
        });

        // Step 4: Navigate to concept review screen with sessionId
        router.push(`/review/${result.sessionId}`);
      } catch (conceptError) {
        setError(
          conceptError instanceof Error
            ? `Failed to extract concepts: ${conceptError.message}`
            : 'Failed to extract concepts. Please try again.'
        );
        setIsProcessing(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 page-transition">
      <div className="w-full max-w-2xl mx-auto px-6 py-16 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Protégé
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Learn by teaching. Master concepts through the Feynman Technique.
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Get Started
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                What topic do you want to learn?
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Neural Networks, Quantum Computing"
                disabled={isProcessing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Source URL Input */}
            <div>
              <label
                htmlFor="sourceUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Source material URL
              </label>
              <input
                id="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
                disabled={isProcessing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Provide a link to an article, documentation, or webpage about your topic.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isProcessing && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Processing your source material...
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      This may take 5-15 seconds. We're scraping the content and preparing it for your teaching session.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || !topic.trim() || !sourceUrl.trim()}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start Teaching
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You'll teach the AI about your topic using drawings and text explanations.
          </p>
        </div>
      </div>
    </div>
  );
}
