'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowDown } from 'lucide-react';
import { LandingCanvasDemo } from './LandingCanvasDemo';
import { MarketingHeader } from './MarketingHeader';

export function HeroSection() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <section className="landing-paper pb-24">
      <MarketingHeader />

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-24 lg:px-10">
        <div className="max-w-5xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-violet-300 md:text-sm">
            <span className="h-px w-9 bg-violet-400" />
            LEARN BY TEACHING
          </p>
          <h1 className="max-w-4xl text-[clamp(3.25rem,7.4vw,7.5rem)] font-semibold leading-[0.91] tracking-[-0.065em] text-white">
            Think you know it?
            <span className="block text-violet-300">Try teaching it.</span>
          </h1>

          <div className="mt-8 flex max-w-4xl pt-7">
            <a
              href="#try-the-canvas"
              className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-violet-300 hover:bg-white/10"
            >
              Try the sample lesson
              <ArrowDown className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-6 lg:px-8">
        <LandingCanvasDemo ctaHref={ctaHref} />
      </div>
    </section>
  );
}
