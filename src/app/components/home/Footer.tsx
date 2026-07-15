import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pb-10 pt-3 text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10">
      <div className="inline-flex items-center gap-2 text-zinc-300">
        <BrainCircuit className="size-4" />
        <span className="text-xs font-bold tracking-[0.12em]">AI PROTÉGÉ</span>
      </div>
      <div className="flex items-center gap-5 text-xs">
        <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        <Link href="/sign-in" className="transition hover:text-white">Sign in</Link>
        <span className="hidden sm:inline">Made for Kiroween Hackathon · Built with Kiro AI</span>
      </div>
    </footer>
  );
}
