import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to track user inactivity and show a hint button after a timeout
 * @param timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @returns Object with showHintButton state and resetTimer function
 */
export function useInactivityTimer(timeoutMs: number = 30000) {
  const [showHintButton, setShowHintButton] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Use ref to avoid recreating resetTimer when timeoutMs changes
  const timeoutMsRef = useRef(timeoutMs);
  
  // Keep the ref in sync with the prop
  useEffect(() => {
    timeoutMsRef.current = timeoutMs;
  }, [timeoutMs]);

  // Stable resetTimer function - no dependencies means it won't change
  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Hide hint button
    setShowHintButton(false);

    // Start new timer using ref value
    timerRef.current = setTimeout(() => {
      setShowHintButton(true);
    }, timeoutMsRef.current);
  }, []);

  // Initialize timer on mount only
  useEffect(() => {
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  return { showHintButton, resetTimer };
}
