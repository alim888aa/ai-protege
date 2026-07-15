'use client';

import React, { useState, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragMetrics {
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
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
  const [dragMetrics, setDragMetrics] = useState<DragMetrics | null>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-resize-handle]')) {
      return;
    }

    // Check if we should only drag from handle
    if (handleClassName) {
      if (!target.closest(`.${handleClassName}`)) {
        return;
      }
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragMetrics({
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    // Initialize position if the component was previously using CSS positioning.
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    const rect = e.currentTarget.getBoundingClientRect();

    // Constrain to viewport
    if (constrainToViewport) {
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
    }

    const newPosition = { x: newX, y: newY };
    setDragMetrics({
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const style: React.CSSProperties = position
    ? dragMetrics
      ? {
        position: 'fixed',
        // Use right positioning to maintain right-anchor behavior
        right: dragMetrics.viewportWidth - position.x - dragMetrics.width,
        ...(anchorBottom
          ? { bottom: dragMetrics.viewportHeight - position.y - dragMetrics.height }
          : { top: position.y }),
        cursor: isDragging ? 'grabbing' : undefined,
      }
      : {
          position: 'fixed',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : undefined,
        }
    : {
        cursor: isDragging ? 'grabbing' : undefined,
      };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
