import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { billingAllowsAccess, requireIdentity } from "./access";
import { shouldApplyEvent } from "./billingWebhookState";
import { polarEnvironment } from "./polarEnvironment";

function currentBilling(ctx: Parameters<typeof requireIdentity>[0], userId: string) {
  return ctx.db
    .query("billingCustomers")
    .withIndex("by_user_environment", (q) =>
      q.eq("userId", userId).eq("polarEnvironment", polarEnvironment())
    )
    .unique();
}

export const getEntitlement = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        hasAccess: false,
        hasCustomer: false,
        status: "signed_out" as const,
        cancelAtPeriodEnd: false,
      };
    }

    const billing = await currentBilling(ctx, identity.subject);

    if (!billing) {
      return {
        hasAccess: false,
        hasCustomer: false,
        status: "inactive" as const,
        cancelAtPeriodEnd: false,
      };
    }

    return {
      hasAccess: billingAllowsAccess(billing),
      hasCustomer: true,
      status: billing.status,
      cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
      currentPeriodEnd: billing.currentPeriodEnd,
      trialEnd: billing.trialEnd,
    };
  },
});

export const requireEntitledUser = internalQuery({
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const billing = await currentBilling(ctx, identity.subject);

    if (!billingAllowsAccess(billing)) {
      throw new Error("An active subscription is required");
    }

    return { userId: identity.subject };
  },
});

export const getCurrentBilling = internalQuery({
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const billing = await currentBilling(ctx, identity.subject);

    return {
      userId: identity.subject,
      hasCustomer: billing !== null,
      hasAccess: billingAllowsAccess(billing),
    };
  },
});

export const applyCustomerState = internalMutation({
  args: {
    userId: v.string(),
    polarEnvironment: v.union(
      v.literal("production"),
      v.literal("sandbox")
    ),
    polarCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
    productId: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("inactive")
    ),
    hasAccess: v.boolean(),
    cancelAtPeriodEnd: v.boolean(),
    currentPeriodEnd: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    eventTimestamp: v.number(),
    eventId: v.string(),
    eventOrderKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("billingCustomers")
      .withIndex("by_user_environment", (q) =>
        q
          .eq("userId", args.userId)
          .eq("polarEnvironment", args.polarEnvironment)
      )
      .unique();

    if (!shouldApplyEvent(existing, args)) {
      return { applied: false };
    }

    const value = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, value);
    } else {
      await ctx.db.insert("billingCustomers", value);
    }

    return { applied: true };
  },
});
