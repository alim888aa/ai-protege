'use client';

import { Moon, Sun } from 'lucide-react';
import { setTheme, useTheme } from '@/app/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-violet-300 dark:focus-visible:ring-offset-zinc-950 ${className}`}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  );
}
