# Polar Subscriptions

## Goal

Sell unlimited AI Protégé access through Polar at $10 monthly or $80 yearly, with a seven-day trial, while keeping the public landing demo and a polished `/pricing` page available. Use Polar Sandbox for the Convex development deployment and reserve Polar production for production.

## Likely Files

`convex/billingActions.ts`, the existing billing webhook and entitlement modules, shared billing components under `src/app/components/billing/`, a new `src/app/pricing/page.tsx`, landing navigation and footer components, generated Convex types, and the development deployment's Polar environment variables.

## Decisions

Use Clerk user IDs as Polar external customer IDs. Keep billing secrets and webhook handling in Convex. Mirror `customer.state_changed` into Convex and revoke access immediately when a subscription becomes past due. Gate authenticated product UI and enforce access plus session ownership on the backend. Keep the landing demo and pricing page free. Share plan presentation and checkout behavior between `/pricing` and the authenticated gate. Use Polar Sandbox for `neighborly-meerkat` with a complete sandbox-only token, webhook secret, and product IDs. Use Polar's normal country-based tax behavior.

## Verification

Run Convex code generation, TypeScript, focused lint, repo lint, and the production build. Verify signed webhook rejection and entitlement transitions with targeted tests or direct function checks. Verify `/pricing`, the paywall, and active-access paths in the browser at desktop and mobile sizes. Confirm both Sandbox products, trials, benefit attachment, webhook endpoint, test-card checkout, and customer portal behavior.

The Sandbox edge-case pass covers cancellation and access revocation, resubscription, monthly/yearly switching, declined or past-due payment behavior, duplicate and retried webhook deliveries, out-of-order events, and trial expiry. Focused regression tests cover full-precision event ordering, duplicate IDs, deterministic overlapping-subscription aggregation, and the retryable 500 response when persistence fails. Use browser-visible Polar and app state as evidence. When Polar Sandbox cannot advance time or force a billing state faithfully, record that limitation and verify the nearest supported state transition without claiming full coverage.

## Risks

The current tree contains unrelated uncommitted landing and vision-flow work that must be preserved. The landing header and footer already have user changes, so pricing navigation edits must be narrow. Sandbox and production credentials are incompatible; changing only the API server without replacing every Polar variable would break checkout and webhook verification. Production remains untouched until the billing slice can be isolated from unrelated working-tree changes. Polar Sandbox does not provide a safe UI control for forcing the configured webhook to fail once, so automatic delivery timing after a real 500 remains provider-controlled.
