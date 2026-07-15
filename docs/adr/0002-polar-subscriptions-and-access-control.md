# ADR 0002: Polar Subscriptions And Access Control

## Status

Accepted.

## Applies To

Polar checkout and customer portal flows, Polar production and Sandbox separation, the public pricing page, Convex billing data and webhooks, authenticated product access, and session ownership checks.

## Context

AI Protégé will sell unlimited access through two Polar subscriptions: $10 monthly or $80 yearly. Both plans include a seven-day free trial. The public landing demo stays available without a subscription.

Clerk already identifies signed-in users and Convex owns application backend behavior. Some existing Convex queries, mutations, and HTTP teaching routes look up sessions by a caller-provided ID without consistently checking that the signed-in user owns the session. A visual paywall alone would therefore leave paid access easy to bypass.

Polar provides a stable external customer ID, hosted checkout, a hosted customer portal, signed webhooks, and a customer-state event containing active subscriptions. Product billing intervals are fixed after creation, so monthly and yearly billing need separate products.

## Decision

Polar is the subscription provider. The live products are AI Protégé Monthly at $10 USD per month and AI Protégé Yearly at $80 USD per year. Each product has a seven-day trial and grants the existing AI Learning SaaS Access benefit. Polar's normal country-based tax behavior remains enabled. The old unused $5 monthly product is archived.

The Clerk user ID is sent to Polar as the customer's external ID. Convex creates authenticated checkout and customer-portal sessions, holds all Polar credentials, receives signed Polar webhooks, and stores the latest customer access state. Next.js does not gain a second billing backend.

`customer.state_changed` is the billing synchronization event. Convex grants access only when the event contains an active subscription for one of the two configured AI Protégé product IDs. Trialing subscriptions count as active. Scheduled cancellation keeps access through the paid period. Past-due, revoked, expired, or missing subscriptions lose access immediately.

Webhook ordering preserves Polar's full timestamp precision and uses the signed webhook ID as a deterministic tie-breaker. Duplicate IDs and older ordering keys cannot rewrite customer state. If Polar briefly reports overlapping monthly and yearly subscriptions during a plan switch, Convex aggregates every eligible subscription: any valid subscription preserves access, the latest access end is stored, and cancellation is scheduled only when every eligible subscription is ending. A verified webhook returns 202 only after Convex persists or intentionally ignores the state. Persistence failures return 500 so Polar can retry safely.

Convex also checks the stored trial or billing-period end on every entitlement read. Access closes when that timestamp passes even if a terminal webhook is delayed or missed. A later signed webhook can restore access after payment recovery.

Polar Sandbox is the only billing environment used by the Convex development deployment. It has its own products, benefit, webhook, organization token, customers, and subscriptions. The Polar SDK requires `POLAR_SERVER` to be explicitly set to `sandbox` or `production`; a missing value stops billing actions instead of choosing an environment. Production Polar credentials and product IDs must never be copied into a development deployment.

The landing page, public `/pricing` page, and limited demo remain public. The pricing page and signed-in subscription gate reuse one plan-card and checkout component so the prices, trial copy, and purchase behavior cannot drift. Signed-out pricing calls to action go through Clerk signup before checkout. Signed-in product pages show the shared subscription gate before mounting lesson UI. Server-side Convex functions enforce both subscription access and session ownership for paid product work. Middleware and client UI are convenience layers rather than security boundaries.

## Consequences

Checkout, access, cancellations, and renewals remain tied together through one customer identity. A webhook delay can briefly delay access after checkout, so the post-checkout screen should explain that activation may take a moment and allow a refresh.

Development billing can be tested end to end with Stripe test cards without creating live Polar customers or orders. Sandbox and production data are fully separate, so every environment needs its own product IDs, token, and webhook secret. Switching environments without replacing the complete credential set is invalid.

Every new paid Convex function must call the shared entitlement check. Every function that accepts a session ID must verify ownership before reading, writing, or spending AI credits. Future work must not trust a client-provided subscription status or email address.

The Polar account must complete identity verification, payout setup, and account review before live customers can buy. Those steps require the account owner and remain outside automated setup.

## Alternatives Considered

Polling Polar during every request would avoid local billing state, but it would add latency and make product access depend on Polar being reachable for every lesson action.

Using Next.js billing routes would follow Polar's framework guide, but it would split backend secrets and access rules across Next.js and Convex despite the existing backend boundary.

Using production Polar products from the Convex development deployment would require real payment methods and would mix test customers with live financial records. Polar Sandbox provides the same checkout and webhook flow without that risk.

Checking entitlement only in the page UI would be smaller, but direct calls to Convex or teaching HTTP endpoints could bypass it.
