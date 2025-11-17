'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Editor } from 'tldraw';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { DrawingCanvas } from '@/app/components/DrawingCanvas';
import { TextExplanationArea } from '@/app/components/TextExplanationArea';
import { InstructionsPanel } from '@/app/components/InstructionsPanel';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { ErrorDisplay } from '@/app/components/ErrorDisplay';
import { exportCanvasToBase64 } from '@/app/utils/canvasExport';
import { analyzeDrawing } from '@/app/actions/analyzeDrawing';
import { evaluateTeaching } from '@/app/actions/evaluateTeaching';

const CHARACTER_LIMIT = 5000;

export default function TeachingScreen() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [textExplanation, setTextExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const editorRef = useRef<Editor | null>(null);
  
  // Hook to call Convex action
  const retrieveRelevantChunks = useAction(api.actions.retrieveRelevantChunks.retrieveRelevantChunks);
  
  // Query to get source material (including topic) for this session
  const sourceMaterial = useQuery(api.mutations.getSourceMaterialBySession, { sessionId });
  
  // Update topic when source material is loaded
  useEffect(() => {
    if (sourceMaterial?.topic) {
      setTopic(sourceMaterial.topic);
    }
  }, [sourceMaterial]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    // Block input if it exceeds the limit
    if (newText.length <= CHARACTER_LIMIT) {
      setTextExplanation(newText);
    }
  };

  const handleEditorMount = (editor: Editor) => {
    editorRef.current = editor;
  };

  const handleFinishLesson = async () => {
    setError(null);

    // Validate text explanation
    if (!textExplanation.trim()) {
      setError('Please provide a text explanation before submitting.');
      return;
    }

    if (!editorRef.current) {
      setError('Drawing canvas is not ready. Please try again.');
      return;
    }

    if (!topic) {
      setError('Session topic not loaded. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Export canvas to base64 image
      const canvasImageBase64 = await exportCanvasToBase64(editorRef.current);

      // Run RAG retrieval and vision analysis in parallel using Promise.all
      const [ragChunks, visionAnalysis] = await Promise.all([
        // Call Convex action to retrieve relevant chunks
        retrieveRelevantChunks({
          sessionId,
          textExplanation,
        }),
        // Call server action to analyze drawing
        analyzeDrawing(canvasImageBase64, topic),
      ]);

      // Once both complete, call evaluateTeaching with all collected data
      const evaluation = await evaluateTeaching(
        topic,
        visionAnalysis,
        ragChunks,
        textExplanation
      );

      // Navigate to results page with URL-encoded evaluation data
      const encodedEvaluationJSON = encodeURIComponent(JSON.stringify(evaluation));
      router.push(`/results?data=${encodedEvaluationJSON}`);

    } catch (err) {
      console.error('Error during evaluation:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during evaluation. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Left Panel - 60% width */}
      <div className="w-[60%] flex flex-col border-r border-gray-300 dark:border-zinc-700">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teach the AI{topic && `: ${topic}`}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Use the canvas and text area to explain your understanding
          </p>
        </div>

        {/* Canvas - 60% of panel height */}
        <div className="h-[60%] border-b border-gray-300 dark:border-zinc-700">
          <DrawingCanvas onEditorMount={handleEditorMount} />
        </div>

        {/* Text Explanation - 40% of panel height */}
        <div className="h-[40%]">
          <TextExplanationArea
            value={textExplanation}
            onChange={handleTextChange}
            characterLimit={CHARACTER_LIMIT}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Right Panel - 40% width */}
      <div className="w-[40%] flex flex-col bg-white dark:bg-zinc-800">
        {/* Status/Info Area */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-6">
            <InstructionsPanel />
            {isSubmitting && <LoadingIndicator />}
            {error && <ErrorDisplay message={error} />}
          </div>
        </div>

        {/* Finish Lesson Button - Fixed at bottom */}
        <div className="border-t border-gray-300 dark:border-zinc-700 px-6 py-4">
          <button
            onClick={handleFinishLesson}
            disabled={isSubmitting || !textExplanation.trim()}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Evaluating...' : 'Finish Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}
