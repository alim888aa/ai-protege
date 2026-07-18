import type { ReactNode } from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-16 text-zinc-950 dark:bg-[#09090b] dark:text-zinc-50">
      <Link href="/" className="group mb-6 flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-md transition group-hover:bg-violet-700 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-violet-200">
          <BrainCircuit className="size-6" />
        </span>
        <span className="text-2xl font-bold tracking-[-0.03em]">AI Protégé</span>
      </Link>
      <p className="mb-8 max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Learn by teaching. Master concepts through the Feynman Technique.
      </p>
      {children}
    </main>
  );
}
