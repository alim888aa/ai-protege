"use node";

import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { polarEnvironment } from "./polarEnvironment";

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function polarClient() {
  return new Polar({
    accessToken: requiredEnvironment("POLAR_ACCESS_TOKEN"),
    server: polarEnvironment(),
  });
}

function appUrl() {
  return requiredEnvironment("APP_URL").replace(/\/$/, "");
}

export const createCheckout = action({
  args: {
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const billing = await ctx.runQuery(internal.billing.getCurrentBilling, {});
    if (billing.hasAccess) {
      throw new Error("Manage your active subscription from the customer portal");
    }

    const productId = requiredEnvironment(
      args.plan === "monthly"
        ? "POLAR_MONTHLY_PRODUCT_ID"
        : "POLAR_YEARLY_PRODUCT_ID"
    );
    const baseUrl = appUrl();
    const checkout = await polarClient().checkouts.create({
      products: [productId],
      allowTrial: true,
      externalCustomerId: identity.subject,
      customerEmail: identity.email ?? undefined,
      customerName: identity.name ?? undefined,
      successUrl: `${baseUrl}/dashboard?checkout=success`,
      returnUrl: `${baseUrl}/dashboard`,
    });

    return { url: checkout.url };
  },
});

export const createCustomerPortal = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const billing = await ctx.runQuery(internal.billing.getCurrentBilling, {});
    if (!billing.hasCustomer) {
      throw new Error("No Polar customer exists for this account");
    }

    const session = await polarClient().customerSessions.create({
      externalCustomerId: identity.subject,
      returnUrl: `${appUrl()}/dashboard`,
    });

    return { url: session.customerPortalUrl };
  },
});
