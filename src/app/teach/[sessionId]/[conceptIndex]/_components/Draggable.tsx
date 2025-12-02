'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableProps {
  children: React.ReactNode;
  /** Initial position. If not provided, uses CSS positioning */
  initialPosition?: Position;
  /** Handle selector - only this element triggers drag. If not provided, entire component is draggable */
  handleClassName?: string;
  /** Callback when position changes */
  onPositionChange?: (position: Position) => void;
  /** Additional className for the wrapper */
  className?: string;
  /** Constrain to viewport bounds */
  constrainToViewport?: boolean;
  /** Anchor from bottom instead of top (for panels that should grow upward) */
  anchorBottom?: boolean;
}

/**
 * Wrapper component that makes its children draggable.
 * Drag by clicking and holding on the handle (or entire component if no handle specified).
 */
export function Draggable({
  children,
  initialPosition,
  handleClassName,
  onPositionChange,
  className = '',
  constrainToViewport = true,
  anchorBottom = false,
}: DraggableProps) {
  const [position, setPosition] = useState<Position | null>(initialPosition || null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Check if we should only drag from handle
    if (handleClassName) {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${handleClassName}`)) {
        return;
      }
    }

    e.preventDefault();
    setIsDragging(true);

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      // Initialize position if not set
      if (!position) {
        setPosition({ x: rect.left, y: rect.top });
      }
    }
  }, [handleClassName, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !elementRef.current) return;

    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;

    // Constrain to viewport
    if (constrainToViewport) {
      const rect = elementRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
    }

    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [isDragging, constrainToViewport, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        // Use right positioning to maintain right-anchor behavior
        right: window.innerWidth - position.x - (elementRef.current?.getBoundingClientRect().width || 0),
        ...(anchorBottom
          ? { bottom: window.innerHeight - position.y - (elementRef.current?.getBoundingClientRect().height || 0) }
          : { top: position.y }),
        cursor: isDragging ? 'grabbing' : undefined,
      }
    : {
        cursor: isDragging ? 'grabbing' : undefined,
      };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
