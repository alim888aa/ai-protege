'use client';

import React, { useState, useCallback } from 'react';
import { Draggable } from './Draggable';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  jargonWords?: string[];
}

/**
 * Draggable, resizable input panel for text explanations.
 */
export function InputPanel({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: InputPanelProps) {
  const [size, setSize] = useState({ width: 400, height: 180 });

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && value.trim()) {
        onSubmit();
      }
    }
  }, [isSubmitting, value, onSubmit]);

  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      // Dragging up (negative deltaY) increases height, panel grows upward from bottom anchor
      const newWidth = Math.max(300, Math.min(800, startWidth + (e.clientX - startX)));
      const newHeight = Math.max(150, Math.min(500, startHeight - (e.clientY - startY)));
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

  return (
    <Draggable className="absolute bottom-4 left-4" handleClassName="drag-handle" anchorBottom>
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 flex flex-col"
        style={{ width: size.width, height: size.height }}
      >
        {/* Drag handle + resize */}
        <div className="drag-handle flex items-center justify-between h-7 bg-gray-100 dark:bg-zinc-700 rounded-t-lg cursor-grab active:cursor-grabbing border-b border-gray-200 dark:border-zinc-600 px-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-500 rounded-full mx-auto" />
          <div
            className="w-4 h-4 cursor-ne-resize flex items-center justify-center"
            onMouseDown={handleResize}
          >
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 10 10">
              <path d="M0 10 L10 0" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 10 L10 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Textarea - font size scales with panel size */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your explanation... (Shift+Enter for new line)"
          disabled={isSubmitting}
          className="flex-1 p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none disabled:opacity-50 scrollbar-hidden"
          style={{ fontSize: Math.max(11, Math.min(16, size.width / 30)) }}
        />

        {/* Send button */}
        <div className="flex justify-end p-2 border-t border-gray-200 dark:border-zinc-700">
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </Draggable>
  );
}
