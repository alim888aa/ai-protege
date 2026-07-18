import type { ReactNode } from 'react';
import { Footer, MarketingHeader } from '@/app/components/home';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ eyebrow, title, intro, updated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#09090b] dark:text-zinc-50">
      <MarketingHeader />

      <main>
        <header className="border-y border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-8 md:py-24 lg:px-10">
            <p className="text-xs font-bold tracking-[0.2em] text-violet-700 dark:text-violet-300">
              {eyebrow}
            </p>
            <h1 className="mt-6 max-w-5xl text-[clamp(3.2rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              {title}
            </h1>
            <div className="mt-9 grid gap-6 md:grid-cols-[minmax(0,46rem)_auto] md:items-end md:justify-between">
              <p className="max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                {intro}
              </p>
              <p className="font-mono text-xs tracking-[0.12em] text-zinc-500">
                EFFECTIVE {updated.toUpperCase()}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-20 lg:px-10">
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <p className="mb-5 text-xs font-bold tracking-[0.18em] text-zinc-500">ON THIS PAGE</p>
            <nav aria-label={`${title} sections`} className="flex flex-wrap gap-x-4 gap-y-3 lg:flex-col">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group inline-flex items-center gap-3 text-sm text-zinc-600 transition hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300"
                >
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div>
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 border-t border-zinc-200 py-10 first:border-t-0 first:pt-0 dark:border-zinc-800"
              >
                <div className="mb-5 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-violet-700 dark:text-violet-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 text-[0.98rem] leading-7 text-zinc-700 marker:text-violet-600 dark:text-zinc-300 dark:marker:text-violet-400 [&_a]:font-medium [&_a]:text-violet-700 [&_a]:underline [&_a]:decoration-violet-300 [&_a]:underline-offset-4 dark:[&_a]:text-violet-300 dark:[&_a]:decoration-violet-700 [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
