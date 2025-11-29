'use client';

import { useRef } from 'react';
import { generateDialogueResponse } from '@/app/actions/generateDialogueResponse';

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

interface DialogueInputProps {
  sessionId: string;
  currentConcept: Concept;
  currentDialogue?: Dialogue;
  dialogueMessages: Message[];
  dialogueInput: string;
  setDialogueInput: (value: string) => void;
  isStreamingResponse: boolean;
  setIsStreamingResponse: (value: boolean) => void;
  setStreamingContent: (value: string) => void;
  setError: (value: string | null) => void;
  ragChunks: Array<{ text: string; similarity: number; index: number }>;
  setRagChunks: (value: Array<{ text: string; similarity: number; index: number }>) => void;
  textExplanation: string;
  resetTimer: () => void;
  retrieveRelevantChunks: (args: { sessionId: string; textExplanation: string }) => Promise<Array<{ text: string; similarity: number; index: number }>>;
  addOptimisticMessage: (msg: Message) => void;
}

export function DialogueInput({
  sessionId,
  currentConcept,
  currentDialogue,
  dialogueMessages,
  dialogueInput,
  setDialogueInput,
  isStreamingResponse,
  setIsStreamingResponse,
  setStreamingContent,
  setError,
  ragChunks,
  setRagChunks,
  textExplanation,
  resetTimer,
  retrieveRelevantChunks,
  addOptimisticMessage,
}: DialogueInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSend = async () => {
    if (!dialogueInput.trim() || !currentConcept) return;

    const userMessage = {
      role: 'user' as const,
      content: dialogueInput.trim(),
      timestamp: Date.now(),
    };

    // Immediately add user message to UI (optimistic update)
    addOptimisticMessage(userMessage);
    
    setDialogueInput('');
    setIsStreamingResponse(true);
    setStreamingContent('');
    resetTimer();

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let chunks = ragChunks;
      if (chunks.length === 0) {
        chunks = await retrieveRelevantChunks({
          sessionId,
          textExplanation: textExplanation || currentConcept.description,
        });
        setRagChunks(chunks);
      }

      const history = [...dialogueMessages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const fullResponse = await generateDialogueResponse(
        currentConcept,
        history,
        chunks,
        (text) => setStreamingContent(text)
      );

      const aiMessage = {
        role: 'ai' as const,
        content: fullResponse,
        timestamp: Date.now(),
      };

      await fetch('/api/saveDialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conceptId: currentConcept.id,
          messages: [...(currentDialogue?.messages || []), userMessage, aiMessage],
        }),
      });

      setStreamingContent('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate response.');
    } finally {
      setIsStreamingResponse(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-zinc-700 px-6 py-4 animate-fadeIn">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={dialogueInput}
          onChange={(e) => {
            setDialogueInput(e.target.value);
            resetTimer();
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your response... (Press Enter to send)"
          disabled={isStreamingResponse}
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed resize-none overflow-hidden min-h-[40px] max-h-[200px] transition-all duration-200 focus-ring-smooth"
        />
        <button
          onClick={handleSend}
          disabled={!dialogueInput.trim() || isStreamingResponse}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 btn-press focus-ring-smooth"
        >
          {isStreamingResponse ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <span className="flex items-center gap-1">
              Send
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded text-xs font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
