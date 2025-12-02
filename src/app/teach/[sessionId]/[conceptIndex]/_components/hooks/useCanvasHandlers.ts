'use client';

import { useRef, useCallback, useState } from 'react';
import { ExcalidrawAPI } from '@/app/components/ExcalidrawWrapper';
import { calculateTopicPosition, getTopicBounds, defaultTopicAreaConfig } from '@/app/utils/topicAreaManager';

export function useCanvasHandlers(conceptIndex: number, resetTimer: () => void) {
  const excalidrawApiRef = useRef<ExcalidrawAPI | null>(null);
  const canvasElementsRef = useRef<readonly unknown[]>([]);
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);

  const handleElementsChange = useCallback(
    (elements: readonly unknown[]) => {
      if (elements && Array.isArray(elements)) {
        canvasElementsRef.current = elements;
        resetTimer();
      }
    },
    [resetTimer]
  );

  const handleApiReady = useCallback((api: ExcalidrawAPI) => {
    excalidrawApiRef.current = api;
  }, []);

  const handleScrollChange = useCallback(
    (scrollX: number, scrollY: number) => {
      const bounds = getTopicBounds(conceptIndex);
      const padding = 300;
      const viewportX = -scrollX;
      const viewportY = -scrollY;

      const isOutside =
        viewportX < bounds.minX - padding ||
        viewportX > bounds.maxX + padding ||
        viewportY < bounds.minY - padding ||
        viewportY > bounds.maxY + padding;

      setIsOutOfBounds(isOutside);
    },
    [conceptIndex]
  );

  const scrollToTopic = useCallback(() => {
    if (excalidrawApiRef.current) {
      const pos = calculateTopicPosition(conceptIndex);
      const { width, height } = defaultTopicAreaConfig;
      
      // Calculate center of the topic area
      const centerX = pos.x + width / 2;
      const centerY = pos.y + height / 2;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll to center the topic area in the viewport
      // scrollX/Y are negative offsets: viewport shows content at (-scrollX, -scrollY)
      const scrollX = -(centerX - viewportWidth / 2);
      const scrollY = -(centerY - viewportHeight / 2);
      
      excalidrawApiRef.current.updateScene({
        appState: { scrollX, scrollY },
      });
      setIsOutOfBounds(false);
    }
  }, [conceptIndex]);

  return {
    excalidrawApiRef,
    canvasElementsRef,
    isOutOfBounds,
    handleElementsChange,
    handleApiReady,
    handleScrollChange,
    scrollToTopic,
  };
}
