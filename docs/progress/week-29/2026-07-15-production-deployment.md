# Production deployment

## Changed

Cleared the release-blocking ESLint findings. Derived result data now parses during render, concept review initializes editable state through a keyed editor, system theme uses an external-store subscription, and teaching panels use pointer capture without reading DOM refs during render. Removed the unused inactivity timer from the active teaching path and excluded local QA captures and package caches from source control. Removed unauthenticated test-data mutations and added a hard global limit of 150 accepted landing-demo attempts per UTC day alongside the existing per-browser limit. Aborted and failed provider streams keep their quota claims so they cannot be used to bypass the cost ceiling.

## Verified

ESLint completes with zero findings. TypeScript, all eight billing webhook regression tests, and the optimized Next.js build pass. Local browser checks confirm the landing and pricing pages render at desktop and mobile widths with no console errors. The single local warning correctly identifies Clerk development keys; the user confirmed Vercel has the production Clerk deployment values.

## Remaining risk

Authenticated review and teaching interactions still need a production smoke test because the isolated browser runner has no Clerk test identity. The release combines landing, teaching-flow, access-control, and billing changes in one deployment. Production Polar and Convex configuration must be checked by variable name without exposing secret values. URL importing retains a known SSRF risk at the user's direction and needs a pinned, redirect-aware downloader in immediate follow-up work.

## Next

Complete independent review, commit and push the release, update `beaming-giraffe-567`, configure the live Polar webhook and production billing variables, deploy Vercel, and smoke-test the public and authenticated production flows.
