'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export function MarketingHeader() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 md:px-8 lg:px-10">
      <Link href="/" className="inline-flex items-center gap-2.5 text-zinc-950 dark:text-white">
        <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <BrainCircuit className="size-5" />
        </span>
        <span className="hidden whitespace-nowrap text-sm font-bold tracking-[0.12em] min-[420px]:inline">AI PROTÉGÉ</span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary navigation">
        <Link
          href="/pricing"
          className="hidden min-h-10 items-center rounded-full px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-950/5 hover:text-zinc-950 min-[380px]:inline-flex sm:px-4 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          Pricing
        </Link>
        {!isSignedIn && (
          <Link
            href="/sign-in"
            className="hidden min-h-10 items-center rounded-full px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-950/5 hover:text-zinc-950 sm:inline-flex sm:px-4 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Sign in
          </Link>
        )}
        <ThemeToggle />
        <Link
          href={ctaHref}
          className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-violet-200"
        >
          <span className="min-[380px]:hidden">{isSignedIn ? 'App' : 'Start'}</span>
          <span className="hidden min-[380px]:inline">{isSignedIn ? 'Dashboard' : 'Start learning'}</span>
          <ArrowRight className="size-4" />
        </Link>
      </nav>
    </header>
  );
}
