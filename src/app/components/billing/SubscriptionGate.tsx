'use client';

import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { PricingPlans } from './PricingPlans';

interface SubscriptionGateProps {
  children: ReactNode;
  checkoutPending?: boolean;
}

export function SubscriptionGate({ children, checkoutPending = false }: SubscriptionGateProps) {
  const entitlement = useQuery(api.billing.getEntitlement);

  if (entitlement === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <LoaderCircle className="h-7 w-7 animate-spin" aria-label="Checking subscription" />
      </div>
    );
  }

  if (entitlement.hasAccess) {
    return children;
  }

  if (checkoutPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white">
        <div className="max-w-md rounded-[2rem] border border-white/12 bg-zinc-900 p-8 text-center sm:p-10">
          <LoaderCircle className="mx-auto size-8 animate-spin text-violet-300" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Activating your membership</h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Polar confirmed your checkout. Access usually appears within a few seconds while the secure webhook finishes.
          </p>
          <a
            href="/dashboard?checkout=success"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-zinc-950 transition hover:bg-violet-200"
          >
            Check again
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-5 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
            AI Protégé membership
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Teach without limits.
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-400">
            Draw, explain, ask for hints, and create as many learning sessions as you need.
            Every plan starts with seven free days.
          </p>
        </div>
        <PricingPlans surface="gate" />
        <p className="mt-6 text-sm text-zinc-500">
          A payment method is required for the trial. Cancel before day seven and you will not be charged.
          Taxes are handled by Polar based on your country.
        </p>
      </div>
    </main>
  );
}
