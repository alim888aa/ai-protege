export type PaidSubscription = {
  id: string;
  product_id: string;
  status: "active" | "trialing";
  cancel_at_period_end: boolean;
  current_period_end: string;
  trial_end: string | null;
};

type StoredEvent = {
  eventId?: string;
  eventOrderKey?: string;
  eventTimestamp: number;
};

type IncomingEvent = {
  eventId: string;
  eventOrderKey: string;
  eventTimestamp: number;
};

export function buildEventOrderKey(timestamp: string, eventId: string) {
  const match = timestamp.match(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?Z$/
  );
  if (!match) {
    throw new Error("Polar webhook timestamp must be UTC ISO-8601");
  }

  const fractionalSeconds = (match[2] ?? "0").replace(/0+$/, "") || "0";
  return `${match[1]}.${fractionalSeconds}Z#${eventId}`;
}

function compareEventOrderKeys(left: string, right: string) {
  const pattern =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)Z#(.*)$/;
  const leftParts = left.match(pattern);
  const rightParts = right.match(pattern);
  if (!leftParts || !rightParts) {
    throw new Error("Invalid stored Polar webhook ordering key");
  }

  if (leftParts[1] !== rightParts[1]) {
    return leftParts[1] < rightParts[1] ? -1 : 1;
  }

  const fractionLength = Math.max(leftParts[2].length, rightParts[2].length);
  const leftFraction = leftParts[2].padEnd(fractionLength, "0");
  const rightFraction = rightParts[2].padEnd(fractionLength, "0");
  if (leftFraction !== rightFraction) {
    return leftFraction < rightFraction ? -1 : 1;
  }

  if (leftParts[3] === rightParts[3]) {
    return 0;
  }
  return leftParts[3] < rightParts[3] ? -1 : 1;
}

export function shouldApplyEvent(
  existing: StoredEvent | null,
  incoming: IncomingEvent
) {
  if (!existing) {
    return true;
  }

  if (existing.eventId === incoming.eventId) {
    return false;
  }

  if (existing.eventOrderKey) {
    return compareEventOrderKeys(
      existing.eventOrderKey,
      incoming.eventOrderKey
    ) < 0;
  }

  return existing.eventTimestamp <= incoming.eventTimestamp;
}

function compareSubscriptions(left: PaidSubscription, right: PaidSubscription) {
  const endDifference =
    Date.parse(right.current_period_end) - Date.parse(left.current_period_end);
  if (endDifference !== 0) {
    return endDifference;
  }

  if (left.status !== right.status) {
    return left.status === "active" ? -1 : 1;
  }

  const productDifference = left.product_id.localeCompare(right.product_id);
  return productDifference !== 0
    ? productDifference
    : left.id.localeCompare(right.id);
}

export function aggregatePaidSubscriptions(
  subscriptions: PaidSubscription[],
  paidProductIds: ReadonlySet<string>
) {
  const eligible = subscriptions
    .filter((subscription) => paidProductIds.has(subscription.product_id))
    .sort(compareSubscriptions);

  if (eligible.length === 0) {
    return {
      status: "inactive" as const,
      hasAccess: false,
      cancelAtPeriodEnd: false,
    };
  }

  const primary = eligible[0];
  const status: "active" | "trialing" = eligible.some(
    (subscription) => subscription.status === "active"
  )
    ? "active"
    : "trialing";
  const currentPeriodEnd = Math.max(
    ...eligible.map((subscription) => Date.parse(subscription.current_period_end))
  );
  const trialEnds = eligible.map((subscription) =>
    Date.parse(subscription.trial_end ?? subscription.current_period_end)
  );

  return {
    subscriptionId: primary.id,
    productId: primary.product_id,
    status,
    hasAccess: true,
    cancelAtPeriodEnd: eligible.every(
      (subscription) => subscription.cancel_at_period_end
    ),
    currentPeriodEnd,
    trialEnd:
      status === "trialing" ? Math.max(...trialEnds) : undefined,
  };
}

export async function persistWebhookMutation(
  persist: () => Promise<unknown>
) {
  try {
    await persist();
    return true;
  } catch {
    return false;
  }
}
