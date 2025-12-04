'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Draggable } from './Draggable';
import { UserButton } from '@clerk/nextjs';
import { MessageCircle, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface MessagePanelProps {
  messages: Message[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isStreaming: boolean;
  streamingContent: string;
}

export function MessagePanel({
  messages,
  isCollapsed,
  onToggleCollapse,
  isStreaming,
  streamingContent,
}: MessagePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);
  const [size, setSize] = useState({ width: 350, height: 400 });

  // Use streamingContent prop directly (works for both Vercel API streaming and Convex final result)
  const displayStreamingContent = streamingContent;

  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, displayStreamingContent, isCollapsed]);

  useEffect(() => {
    if (isCollapsed && messages.length > prevMessageCountRef.current) {
      onToggleCollapse();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isCollapsed, onToggleCollapse]);

  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = startX - e.clientX;
        const deltaY = e.clientY - startY;
        const newWidth = Math.max(250, Math.min(600, startWidth + deltaX));
        const newHeight = Math.max(200, Math.min(600, startHeight + deltaY));
        setSize({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [size]
  );

  if (isCollapsed) {
    return (
      <Draggable className="absolute top-4 right-4">
        <button
          onClick={onToggleCollapse}
          className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </Draggable>
    );
  }

  return (
    <Draggable className="absolute top-4 right-4" handleClassName="drag-handle">
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 flex flex-col"
        style={{ width: size.width, height: size.height }}
      >
        {/* Resize handle - bottom left */}
        <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10" onMouseDown={handleResize}>
          <svg className="w-3 h-3 text-gray-400 m-0.5" viewBox="0 0 10 10">
            <path d="M0 0 L10 10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M0 4 L6 10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Header */}
        <div className="drag-handle flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 rounded-t-lg cursor-grab active:cursor-grabbing">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Student</h3>
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/sign-in" />
            <button onClick={onToggleCollapse} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-2">
          {messages.length === 0 && !isStreaming ? (
            <p
              className="text-gray-500 dark:text-gray-400 text-center py-4"
              style={{ fontSize: Math.max(11, Math.min(14, size.width / 30)) }}
            >
              No messages yet
            </p>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={`${msg.timestamp}-${i}`}
                  message={msg}
                  fontSize={Math.max(11, Math.min(16, size.width / 28))}
                />
              ))}
              {isStreaming && (
                displayStreamingContent ? (
                  <StreamingBubble content={displayStreamingContent} fontSize={Math.max(11, Math.min(16, size.width / 28))} />
                ) : (
                  <ThinkingBubble fontSize={Math.max(11, Math.min(16, size.width / 28))} />
                )
              )}
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
}

function MessageBubble({ message, fontSize }: { message: Message; fontSize: number }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`p-2 rounded-lg ${isUser ? 'bg-blue-50 dark:bg-blue-900/20 ml-4' : 'bg-gray-100 dark:bg-zinc-700 mr-4'}`}
    >
      <span
        className={`font-medium ${isUser ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}
        style={{ fontSize: fontSize * 0.75 }}
      >
        {isUser ? 'You' : 'AI'}
      </span>
      <p className="text-gray-900 dark:text-white whitespace-pre-wrap mt-1" style={{ fontSize }}>
        {message.content}
      </p>
    </div>
  );
}

function StreamingBubble({ content, fontSize }: { content: string; fontSize: number }) {
  return (
    <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 mr-4">
      <span className="font-medium text-green-600 dark:text-green-400" style={{ fontSize: fontSize * 0.75 }}>
        AI
      </span>
      <p className="text-gray-900 dark:text-white whitespace-pre-wrap mt-1" style={{ fontSize }}>
        {content}
        <span className="inline-block w-1 h-3 ml-0.5 bg-blue-500 animate-pulse" />
      </p>
    </div>
  );
}

function ThinkingBubble({ fontSize }: { fontSize: number }) {
  return (
    <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 mr-4">
      <span className="font-medium text-green-600 dark:text-green-400" style={{ fontSize: fontSize * 0.75 }}>
        AI
      </span>
      <div className="flex items-center gap-1 mt-1" style={{ fontSize }}>
        <span className="text-gray-500 dark:text-gray-400 italic">Thinking</span>
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}
