# Polar subscriptions

## Changed

Kept the existing live Polar setup unchanged and created a separate `AI Protégé Dev` organization in Polar Sandbox. The Sandbox organization has $10 monthly and $80 yearly products, seven-day trials, an unlimited-access benefit, a scoped organization token, and a webhook aimed at `neighborly-meerkat`. Added explicit billing-environment isolation in Convex so Sandbox and production customers cannot grant access across environments.

Added a public `/pricing` page and shared plan cards for the pricing page and authenticated paywall. The landing header and footer link to pricing, signed-out visitors return after signup, and a completed checkout now shows a temporary activation screen while the webhook catches up. The landing demo remains public.

## Verified

Convex code generation, development function deployment, TypeScript, billing-focused ESLint, and the optimized Next.js build pass. A reviewer checked the Sandbox isolation and pricing experience; the environment fallback, delayed-webhook state, narrow-mobile header, and accessibility findings were fixed. Browser verification confirmed both Sandbox product configurations, the public pricing page from 320px mobile through desktop, and the delayed-webhook activation screen.

The complete monthly Sandbox flow passes with Polar's test card. Checkout showed seven free days and a $10 monthly renewal, the signed `customer.state_changed` webhook unlocked the dashboard, and the customer portal opened successfully. Polar reports the subscription as `trialing` through July 18, 2026 and shows the `AI Learning SaaS Access` benefit grant. The webhook endpoint returns 403 for an invalid signature.

The July 12 edge-case pass used an isolated Clerk/Polar Sandbox customer. A card declined during checkout without granting access. Monthly-to-yearly switching preserved access. Customer cancellation kept access through the remaining trial, while an admin immediate cancellation revoked the benefit and showed the app paywall. Ending a canceled trial forced expiry and revoked access. The same customer then resubscribed successfully.

Manual webhook redelivery returned 202 and left the entitlement state unchanged. Replaying an older active-trial event after revocation did not restore access because the stored event timestamp rejected the stale state. A recurring-failure Sandbox card was accepted for trial setup, then forcing the trial to end moved the subscription to `past_due`; Convex revoked app access and showed the paywall.

Payment recovery also passes. Replacing the failing card with Polar's successful Sandbox card and retrying the overdue payment moved the subscription from `past_due` to `active`, recorded a paid order, and restored dashboard access through the webhook.

Hardened webhook convergence after the edge-case review. Convex now preserves Polar's full webhook timestamp precision, ignores duplicate event IDs, and resolves exact timestamp ties deterministically. Overlapping paid subscriptions are aggregated independently of Polar's array order, so plan switches preserve the longest valid access window and only show scheduled cancellation when every eligible subscription is ending. Missing trial-end values fall back to the subscription period end. Persistence failures explicitly return 500 for Polar retry. Eight focused regression tests cover these rules.

## Remaining risk

All Sandbox values, including the scoped access token and webhook secret, are configured in `neighborly-meerkat` after explicit user approval. The clipboard was cleared after each credential transfer. The isolated edge-case customer remains active with the successful Sandbox card after the recovery test.

Automatic delivery timing after a real transient 5xx was not demonstrated through Polar's Sandbox UI; the local failure-path regression verifies that Convex returns 500 instead of acknowledging failed persistence. Production remains untouched. Full-repo lint continues to report older findings outside this billing slice. The working tree also contains unrelated uncommitted landing and vision-flow work.

## Next

Production deployment remains a separate, explicit future step. The isolated Sandbox edge-case customer can be deleted later if a clean test organization is preferred.
