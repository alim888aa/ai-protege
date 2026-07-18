'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

export const themeStorageKey = 'ai-protege-theme';
const themeChangeEvent = 'ai-protege-theme-change';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function readSavedTheme(): Theme {
  try {
    return localStorage.getItem(themeStorageKey) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function readTheme(): Theme {
  const theme = readSavedTheme();

  if (!document.documentElement.classList.contains(theme)) {
    applyTheme(theme);
  }

  return theme;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = () => {
    applyTheme(readSavedTheme());
    onStoreChange();
  };

  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function setTheme(theme: Theme) {
  applyTheme(theme);

  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // The visible theme still changes when storage is unavailable.
  }

  window.dispatchEvent(new Event(themeChangeEvent));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => 'dark');
}
