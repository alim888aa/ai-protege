'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useState, useEffect, useCallback } from 'react';
import { generateSummary, SummaryResponse } from '../../../actions/generateSummary';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { CompletedState } from './CompletedState';
import { SummaryState } from './SummaryState';
import { TopicTaggedElement } from '../../../utils/topicAreaManager';

type CompletionState = 'loading' | 'summary' | 'completed' | 'error';

interface CompletionClientProps {
  sessionId: string;
}

export function CompletionClient({ sessionId }: CompletionClientProps) {
  const router = useRouter();

  const session = useQuery(api.mutations.getSession, { sessionId });
  const markCompleteMutation = useMutation(api.mutations.markComplete);
  const saveSummaryMutation = useMutation(api.mutations.saveSummary);

  const [state, setState] = useState<CompletionState>('loading');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

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

  /**
   * Load all canvas elements from session explanations
   */
  const loadCanvasElements = useCallback((): TopicTaggedElement[] => {
    if (!session?.explanations) return [];
    
    const allElements: TopicTaggedElement[] = [];
    
    for (const explanation of session.explanations) {
      if (explanation.canvasData) {
        try {
          const parsed = JSON.parse(explanation.canvasData);
          const elements = Array.isArray(parsed) ? parsed : parsed.elements || [];
          allElements.push(...elements);
        } catch (e) {
          console.error('Failed to parse canvas data:', e);
        }
      }
    }
    
    return allElements;
  }, [session]);

  const handleExport = useCallback(async (type: 'excalidraw' | 'png') => {
    setIsExporting(type);
    setExportError(null);
    
    try {
      const elements = loadCanvasElements();
      if (elements.length === 0) {
        setExportError('No drawings to export');
        setIsExporting(null);
        return;
      }
      
      const filename = session?.topic || 'ai-protege-session';
      
      if (type === 'excalidraw') {
        const { exportToExcalidrawFile } = await import('../../../utils/sessionExport');
        exportToExcalidrawFile(elements, filename);
      } else {
        const { exportToPNG } = await import('../../../utils/sessionExport');
        await exportToPNG(elements, filename);
      }
    } catch (e) {
      console.error('Export failed:', e);
      setExportError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setIsExporting(null);
    }
  }, [loadCanvasElements, session?.topic]);

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

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (state === 'loading' || !session) {
    return <LoadingState />;
  }

  // Error state
  if (state === 'error') {
    return <ErrorState error={error} onBackToDashboard={handleBackToDashboard} />;
  }

  // Completed state
  if (state === 'completed') {
    return (
      <CompletedState
        topic={session.topic}
        summary={summary}
        isExporting={isExporting}
        exportError={exportError}
        onExportExcalidraw={() => handleExport('excalidraw')}
        onExportPNG={() => handleExport('png')}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Summary state
  return (
    <SummaryState
      topic={session.topic}
      summary={summary}
      isExporting={isExporting}
      exportError={exportError}
      onCorrect={handleCorrect}
      onClarify={handleClarify}
      onExportExcalidraw={() => handleExport('excalidraw')}
      onExportPNG={() => handleExport('png')}
      onBackToDashboard={handleBackToDashboard}
    />
  );
}
