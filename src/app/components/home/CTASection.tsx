'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Sparkles, ArrowRight } from 'lucide-react';

export function CTASection() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <section className="max-w-4xl mx-auto px-6 pb-16">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-center shadow-xl">
        <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to master something new?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Join learners who are using the Feynman Technique to truly understand, not just memorize.
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:scale-105"
        >
          {isSignedIn ? 'Go to Dashboard' : 'Get Started Now'}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
