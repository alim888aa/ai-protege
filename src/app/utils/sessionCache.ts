/**
 * Session cache utilities for fast completion page loads
 * Uses sessionStorage to pass session data between pages without re-fetching from Convex
 */

export interface CachedSessionData {
  topic: string;
  concepts: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  dialogues: Array<{
    conceptId: string;
    messages: Array<{
      role: string;
      content: string;
      timestamp: number;
      type?: string;
    }>;
  }>;
  explanations: Array<{
    conceptId: string;
    textExplanation: string;
    canvasData?: string;
  }>;
  completed?: boolean;
  summary?: {
    text: string;
    keyConceptsCovered: string[];
    analogiesUsed: string[];
  };
}

const CACHE_KEY_PREFIX = 'session-cache-';

export function cacheSessionData(sessionId: string, data: CachedSessionData): void {
  try {
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${sessionId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache session data:', e);
  }
}

export function getCachedSessionData(sessionId: string): CachedSessionData | null {
  try {
    const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${sessionId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.warn('Failed to read cached session data:', e);
    return null;
  }
}

export function clearSessionCache(sessionId: string): void {
  try {
    sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${sessionId}`);
  } catch (e) {
    console.warn('Failed to clear session cache:', e);
  }
}
