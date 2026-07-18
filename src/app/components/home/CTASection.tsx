'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <section className="px-3 pb-12 md:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1380px] overflow-hidden rounded-[26px] border border-zinc-200 bg-white text-zinc-950 md:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)] md:items-stretch dark:border-white/10 dark:bg-zinc-900 dark:text-white">
        <div className="px-7 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] md:text-6xl">
            Bring your own subject. Meet the gaps in your understanding.
          </h2>
        </div>

        <div className="flex items-center justify-center p-7 md:border-l md:border-zinc-200 md:p-12 md:dark:border-white/10 lg:p-16">
          <Link
            href={ctaHref}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-violet-300 px-7 text-base font-semibold text-zinc-950 transition hover:bg-violet-200"
          >
            Start a Lesson
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
