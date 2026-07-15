import type { Metadata } from 'next';
import { ArrowDown, BrainCircuit, CalendarDays, Infinity as InfinityIcon } from 'lucide-react';
import { PricingPlans } from '../components/billing';
import { Footer, MarketingHeader } from '../components/home';

export const metadata: Metadata = {
  title: 'Pricing — AI Protégé',
  description: 'Unlimited AI Protégé learning for $10 monthly or $80 yearly, with seven days free.',
};

const timeline = [
  {
    label: 'Day 1',
    title: 'Bring something difficult.',
    copy: 'A URL, a PDF, or a topic you have been avoiding.',
  },
  {
    label: 'Days 1–7',
    title: 'Teach until the gaps show.',
    copy: 'Draw, explain, get questioned, and try again without usage limits.',
  },
  {
    label: 'Day 8',
    title: 'Keep the practice—or leave.',
    copy: 'Your chosen plan begins unless you cancel from the Polar portal.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#09090b] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.32) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative">
          <MarketingHeader />
          <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:grid-cols-[1fr_22rem] lg:items-end lg:px-10">
            <div>
              <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-violet-300">
                <span className="h-px w-9 bg-violet-300" />
                MEMBERSHIP
              </p>
              <h1 className="max-w-5xl text-[clamp(3.4rem,7.8vw,7.9rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                One membership.
                <span className="block text-violet-300">Two rhythms.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
                Unlimited practice for people who learn by explaining. Choose how often you want to think about billing.
              </p>
            </div>

            <aside className="border-l border-violet-300/50 pl-6 text-sm text-zinc-300 lg:mb-2">
              <BrainCircuit className="mb-5 size-8 text-violet-300" />
              <p className="font-mono text-xs tracking-[0.16em] text-zinc-500">THE WHOLE LOOP</p>
              <p className="mt-3 text-lg leading-7 text-white">Source → explain → get challenged → understand.</p>
              <a href="#plans" className="mt-7 inline-flex items-center gap-2 font-semibold text-violet-300 hover:text-violet-200">
                See the plans <ArrowDown className="size-4" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <main id="plans" className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-8 md:py-28 lg:px-10">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-zinc-500">ALL FEATURES. BOTH PLANS.</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Pick your billing rhythm.</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <InfinityIcon className="size-5 text-violet-300" />
            Unlimited usage from the first lesson
          </div>
        </div>

        <PricingPlans />

        <section className="mt-28 border-t border-white/10 pt-10">
          <div className="mb-10 flex items-center gap-3">
            <CalendarDays className="size-5 text-violet-300" />
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">What the free week looks like</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 md:grid-cols-3">
            {timeline.map((item) => (
              <article key={item.label} className="bg-zinc-950 p-7 sm:p-8">
                <p className="font-mono text-xs font-bold tracking-[0.16em] text-violet-300">{item.label.toUpperCase()}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-500">
            A payment method is required to begin the trial. Taxes are calculated by Polar for your location. Cancel before the seventh day ends and you will not be charged.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
