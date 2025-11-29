'use client';

import React, { useState, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface JargonHighlightedTextareaProps {
  sessionId: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  characterLimit: number;
  disabled?: boolean;
}

export function JargonHighlightedTextarea({
  sessionId,
  value,
  onChange,
  characterLimit,
  disabled = false,
}: JargonHighlightedTextareaProps) {
  const characterCount = value.length;
  const [hoveredJargon, setHoveredJargon] = useState<{ word: string; x: number; y: number } | null>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load jargonWords from sourceMaterial
  const sourceMaterial = useQuery(api.mutations.getSourceMaterialBySession, { sessionId });
  const jargonWords = sourceMaterial?.jargonWords ?? [];

  // Synchronize scroll between textarea and highlight layer
  const handleScroll = () => {
    if (textareaRef.current && highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightLayerRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Highlight jargon words in the text
  const highlightJargon = (text: string): React.ReactElement[] => {
    if (jargonWords.length === 0 || !text) {
      return [<span key="0">{text}</span>];
    }

    // Create a case-insensitive regex pattern for all jargon words
    const escapedJargon = jargonWords.map(word => 
      word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`\\b(${escapedJargon.join('|')})\\b`, 'gi');

    const parts: React.ReactElement[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = pattern.lastIndex;
      const matchedWord = match[0];

      if (matchStart > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, matchStart)}
          </span>
        );
      }

      parts.push(
        <mark
          key={`jargon-${matchStart}`}
          className="bg-yellow-200 dark:bg-yellow-600/40"
          data-jargon={matchedWord}
        >
          {matchedWord}
        </mark>
      );

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!highlightLayerRef.current || !textareaRef.current) return;

    const textareaRect = textareaRef.current.getBoundingClientRect();
    const x = e.clientX - textareaRect.left;
    const y = e.clientY - textareaRect.top + textareaRef.current.scrollTop;

    const marks = highlightLayerRef.current.querySelectorAll('mark[data-jargon]');
    let foundJargon = false;

    marks.forEach((mark) => {
      const rect = mark.getBoundingClientRect();
      const relativeTop = rect.top - textareaRect.top + textareaRef.current!.scrollTop;
      const relativeBottom = rect.bottom - textareaRect.top + textareaRef.current!.scrollTop;
      const relativeLeft = rect.left - textareaRect.left;
      const relativeRight = rect.right - textareaRect.left;

      if (x >= relativeLeft && x <= relativeRight && y >= relativeTop && y <= relativeBottom) {
        const word = mark.getAttribute('data-jargon') || '';
        setHoveredJargon({ word, x: rect.left + rect.width / 2, y: rect.top - 8 });
        foundJargon = true;
      }
    });

    if (!foundJargon) setHoveredJargon(null);
  };

  return (
    <div className="h-full bg-white dark:bg-zinc-800 flex flex-col relative">
      <div className="px-6 py-4 border-b border-gray-300 dark:border-zinc-700 flex justify-between items-center">
        <label htmlFor="explanation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Explanation
        </label>
        <span className={`text-sm font-medium ${characterCount > characterLimit * 0.9 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {characterCount} / {characterLimit}
        </span>
      </div>

      <div ref={containerRef} className="flex-1 relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredJargon(null)}>
        <div
          ref={highlightLayerRef}
          className="absolute inset-0 px-6 py-4 overflow-hidden pointer-events-none whitespace-pre-wrap break-words"
          style={{ font: 'inherit', lineHeight: '1.5', color: 'transparent' }}
        >
          <div className="text-gray-900 dark:text-white">{highlightJargon(value)}</div>
        </div>

        <textarea
          ref={textareaRef}
          id="explanation"
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          placeholder="Explain the topic in your own words..."
          disabled={disabled}
          className="absolute inset-0 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {hoveredJargon && (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none"
          style={{ left: `${hoveredJargon.x}px`, top: `${hoveredJargon.y}px`, transform: 'translate(-50%, -100%)' }}
        >
          Simplify this?
        </div>
      )}
    </div>
  );
}
