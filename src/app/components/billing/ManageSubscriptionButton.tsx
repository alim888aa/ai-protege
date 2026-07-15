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
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
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
