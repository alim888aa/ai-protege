"use client";

import { UserButton } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";
import { ManageSubscriptionButton } from "@/app/components/billing";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export function DashboardHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200 bg-white/85 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-violet-600 p-1.5 shadow-md transition-all duration-200 group-hover:bg-violet-700 group-hover:shadow-lg dark:bg-violet-500 dark:group-hover:bg-violet-400">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">AI Protégé</h1>
        </Link>
        <div className="flex items-center gap-3">
          <ManageSubscriptionButton />
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-9 w-9 ring-2 ring-violet-500/25 transition-all duration-200 hover:ring-violet-500/50",
                userButtonPopoverCard:
                  "border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/30 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40",
                userButtonPopoverActionButton: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
