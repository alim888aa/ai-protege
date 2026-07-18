"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { type Theme, useTheme } from "./theme";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getClerkAppearance(theme: Theme) {
  const dark = theme === "dark";

  return {
    variables: {
      colorPrimary: dark ? "#8b5cf6" : "#6d4aff",
      colorTextOnPrimaryBackground: "#ffffff",
      colorBackground: dark ? "#18181b" : "#ffffff",
      colorInputBackground: dark ? "#27272a" : "#f4f4f5",
      colorInputText: dark ? "#f4f4f5" : "#18181b",
      colorText: dark ? "#f4f4f5" : "#18181b",
      colorTextSecondary: dark ? "#a1a1aa" : "#52525b",
      borderRadius: "0.75rem",
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    elements: {
      card: "border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/30 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40",
      headerTitle: "font-bold text-zinc-950 dark:text-zinc-50",
      headerSubtitle: "text-zinc-600 dark:text-zinc-400",
      socialButtonsBlockButton:
        "border border-zinc-300 bg-white shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700",
      socialButtonsBlockButtonText: "font-medium text-zinc-700 dark:text-zinc-200",
      formButtonPrimary:
        "bg-violet-600 shadow-lg transition hover:bg-violet-700 hover:shadow-xl dark:bg-violet-500 dark:hover:bg-violet-400",
      formFieldInput:
        "border-zinc-300 bg-white text-zinc-950 focus:border-violet-500 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50",
      formFieldLabel: "font-medium text-zinc-700 dark:text-zinc-300",
      footerActionLink: "font-medium text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200",
      identityPreviewEditButton: "text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200",
      userButtonPopoverCard:
        "border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/30 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40",
      userButtonPopoverActionButton: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      userButtonPopoverActionButtonText: "text-zinc-700 dark:text-zinc-200",
      userButtonPopoverFooter: "border-t border-zinc-200 dark:border-zinc-800",
      avatarBox: "ring-2 ring-violet-500/25",
    },
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ClerkProvider appearance={getClerkAppearance(theme)}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
