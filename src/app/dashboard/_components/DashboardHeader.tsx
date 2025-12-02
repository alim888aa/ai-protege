'use client';

import { UserButton } from '@clerk/nextjs';

export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Protégé</h1>
        <UserButton />
      </div>
    </header>
  );
}
