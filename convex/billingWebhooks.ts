import { Webhook } from "standardwebhooks";
import { z } from "zod";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  aggregatePaidSubscriptions,
  buildEventOrderKey,
  persistWebhookMutation,
} from "./billingWebhookState";
import { polarEnvironment } from "./polarEnvironment";

const customerStateEventSchema = z.object({
  type: z.literal("customer.state_changed"),
  timestamp: z.string().datetime(),
  data: z.object({
    type: z.literal("individual"),
    id: z.string(),
    external_id: z.string().nullable().optional(),
    active_subscriptions: z.array(
      z.object({
        id: z.string(),
        product_id: z.string(),
        status: z.enum(["active", "trialing"]),
        cancel_at_period_end: z.boolean(),
        current_period_end: z.string().datetime(),
        trial_end: z.string().datetime().nullable(),
      })
    ),
  }),
});

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export const polarWebhook = httpAction(async (ctx, request) => {
  const body = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let verified: unknown;
  try {
    const verifier = new Webhook(
      new TextEncoder().encode(requiredEnvironment("POLAR_WEBHOOK_SECRET")),
      { format: "raw" }
    );
    verified = verifier.verify(body, headers);
  } catch {
    return new Response("Invalid webhook signature", { status: 403 });
  }

  const parsedEvent = customerStateEventSchema.safeParse(verified);
  if (!parsedEvent.success) {
    return new Response("Invalid webhook payload", { status: 400 });
  }
  const event = parsedEvent.data;

  const customer = event.data;
  if (!customer.external_id) {
    return new Response(null, { status: 202 });
  }
  const userId = customer.external_id;

  const paidProductIds = new Set([
    requiredEnvironment("POLAR_MONTHLY_PRODUCT_ID"),
    requiredEnvironment("POLAR_YEARLY_PRODUCT_ID"),
  ]);
  const billingState = aggregatePaidSubscriptions(
    customer.active_subscriptions,
    paidProductIds
  );
  const eventId = headers["webhook-id"];
  const eventTimestamp = Date.parse(event.timestamp);
  const eventOrderKey = buildEventOrderKey(event.timestamp, eventId);

  const persisted = await persistWebhookMutation(() =>
    ctx.runMutation(internal.billing.applyCustomerState, {
      userId,
      polarEnvironment: polarEnvironment(),
      polarCustomerId: customer.id,
      ...billingState,
      eventTimestamp,
      eventId,
      eventOrderKey,
    })
  );

  if (!persisted) {
    console.error("Polar webhook state persistence failed");
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response(null, { status: 202 });
});
