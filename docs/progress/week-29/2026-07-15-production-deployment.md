# Production deployment

## Changed

Cleared the release-blocking ESLint findings. Derived result data now parses during render, concept review initializes editable state through a keyed editor, system theme uses an external-store subscription, and teaching panels use pointer capture without reading DOM refs during render. Removed the unused inactivity timer from the active teaching path and excluded local QA captures and package caches from source control. Removed unauthenticated test-data mutations and added a hard global limit of 150 accepted landing-demo attempts per UTC day alongside the existing per-browser limit. Aborted and failed provider streams keep their quota claims so they cannot be used to bypass the cost ceiling.

Configured the existing Convex production deployment `beaming-giraffe-567` for live Polar billing. Reused the existing Polar webhook, retargeted it from the development deployment to `https://beaming-giraffe-567.convex.site/polar/webhook`, kept `customer.state_changed` as its only event, rotated its signing secret, and stored the final secret in production Convex without printing it. The live monthly and yearly product IDs, production server mode, application URL, scoped access token, and signing secret are all present.

## Verified

ESLint completes with zero findings. TypeScript, all eight billing webhook regression tests, and the optimized Next.js build pass. Local browser checks confirm the landing and pricing pages render at desktop and mobile widths with no console errors. The single local warning correctly identifies Clerk development keys; the user confirmed Vercel has the production Clerk deployment values.

Convex deployed successfully to `beaming-giraffe-567` with the billing and landing-demo tables and functions. A direct unsigned POST to the production Polar webhook returned `403`, confirming that signature verification is active. The production billing environment was checked by expected values and secret formats without displaying credentials.

Vercel deployed commit `4f7f098` successfully. Live checks against `ai-protege.xyz` returned `200` for the landing, pricing, sign-in, and dashboard routes. Playwright verified the production pricing page at desktop and mobile widths with the $10 monthly plan, $80 yearly plan, seven-day trial, unlimited benefits, and no browser errors. Clicking the monthly trial button while signed out reached the production Clerk sign-up page and preserved `plan=monthly` in the return URL.

## Remaining risk

Authenticated review and teaching interactions still need a production smoke test because the isolated browser runner has no Clerk test identity. A complete live checkout, entitlement, customer-portal, and cancellation pass would create a real production customer and therefore remains owner-run; those cases passed in Polar Sandbox. The release combines landing, teaching-flow, access-control, and billing changes in one deployment. URL importing retains a known SSRF risk at the user's direction and needs a pinned, redirect-aware downloader in immediate follow-up work.

## Next

Run one owner-controlled production trial from checkout through cancellation, then harden URL importing in a focused follow-up.
