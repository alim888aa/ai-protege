'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from 'tldraw';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { useInactivityTimer } from '@/app/hooks/useInactivityTimer';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';

interface Concept {
  id: string;
  title: string;
  description: string;
}

interface Message {
  role: string;
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface Dialogue {
  conceptId: string;
  messages: Message[];
}

interface Explanation {
  conceptId: string;
  textExplanation: string;
  canvasData?: string;
}

interface Session {
  topic: string;
  concepts: Concept[];
  dialogues: Dialogue[];
  explanations?: Explanation[];
}

interface TeachingLayoutProps {
  sessionId: string;
  session: Session;
  conceptIndex: number;
  currentConcept: Concept;
  totalConcepts: number;
  currentDialogue?: Dialogue;
  currentExplanation?: Explanation;
}

export function TeachingLayout({
  sessionId,
  session,
  conceptIndex,
  currentConcept,
  totalConcepts,
  currentDialogue,
  currentExplanation,
}: TeachingLayoutProps) {
  const router = useRouter();

  // Local state
  const [textExplanation, setTextExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [ragChunks, setRagChunks] = useState<Array<{ text: string; similarity: number; index: number }>>([]);
  const [dialogueInput, setDialogueInput] = useState('');
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  // Optimistic messages that haven't been synced to the database yet
  const [optimisticMessages, setOptimisticMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp: number; type?: 'hint' | 'message' }>>([]);

  // Refs
  const editorRef = useRef<Editor | null>(null);
  const lastConceptIdRef = useRef<string | null>(null);

  // Hooks
  const { showHintButton, resetTimer } = useInactivityTimer(30000);
  const retrieveRelevantChunks = useAction(api.actions.retrieveRelevantChunks.retrieveRelevantChunks);
  const saveExplanation = useMutation(api.mutations.saveExplanation);
  const updateProgress = useMutation(api.mutations.updateProgress);

  // Derived data - combine database messages with optimistic messages
  const dialogueMessages = useMemo(() => {
    const dbMessages = currentDialogue?.messages?.map((msg) => ({
      ...msg,
      role: msg.role as 'user' | 'ai',
      type: (msg as Message).type,
    })) || [];
    
    // Filter out optimistic messages that are now in the database
    const dbTimestamps = new Set(dbMessages.map(m => m.timestamp));
    const pendingOptimistic = optimisticMessages.filter(m => !dbTimestamps.has(m.timestamp));
    
    return [...dbMessages, ...pendingOptimistic];
  }, [currentDialogue?.messages, optimisticMessages]);
  
  // Clear optimistic messages when they appear in the database
  useEffect(() => {
    if (currentDialogue?.messages && optimisticMessages.length > 0) {
      const dbTimestamps = new Set(currentDialogue.messages.map(m => m.timestamp));
      const stillPending = optimisticMessages.filter(m => !dbTimestamps.has(m.timestamp));
      if (stillPending.length !== optimisticMessages.length) {
        setOptimisticMessages(stillPending);
      }
    }
  }, [currentDialogue?.messages, optimisticMessages]);

  const showMoveToNext = dialogueMessages.length >= 2;

  // Initialize when concept changes
  useEffect(() => {
    if (!currentConcept?.id || lastConceptIdRef.current === currentConcept.id) return;

    lastConceptIdRef.current = currentConcept.id;
    setHintCount(0);
    setRagChunks([]);
    setTextExplanation(currentExplanation?.textExplanation || '');

    if (editorRef.current) {
      const existingShapeIds = Array.from(editorRef.current.getCurrentPageShapeIds());
      editorRef.current.deleteShapes(existingShapeIds);

      if (currentExplanation?.canvasData) {
        try {
          const shapes = JSON.parse(currentExplanation.canvasData);
          shapes.forEach((shape: any) => {
            if (shape) editorRef.current!.createShape(shape);
          });
        } catch (err) {
          console.error('Error loading canvas:', err);
        }
      }
    }
  }, [currentConcept?.id, currentExplanation]);

  // Handlers
  const handleTextChange = (value: string) => {
    setTextExplanation(value);
    resetTimer();
  };

  const handleEditorMount = (editor: Editor) => {
    editorRef.current = editor;
    editor.store.listen(() => resetTimer(), { scope: 'document' });

    if (currentExplanation?.canvasData) {
      try {
        const shapes = JSON.parse(currentExplanation.canvasData);
        shapes.forEach((shape: any) => {
          if (shape) editor.createShape(shape);
        });
      } catch (err) {
        console.error('Error loading canvas on mount:', err);
      }
    }
  };

  const handleMoveToNext = useCallback(async () => {
    const nextIndex = conceptIndex + 1;
    
    // Persist the progress to the session
    try {
      await updateProgress({ sessionId, conceptIndex: nextIndex });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
    
    if (nextIndex < totalConcepts) {
      router.push(`/teach/${sessionId}/${nextIndex}`);
    } else {
      router.push(`/complete/${sessionId}`);
    }
  }, [conceptIndex, totalConcepts, sessionId, updateProgress, router]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 page-transition">
      <LeftPanel
        sessionId={sessionId}
        topic={session.topic}
        currentConcept={currentConcept}
        conceptIndex={conceptIndex}
        totalConcepts={totalConcepts}
        textExplanation={textExplanation}
        isSubmitting={isSubmitting}
        onTextChange={handleTextChange}
        onEditorMount={handleEditorMount}
      />
      <RightPanel
        sessionId={sessionId}
        currentConcept={currentConcept}
        currentDialogue={currentDialogue}
        dialogueMessages={dialogueMessages}
        dialogueInput={dialogueInput}
        setDialogueInput={setDialogueInput}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        isStreamingResponse={isStreamingResponse}
        setIsStreamingResponse={setIsStreamingResponse}
        streamingContent={streamingContent}
        setStreamingContent={setStreamingContent}
        error={error}
        setError={setError}
        showMoveToNext={showMoveToNext}
        showHintButton={showHintButton}
        hintCount={hintCount}
        setHintCount={setHintCount}
        isGeneratingHint={isGeneratingHint}
        setIsGeneratingHint={setIsGeneratingHint}
        ragChunks={ragChunks}
        setRagChunks={setRagChunks}
        textExplanation={textExplanation}
        editorRef={editorRef}
        resetTimer={resetTimer}
        retrieveRelevantChunks={retrieveRelevantChunks}
        saveExplanation={saveExplanation}
        onMoveToNext={handleMoveToNext}
        conceptIndex={conceptIndex}
        totalConcepts={totalConcepts}
        addOptimisticMessage={(msg) => setOptimisticMessages(prev => [...prev, msg])}
      />
    </div>
  );
}
