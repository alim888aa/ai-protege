"use client";

import { UserButton } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Protégé</h1>
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "w-9 h-9 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-200",
              userButtonPopoverCard:
                "shadow-2xl shadow-gray-400/30 border border-gray-200/50 bg-gray-100",
              userButtonPopoverActionButton: "hover:bg-gray-200",
            },
          }}
        />
      </div>
    </header>
  );
}
