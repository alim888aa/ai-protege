'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

type Plan = 'monthly' | 'yearly';

const planFeatures = [
  'Unlimited learning sessions',
  'Unlimited AI questions and hints',
  'Canvas teaching and source-grounded feedback',
  'Cancel anytime from the customer portal',
];

interface PricingPlansProps {
  surface?: 'page' | 'gate';
}

export function PricingPlans({ surface = 'page' }: PricingPlansProps) {
  const { isLoaded, isSignedIn } = useUser();
  const entitlement = useQuery(api.billing.getEntitlement);
  const createCheckout = useAction(api.billingActions.createCheckout);
  const createCustomerPortal = useAction(api.billingActions.createCustomerPortal);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setIsOpeningPortal(true);
    setError(null);

    try {
      const portal = await createCustomerPortal();
      window.location.assign(portal.url);
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : 'Unable to open billing. Please try again.'
      );
      setIsOpeningPortal(false);
    }
  };

  const choosePlan = async (plan: Plan) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      const returnTo = `/pricing?plan=${plan}`;
      window.location.assign(`/sign-up?redirect_url=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (entitlement?.hasAccess) {
      await openPortal();
      return;
    }

    setLoadingPlan(plan);
    setError(null);

    try {
      const checkout = await createCheckout({ plan });
      window.location.assign(checkout.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to open checkout. Please try again.'
      );
      setLoadingPlan(null);
    }
  };

  const isCheckingMembership = !isLoaded || (isSignedIn && entitlement === undefined);
  const actionLabel = isCheckingMembership
    ? 'Checking membership'
    : entitlement?.hasAccess
      ? 'Manage membership'
      : 'Start seven days free';
  const busy = loadingPlan !== null || isOpeningPortal || isCheckingMembership;

  return (
    <div className={surface === 'gate' ? 'mx-auto max-w-5xl' : ''}>
      <div className="grid items-stretch gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <PlanCard
          plan="monthly"
          name="Monthly"
          price="$10"
          cadence="every month"
          detail="The flexible rhythm"
          actionLabel={actionLabel}
          loading={loadingPlan === 'monthly' || isOpeningPortal || isCheckingMembership}
          disabled={busy}
          onChoose={() => choosePlan('monthly')}
        />
        <PlanCard
          plan="yearly"
          name="Yearly"
          price="$80"
          cadence="every year"
          detail="$6.67 per month · save $40"
          badge="Best value"
          actionLabel={actionLabel}
          loading={loadingPlan === 'yearly' || isOpeningPortal || isCheckingMembership}
          disabled={busy}
          onChoose={() => choosePlan('yearly')}
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-5 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </p>
      )}

      {entitlement?.hasCustomer && !entitlement.hasAccess && (
        <button
          type="button"
          onClick={openPortal}
          disabled={busy}
          className="mt-5 text-sm font-semibold text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white disabled:opacity-50"
        >
          {isOpeningPortal ? 'Opening billing…' : 'Manage an existing subscription'}
        </button>
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  name: string;
  price: string;
  cadence: string;
  detail: string;
  badge?: string;
  actionLabel: string;
  loading: boolean;
  disabled: boolean;
  onChoose: () => void;
}

function PlanCard({
  plan,
  name,
  price,
  cadence,
  detail,
  badge,
  actionLabel,
  loading,
  disabled,
  onChoose,
}: PlanCardProps) {
  const yearly = plan === 'yearly';

  return (
    <article
      className={
        yearly
          ? 'relative flex min-h-[34rem] flex-col overflow-hidden rounded-[2rem] bg-violet-300 p-7 text-zinc-950 shadow-[0_24px_80px_-32px_rgba(196,181,253,0.7)] sm:p-9'
          : 'flex min-h-[32rem] flex-col rounded-[2rem] border border-white/12 bg-zinc-900 p-7 text-white sm:p-9 lg:mt-8'
      }
    >
      {yearly && (
        <div aria-hidden="true" className="pointer-events-none absolute -right-5 top-20 rotate-90 text-[5rem] font-black tracking-[-0.08em] text-violet-400/45 sm:text-[6.5rem]">
          40
        </div>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className={yearly ? 'text-xs font-bold tracking-[0.2em] text-violet-950/60' : 'text-xs font-bold tracking-[0.2em] text-zinc-500'}>
            {detail.toUpperCase()}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{name}</h2>
        </div>
        {badge && (
          <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white">
            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-10 border-b border-current/15 pb-8">
        <div className="flex items-end gap-3">
          <span className="text-7xl font-semibold leading-none tracking-[-0.075em] sm:text-8xl">
            {price}
          </span>
          <span className="pb-2 text-sm font-medium opacity-60">{cadence}</span>
        </div>
        <p className="mt-4 text-sm font-semibold">Seven-day free trial first.</p>
      </div>

      <div className="relative mt-8 space-y-4 text-sm">
        {planFeatures.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <span className={yearly ? 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-violet-200' : 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950'}>
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className={yearly ? 'text-zinc-900' : 'text-zinc-300'}>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onChoose}
          disabled={disabled}
          className={
            yearly
              ? 'relative inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-950 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55'
              : 'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-violet-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55'
          }
        >
          {loading ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              <span>{actionLabel}</span>
            </>
          ) : actionLabel}
          {!loading && <ArrowUpRight className="size-4" />}
        </button>
      </div>
    </article>
  );
}
