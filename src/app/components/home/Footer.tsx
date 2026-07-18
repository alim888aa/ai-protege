import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pb-10 pt-3 text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10">
      <div className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <BrainCircuit className="size-4" />
        <span className="text-xs font-bold tracking-[0.12em]">AI PROTÉGÉ</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
        <Link href="/pricing" className="transition hover:text-zinc-950 dark:hover:text-white">Pricing</Link>
        <Link href="/sign-in" className="transition hover:text-zinc-950 dark:hover:text-white">Sign in</Link>
        <Link href="/terms" className="transition hover:text-zinc-950 dark:hover:text-white">Terms</Link>
        <Link href="/privacy" className="transition hover:text-zinc-950 dark:hover:text-white">Privacy</Link>
        <span>© {new Date().getFullYear()} AI Protégé</span>
      </div>
    </footer>
  );
}
