'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSummary, generateSummaryFromData, SummaryResponse } from '../../../actions/generateSummary';
import { getCachedSessionData, clearSessionCache, CachedSessionData } from '../../../utils/sessionCache';
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

  // Try to get cached session data first (from navigation)
  const cachedData = useRef<CachedSessionData | null>(null);
  if (cachedData.current === null) {
    cachedData.current = getCachedSessionData(sessionId);
  }

  // Only query Convex if no cached data (page refresh / direct URL access)
  const session = useQuery(
    api.mutations.getSession,
    cachedData.current ? 'skip' : { sessionId }
  );
  
  const markCompleteMutation = useMutation(api.mutations.markComplete);
  const saveSummaryMutation = useMutation(api.mutations.saveSummary);

  const [state, setState] = useState<CompletionState>('loading');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [sessionTopic, setSessionTopic] = useState<string>('');
  const [sessionExplanations, setSessionExplanations] = useState<CachedSessionData['explanations']>([]);
  const hasFetchedRef = useRef(false);

  // Generate summary from cached data (fast path)
  const generateFromCache = useCallback(async (data: CachedSessionData) => {
    // If summary already exists in cache, use it
    if (data.summary) {
      setSummary({
        summary: data.summary.text,
        keyConceptsCovered: data.summary.keyConceptsCovered,
        analogiesUsed: data.summary.analogiesUsed,
      });
      setSessionTopic(data.topic);
      setSessionExplanations(data.explanations);
      setState(data.completed ? 'completed' : 'summary');
      return;
    }

    try {
      setState('loading');
      setSessionTopic(data.topic);
      setSessionExplanations(data.explanations);
      
      // Generate summary using cached data (no Convex fetch needed)
      const result = await generateSummaryFromData(data);
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
      
      // Clear cache after successful save
      clearSessionCache(sessionId);
      setState('summary');
    } catch (err) {
      console.error('Failed to generate summary from cache:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      setState('error');
    }
  }, [sessionId, saveSummaryMutation]);

  // Generate summary from Convex data (fallback path)
  const generateFromConvex = useCallback(async (currentSession: NonNullable<typeof session>) => {
    // If summary already exists in session, use it
    if (currentSession.summary) {
      setSummary({
        summary: currentSession.summary.text,
        keyConceptsCovered: currentSession.summary.keyConceptsCovered,
        analogiesUsed: currentSession.summary.analogiesUsed,
      });
      setSessionTopic(currentSession.topic);
      setSessionExplanations(currentSession.explanations ?? []);
      setState(currentSession.completed ? 'completed' : 'summary');
      return;
    }

    try {
      setState('loading');
      setSessionTopic(currentSession.topic);
      setSessionExplanations(currentSession.explanations ?? []);
      
      const result = await generateSummary(sessionId);
      setSummary(result);
      
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
  }, [sessionId, saveSummaryMutation]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    
    // Fast path: use cached data
    if (cachedData.current) {
      hasFetchedRef.current = true;
      generateFromCache(cachedData.current);
      return;
    }
    
    // Fallback: wait for Convex data
    if (session && state === 'loading') {
      hasFetchedRef.current = true;
      generateFromConvex(session);
    }
  }, [session, state, generateFromCache, generateFromConvex]);

  /**
   * Load all canvas elements from session explanations
   */
  const loadCanvasElements = useCallback((): TopicTaggedElement[] => {
    if (sessionExplanations.length === 0) return [];
    
    const allElements: TopicTaggedElement[] = [];
    
    for (const explanation of sessionExplanations) {
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
  }, [sessionExplanations]);

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
      
      const filename = sessionTopic || 'ai-protege-session';
      
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
  }, [loadCanvasElements, sessionTopic]);

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

  // Loading state - show while waiting for data or generating summary
  if (state === 'loading') {
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
        topic={sessionTopic}
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
      topic={sessionTopic}
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
