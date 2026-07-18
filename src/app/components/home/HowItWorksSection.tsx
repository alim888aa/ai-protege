import { BookOpenText, MessageSquareText, PenTool } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Bring something worth learning',
    description: 'Choose a topic, add a PDF or URL, or begin with an idea you want to understand more deeply.',
    icon: BookOpenText,
  },
  {
    number: '02',
    title: 'Make your thinking visible',
    description: 'Draw the relationships and explain them in your own words, as if a curious student were listening.',
    icon: PenTool,
  },
  {
    number: '03',
    title: 'Follow the confusion',
    description: 'Answer the AI student’s questions until the idea becomes clear, connected, and genuinely yours.',
    icon: MessageSquareText,
  },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-24 md:px-8 md:py-32 lg:px-10">
      <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-end">
        <p className="text-xs font-bold tracking-[0.18em] text-violet-700 dark:text-violet-300">THE FEYNMAN LOOP</p>
        <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 dark:text-white md:text-6xl">
          Understanding starts where explaining gets difficult.
        </h2>
      </div>

      <div className="mt-16 grid md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article
              key={step.number}
              className="py-9 md:border-r md:border-zinc-200 md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0 md:dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-zinc-500">{step.number}</span>
                <Icon className="size-5 text-violet-700 dark:text-violet-300" />
              </div>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.025em] text-zinc-950 dark:text-white">{step.title}</h3>
              <p className="mt-4 max-w-sm text-base leading-7 text-zinc-600 dark:text-zinc-400">{step.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
