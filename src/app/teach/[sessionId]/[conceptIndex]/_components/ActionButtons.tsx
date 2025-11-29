'use client';

import { MutableRefObject } from 'react';
import { Editor } from 'tldraw';
import { exportCanvasToBase64 } from '@/app/utils/canvasExport';
import { generateDialogueResponse } from '@/app/actions/generateDialogueResponse';
import { generateHint } from '@/app/actions/generateHint';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface Dialogue {
  conceptId: string;
  messages: { role: string; content: string; timestamp: number; type?: 'hint' | 'message' }[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface ActionButtonsProps {
  sessionId: string;
  currentConcept: Concept;
  currentDialogue?: Dialogue;
  dialogueMessages: Message[];
  textExplanation: string;
  editorRef: MutableRefObject<Editor | null>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isStreamingResponse: boolean;
  setIsStreamingResponse: (value: boolean) => void;
  setStreamingContent: (value: string) => void;
  setError: (value: string | null) => void;
  showMoveToNext: boolean;
  showHintButton: boolean;
  hintCount: number;
  setHintCount: (value: number) => void;
  isGeneratingHint: boolean;
  setIsGeneratingHint: (value: boolean) => void;
  ragChunks: Array<{ text: string; similarity: number; index: number }>;
  setRagChunks: (value: Array<{ text: string; similarity: number; index: number }>) => void;
  resetTimer: () => void;
  retrieveRelevantChunks: (args: { sessionId: string; textExplanation: string }) => Promise<Array<{ text: string; similarity: number; index: number }>>;
  saveExplanation: (args: { sessionId: string; conceptId: string; textExplanation: string; canvasData?: string }) => Promise<null>;
  onMoveToNext: () => void;
  conceptIndex: number;
  totalConcepts: number;
}

export function ActionButtons({
  sessionId,
  currentConcept,
  currentDialogue,
  textExplanation,
  editorRef,
  isSubmitting,
  setIsSubmitting,
  setIsStreamingResponse,
  setStreamingContent,
  setError,
  showMoveToNext,
  showHintButton,
  hintCount,
  setHintCount,
  isGeneratingHint,
  setIsGeneratingHint,
  ragChunks,
  setRagChunks,
  resetTimer,
  retrieveRelevantChunks,
  saveExplanation,
  onMoveToNext,
  conceptIndex,
  totalConcepts,
}: ActionButtonsProps) {
  const handleDoneExplaining = async () => {
    if (!textExplanation.trim() || !editorRef.current) {
      setError('Please provide a text explanation before submitting.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setIsStreamingResponse(true);
    setStreamingContent('');

    try {
      // Save explanation
      const shapeIds = Array.from(editorRef.current.getCurrentPageShapeIds());
      const shapes = shapeIds.map((id) => editorRef.current!.getShape(id));

      await saveExplanation({
        sessionId,
        conceptId: currentConcept.id,
        textExplanation,
        canvasData: JSON.stringify(shapes),
      });

      // Export canvas
      let canvasImageBase64 = '';
      try {
        canvasImageBase64 = await exportCanvasToBase64(editorRef.current);
      } catch {
        console.warn('Canvas export failed');
      }

      // Get RAG chunks
      const chunks = await retrieveRelevantChunks({ sessionId, textExplanation });
      setRagChunks(chunks);

      // Generate AI response
      const fullResponse = await generateDialogueResponse(
        currentConcept,
        [{ role: 'user', content: `I've drawn a diagram and written an explanation:\n\n${textExplanation}` }],
        chunks,
        (text) => setStreamingContent(text),
        canvasImageBase64
      );

      const aiMessage = { role: 'ai' as const, content: fullResponse, timestamp: Date.now() };

      await fetch('/api/saveDialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conceptId: currentConcept.id,
          messages: [...(currentDialogue?.messages || []), aiMessage],
        }),
      });

      setStreamingContent('');
      resetTimer();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
      setIsStreamingResponse(false);
    }
  };

  const handleRequestHint = async () => {
    setIsGeneratingHint(true);
    setError(null);
    const newHintCount = hintCount + 1;
    setHintCount(newHintCount);

    try {
      let chunks = ragChunks;
      if (chunks.length === 0) {
        chunks = await retrieveRelevantChunks({
          sessionId,
          textExplanation: textExplanation || currentConcept.description,
        });
        setRagChunks(chunks);
      }

      const hintResponse = await generateHint(
        currentConcept,
        currentDialogue?.messages || [],
        newHintCount,
        chunks,
        textExplanation
      );

      const hintMessage = { 
        role: 'ai' as const, 
        content: hintResponse.hint, 
        timestamp: Date.now(),
        type: 'hint' as const,
      };

      await fetch('/api/saveDialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conceptId: currentConcept.id,
          messages: [...(currentDialogue?.messages || []), hintMessage],
        }),
      });

      resetTimer();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate hint.');
    } finally {
      setIsGeneratingHint(false);
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-zinc-700 px-6 py-4 space-y-3">
      {/* Hint Button */}
      {showHintButton && !isSubmitting && hintCount < 3 && (
        <button
          onClick={handleRequestHint}
          disabled={isGeneratingHint}
          className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg btn-press animate-fadeIn"
        >
          {isGeneratingHint ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Hint...
            </span>
          ) : '💡 Need a Hint?'}
        </button>
      )}

      {/* Out of Hints */}
      {showHintButton && !isSubmitting && hintCount >= 3 && (
        <div className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-700 rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-center animate-fadeIn">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🎯 Out of hints! Try your best or click "Done Explaining" to continue.
          </p>
        </div>
      )}

      {/* Done Explaining */}
      <button
        onClick={handleDoneExplaining}
        disabled={isSubmitting || !textExplanation.trim()}
        className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : 'Done Explaining'}
      </button>

      {/* Move to Next */}
      {showMoveToNext && (
        <button
          onClick={onMoveToNext}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl btn-press focus-ring-smooth animate-fadeIn"
        >
          <span className="flex items-center justify-center gap-2">
            {conceptIndex + 1 < totalConcepts ? 'Move to Next Concept' : 'Complete Teaching'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
