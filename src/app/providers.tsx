"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkAppearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorTextOnPrimaryBackground: "#ffffff",
    colorBackground: "#f3f4f6",
    colorInputBackground: "#ffffff",
    colorInputText: "#111827",
    colorText: "#111827",
    colorTextSecondary: "#4b5563",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  elements: {
    card: "shadow-2xl shadow-gray-400/30 border border-gray-200/50 bg-gray-100",
    headerTitle: "text-gray-900 font-bold",
    headerSubtitle: "text-gray-600",
    socialButtonsBlockButton:
      "border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm",
    socialButtonsBlockButtonText: "text-gray-700 font-medium",
    formButtonPrimary:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl",
    formFieldInput:
      "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
    formFieldLabel: "text-gray-700 font-medium",
    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
    identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
    userButtonPopoverCard:
      "shadow-2xl shadow-gray-400/30 border border-gray-200/50 bg-gray-100",
    userButtonPopoverActionButton: "hover:bg-gray-200",
    userButtonPopoverActionButtonText: "text-gray-700",
    userButtonPopoverFooter: "border-t border-gray-200",
    avatarBox: "ring-2 ring-blue-500/20",
  },
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
