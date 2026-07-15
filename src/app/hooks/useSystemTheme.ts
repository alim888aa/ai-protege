'use client';

import { useSyncExternalStore } from 'react';

const systemThemeQuery = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(systemThemeQuery);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light';
}

export function useSystemTheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => 'light');
}
