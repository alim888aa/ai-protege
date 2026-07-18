'use client';

import { useState } from 'react';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export function ManageSubscriptionButton() {
  const entitlement = useQuery(api.billing.getEntitlement);
  const createCustomerPortal = useAction(api.billingActions.createCustomerPortal);
  const [isOpening, setIsOpening] = useState(false);

  if (!entitlement?.hasAccess) {
    return null;
  }

  const openPortal = async () => {
    setIsOpening(true);
    try {
      const portal = await createCustomerPortal();
      window.location.assign(portal.url);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={isOpening}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-800 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-violet-500 dark:hover:bg-zinc-800 dark:hover:text-violet-300"
    >
      {isOpening ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      Manage plan
    </button>
  );
}
