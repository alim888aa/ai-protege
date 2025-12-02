'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Brain } from 'lucide-react';

export function HeroSection() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Powered by the Feynman Technique
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Learn by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Teaching
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Master any concept by explaining it to an AI student. Draw, write, and teach your way to deeper understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isSignedIn ? 'Go to Dashboard' : 'Start Learning Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-200 shadow-md border border-gray-200 dark:border-zinc-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
