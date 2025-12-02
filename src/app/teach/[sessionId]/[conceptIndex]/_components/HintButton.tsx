'use client';

import React, { useState, useRef } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';

interface HintButtonProps {
  onClick: () => void;
  hintCount: number;
  isGenerating: boolean;
}

export function HintButton({ onClick, hintCount, isGenerating }: HintButtonProps) {
  const maxHints = 3;
  const allHintsUsed = hintCount >= maxHints;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startPosRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      hasDraggedRef.current = true;
      setPosition({
        x: e.clientX - startPosRef.current.x,
        y: e.clientY - startPosRef.current.y,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = () => {
    if (!hasDraggedRef.current) {
      onClick();
    }
  };

  return (
    <div
      className="absolute top-[420px] right-4 cursor-grab active:cursor-grabbing"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={handleClick}
        disabled={isGenerating || allHintsUsed}
        className={`
          relative w-10 h-10 rounded-full shadow-lg border flex items-center justify-center transition-all
          ${
            allHintsUsed
              ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 opacity-60'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          }
          ${isGenerating ? 'animate-pulse' : ''}
        `}
        title={allHintsUsed ? 'No hints left' : `Get hint (${maxHints - hintCount} left)`}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
        ) : (
          <HelpCircle
            className={`w-5 h-5 ${allHintsUsed ? 'text-gray-400' : 'text-amber-600 dark:text-amber-400'}`}
          />
        )}
        {hintCount > 0 && !allHintsUsed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {hintCount}
          </span>
        )}
      </button>
    </div>
  );
}
