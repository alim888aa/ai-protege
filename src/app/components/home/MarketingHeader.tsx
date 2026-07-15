'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, BrainCircuit } from 'lucide-react';

export function MarketingHeader() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 md:px-8 lg:px-10">
      <Link href="/" className="inline-flex items-center gap-2.5 text-white">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white text-zinc-950">
          <BrainCircuit className="size-5" />
        </span>
        <span className="hidden whitespace-nowrap text-sm font-bold tracking-[0.12em] min-[420px]:inline">AI PROTÉGÉ</span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary navigation">
        <Link
          href="/pricing"
          className="hidden min-h-10 items-center rounded-full px-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white min-[380px]:inline-flex sm:px-4"
        >
          Pricing
        </Link>
        {!isSignedIn && (
          <Link
            href="/sign-in"
            className="hidden min-h-10 items-center rounded-full px-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white sm:inline-flex sm:px-4"
          >
            Sign in
          </Link>
        )}
        <Link
          href={ctaHref}
          className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-violet-200"
        >
          <span className="min-[380px]:hidden">{isSignedIn ? 'App' : 'Start'}</span>
          <span className="hidden min-[380px]:inline">{isSignedIn ? 'Dashboard' : 'Start learning'}</span>
          <ArrowRight className="size-4" />
        </Link>
      </nav>
    </header>
  );
}
