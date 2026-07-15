import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregatePaidSubscriptions,
  buildEventOrderKey,
  persistWebhookMutation,
  shouldApplyEvent,
} from "./billingWebhookState.ts";

test("preserves webhook timestamp precision below one millisecond", () => {
  const earlier = buildEventOrderKey(
    "2026-07-12T10:00:00.000001Z",
    "event-b"
  );
  const later = buildEventOrderKey(
    "2026-07-12T10:00:00.000002Z",
    "event-a"
  );

  assert.ok(earlier < later);
});

test("orders timestamps beyond nanosecond precision", () => {
  const earlier = buildEventOrderKey(
    "2026-07-12T10:00:00.1234567891Z",
    "event-z"
  );
  const later = buildEventOrderKey(
    "2026-07-12T10:00:00.1234567892Z",
    "event-a"
  );

  assert.equal(
    shouldApplyEvent(
      { eventId: "event-z", eventOrderKey: earlier, eventTimestamp: 0 },
      { eventId: "event-a", eventOrderKey: later, eventTimestamp: 0 }
    ),
    true
  );
});

test("ignores duplicate and older events", () => {
  const eventOrderKey = buildEventOrderKey(
    "2026-07-12T10:00:00.123456Z",
    "event-b"
  );
  const existing = {
    eventId: "event-b",
    eventOrderKey,
    eventTimestamp: Date.parse("2026-07-12T10:00:00.123Z"),
  };

  assert.equal(
    shouldApplyEvent(existing, {
      eventId: "event-b",
      eventOrderKey,
      eventTimestamp: existing.eventTimestamp,
    }),
    false
  );
  assert.equal(
    shouldApplyEvent(existing, {
      eventId: "event-a",
      eventOrderKey: buildEventOrderKey(
        "2026-07-12T10:00:00.123455Z",
        "event-a"
      ),
      eventTimestamp: existing.eventTimestamp,
    }),
    false
  );
});

test("uses the event ID as a stable tie-breaker", () => {
  const timestamp = "2026-07-12T10:00:00.123456Z";
  const lower = buildEventOrderKey(timestamp, "event-a");
  const higher = buildEventOrderKey(timestamp, "event-b");

  assert.equal(
    shouldApplyEvent(
      { eventId: "event-a", eventOrderKey: lower, eventTimestamp: 0 },
      { eventId: "event-b", eventOrderKey: higher, eventTimestamp: 0 }
    ),
    true
  );
  assert.equal(
    shouldApplyEvent(
      { eventId: "event-b", eventOrderKey: higher, eventTimestamp: 0 },
      { eventId: "event-a", eventOrderKey: lower, eventTimestamp: 0 }
    ),
    false
  );
});

test("aggregates overlapping subscriptions independently of array order", () => {
  const subscriptions = [
    {
      id: "monthly-subscription",
      product_id: "monthly",
      status: "trialing",
      cancel_at_period_end: true,
      current_period_end: "2026-07-20T00:00:00Z",
      trial_end: "2026-07-20T00:00:00Z",
    },
    {
      id: "yearly-subscription",
      product_id: "yearly",
      status: "active",
      cancel_at_period_end: false,
      current_period_end: "2027-07-12T00:00:00Z",
      trial_end: null,
    },
  ];
  const paidProducts = new Set(["monthly", "yearly"]);

  const forward = aggregatePaidSubscriptions(subscriptions, paidProducts);
  const reversed = aggregatePaidSubscriptions(
    [...subscriptions].reverse(),
    paidProducts
  );

  assert.deepEqual(forward, reversed);
  assert.deepEqual(forward, {
    subscriptionId: "yearly-subscription",
    productId: "yearly",
    status: "active",
    hasAccess: true,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: Date.parse("2027-07-12T00:00:00Z"),
    trialEnd: undefined,
  });
});

test("returns an inactive state when no configured product is active", () => {
  assert.deepEqual(aggregatePaidSubscriptions([], new Set(["monthly"])), {
    status: "inactive",
    hasAccess: false,
    cancelAtPeriodEnd: false,
  });
});

test("uses the effective period end when a trial end is absent", () => {
  const state = aggregatePaidSubscriptions(
    [
      {
        id: "trial-with-explicit-end",
        product_id: "monthly",
        status: "trialing",
        cancel_at_period_end: false,
        current_period_end: "2026-07-20T00:00:00Z",
        trial_end: "2026-07-20T00:00:00Z",
      },
      {
        id: "trial-with-period-end",
        product_id: "yearly",
        status: "trialing",
        cancel_at_period_end: false,
        current_period_end: "2026-07-30T00:00:00Z",
        trial_end: null,
      },
    ],
    new Set(["monthly", "yearly"])
  );

  assert.equal(state.trialEnd, Date.parse("2026-07-30T00:00:00Z"));
});

test("reports persistence failures so the webhook can return 500", async () => {
  assert.equal(await persistWebhookMutation(async () => undefined), true);
  assert.equal(
    await persistWebhookMutation(async () => {
      throw new Error("temporary database failure");
    }),
    false
  );
});
