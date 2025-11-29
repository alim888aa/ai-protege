'use client';

import { RefObject, useEffect, useState } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface DialoguePanelProps {
  messages: Message[];
  isStreamingResponse: boolean;
  streamingContent: string;
  dialogueEndRef: RefObject<HTMLDivElement | null>;
}

export function DialoguePanel({
  messages,
  isStreamingResponse,
  streamingContent,
  dialogueEndRef,
}: DialoguePanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white animate-fadeIn">
        Dialogue with AI Student
      </h3>
      {messages.map((message, index) => (
        <MessageBubble 
          key={`${message.timestamp}-${index}`} 
          message={message} 
          index={index}
        />
      ))}
      {isStreamingResponse && streamingContent && (
        <StreamingMessage content={streamingContent} />
      )}
      <div ref={dialogueEndRef} />
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user';
  const isHint = message.type === 'hint';
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Small delay for staggered animation effect
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Hint messages have a distinct yellow/amber style
  if (isHint) {
    return (
      <div
        className={`p-4 rounded-lg transition-all duration-300 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 mr-8 dialogue-message ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
            Hint
          </span>
        </div>
        <div className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`p-4 rounded-lg transition-all duration-300 ${
        isUser
          ? 'bg-blue-50 dark:bg-blue-900/20 ml-8 dialogue-message-user'
          : 'bg-gray-100 dark:bg-zinc-700 mr-8 dialogue-message'
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${isUser ? 'bg-blue-500' : 'bg-green-500'}`} />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {isUser ? 'You' : 'AI Student'}
        </span>
      </div>
      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
        {message.content}
      </div>
    </div>
  );
}

function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-100 dark:bg-zinc-700 mr-8 animate-fadeIn">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          AI Student
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">typing...</span>
      </div>
      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
        {content}
        <span className="inline-block w-2 h-4 ml-1 bg-blue-500 rounded-sm animate-pulse" />
      </div>
    </div>
  );
}
