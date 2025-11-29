'use client';

import { useRef, useEffect, MutableRefObject } from 'react';
import { Editor } from 'tldraw';
import { InstructionsPanel } from '@/app/components/InstructionsPanel';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { ErrorDisplay } from '@/app/components/ErrorDisplay';
import { DialoguePanel } from './DialoguePanel';
import { DialogueInput } from './DialogueInput';
import { ActionButtons } from './ActionButtons';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface Dialogue {
  conceptId: string;
  messages: { role: string; content: string; timestamp: number; type?: 'hint' | 'message' }[];
}

interface RightPanelProps {
  sessionId: string;
  currentConcept: Concept;
  currentDialogue?: Dialogue;
  dialogueMessages: Message[];
  dialogueInput: string;
  setDialogueInput: (value: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isStreamingResponse: boolean;
  setIsStreamingResponse: (value: boolean) => void;
  streamingContent: string;
  setStreamingContent: (value: string) => void;
  error: string | null;
  setError: (value: string | null) => void;
  showMoveToNext: boolean;
  showHintButton: boolean;
  hintCount: number;
  setHintCount: (value: number) => void;
  isGeneratingHint: boolean;
  setIsGeneratingHint: (value: boolean) => void;
  ragChunks: Array<{ text: string; similarity: number; index: number }>;
  setRagChunks: (value: Array<{ text: string; similarity: number; index: number }>) => void;
  textExplanation: string;
  editorRef: MutableRefObject<Editor | null>;
  resetTimer: () => void;
  retrieveRelevantChunks: (args: { sessionId: string; textExplanation: string }) => Promise<Array<{ text: string; similarity: number; index: number }>>;
  saveExplanation: (args: { sessionId: string; conceptId: string; textExplanation: string; canvasData?: string }) => Promise<null>;
  onMoveToNext: () => void;
  conceptIndex: number;
  totalConcepts: number;
  addOptimisticMessage: (msg: Message) => void;
}

export function RightPanel({
  sessionId,
  currentConcept,
  currentDialogue,
  dialogueMessages,
  dialogueInput,
  setDialogueInput,
  isSubmitting,
  setIsSubmitting,
  isStreamingResponse,
  setIsStreamingResponse,
  streamingContent,
  setStreamingContent,
  error,
  setError,
  showMoveToNext,
  showHintButton,
  hintCount,
  setHintCount,
  isGeneratingHint,
  setIsGeneratingHint,
  ragChunks,
  setRagChunks,
  textExplanation,
  editorRef,
  resetTimer,
  retrieveRelevantChunks,
  saveExplanation,
  onMoveToNext,
  conceptIndex,
  totalConcepts,
  addOptimisticMessage,
}: RightPanelProps) {
  const dialogueEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueMessages.length, streamingContent]);

  return (
    <div className="w-[40%] flex flex-col bg-white dark:bg-zinc-800 animate-fadeIn">
      {/* Dialogue Area */}
      <div className="flex-1 px-6 py-8 overflow-y-auto smooth-scroll custom-scrollbar">
        <div className="space-y-6">
          {dialogueMessages.length > 0 ? (
            <DialoguePanel
              messages={dialogueMessages}
              isStreamingResponse={isStreamingResponse}
              streamingContent={streamingContent}
              dialogueEndRef={dialogueEndRef}
            />
          ) : (
            <div className="animate-fadeIn">
              <InstructionsPanel />
            </div>
          )}
          {isSubmitting && (
            <div className="space-y-2 animate-fadeIn">
              <LoadingIndicator />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                The AI student is thinking about your explanation...
              </p>
            </div>
          )}
          {error && (
            <div className="animate-scaleIn">
              <ErrorDisplay message={error} />
            </div>
          )}
        </div>
      </div>

      {/* Dialogue Input */}
      {dialogueMessages.length > 0 && (
        <DialogueInput
          sessionId={sessionId}
          currentConcept={currentConcept}
          currentDialogue={currentDialogue}
          dialogueMessages={dialogueMessages}
          dialogueInput={dialogueInput}
          setDialogueInput={setDialogueInput}
          isStreamingResponse={isStreamingResponse}
          setIsStreamingResponse={setIsStreamingResponse}
          setStreamingContent={setStreamingContent}
          setError={setError}
          ragChunks={ragChunks}
          setRagChunks={setRagChunks}
          textExplanation={textExplanation}
          resetTimer={resetTimer}
          retrieveRelevantChunks={retrieveRelevantChunks}
          addOptimisticMessage={addOptimisticMessage}
        />
      )}

      {/* Action Buttons */}
      <ActionButtons
        sessionId={sessionId}
        currentConcept={currentConcept}
        currentDialogue={currentDialogue}
        dialogueMessages={dialogueMessages}
        textExplanation={textExplanation}
        editorRef={editorRef}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        isStreamingResponse={isStreamingResponse}
        setIsStreamingResponse={setIsStreamingResponse}
        setStreamingContent={setStreamingContent}
        setError={setError}
        showMoveToNext={showMoveToNext}
        showHintButton={showHintButton}
        hintCount={hintCount}
        setHintCount={setHintCount}
        isGeneratingHint={isGeneratingHint}
        setIsGeneratingHint={setIsGeneratingHint}
        ragChunks={ragChunks}
        setRagChunks={setRagChunks}
        resetTimer={resetTimer}
        retrieveRelevantChunks={retrieveRelevantChunks}
        saveExplanation={saveExplanation}
        onMoveToNext={onMoveToNext}
        conceptIndex={conceptIndex}
        totalConcepts={totalConcepts}
      />
    </div>
  );
}
