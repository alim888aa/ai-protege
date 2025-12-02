'use client';

import React from 'react';

interface OverlayContainerProps {
  children: React.ReactNode;
}

/**
 * Container for overlay UI elements positioned above the Excalidraw canvas.
 * Uses pointer-events: none on the container so clicks pass through to the canvas,
 * while children have pointer-events: auto to remain interactive.
 * 
 * Requirements: 1.2, 1.3
 */
export function OverlayContainer({ children }: OverlayContainerProps) {
  return (
    <div className="overlay-container absolute inset-0 z-10 pointer-events-none">
      {children}
    </div>
  );
}
