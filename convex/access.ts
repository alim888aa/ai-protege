import type { MutationCtx, QueryCtx } from "./_generated/server";
import { polarEnvironment } from "./polarEnvironment";

type DatabaseContext = Pick<QueryCtx | MutationCtx, "auth" | "db">;

type BillingAccess = {
  hasAccess: boolean;
  status: "active" | "trialing" | "inactive";
  currentPeriodEnd?: number;
  trialEnd?: number;
};

export function billingAllowsAccess(
  billing: BillingAccess | null,
  now = Date.now()
) {
  if (!billing?.hasAccess) {
    return false;
  }

  const accessEndsAt =
    billing.status === "trialing"
      ? billing.trialEnd ?? billing.currentPeriodEnd
      : billing.currentPeriodEnd;

  return accessEndsAt !== undefined && accessEndsAt > now;
}

export async function requireIdentity(ctx: DatabaseContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

export async function requirePaidAccess(ctx: DatabaseContext) {
  const identity = await requireIdentity(ctx);
  const billing = await ctx.db
    .query("billingCustomers")
    .withIndex("by_user_environment", (q) =>
      q
        .eq("userId", identity.subject)
        .eq("polarEnvironment", polarEnvironment())
    )
    .unique();

  if (!billingAllowsAccess(billing)) {
    throw new Error("An active subscription is required");
  }

  return identity;
}

export async function requireOwnedSession(
  ctx: DatabaseContext,
  sessionId: string
) {
  const identity = await requirePaidAccess(ctx);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
    .unique();

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== identity.subject) {
    throw new Error("Not authorized to access this session");
  }

  return session;
}

export async function requireOwnedSourceMaterial(
  ctx: DatabaseContext,
  sessionId: string
) {
  const identity = await requirePaidAccess(ctx);
  const sourceMaterial = await ctx.db
    .query("sourceMaterial")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();

  if (!sourceMaterial) {
    throw new Error("Source material not found");
  }

  if (sourceMaterial.userId !== identity.subject) {
    throw new Error("Not authorized to access this source material");
  }

  return sourceMaterial;
}
