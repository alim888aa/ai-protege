# Production deployment

## Goal

Ship the current AI Protégé working tree to `ai-protege.xyz`, update the existing Convex production deployment `beaming-giraffe-567`, and connect the existing Clerk and Polar production environments.

## Files likely touched

Existing lint-failing React components and hooks, ESLint ignores for generated Convex output, release progress notes, and the current application changes already present in the working tree.

## Decisions

Include all current product changes in the release. Keep local package caches and Codex QA screenshots outside source control. Reuse the existing production deployments and skip the optional Convex backup at the user's direction. Cap anonymous live landing-demo responses at 150 per UTC day. Preserve URL imports for this release at the user's direction and record the open server-side request risk.

## Verification

Require zero ESLint findings, passing TypeScript and billing regression tests, a successful optimized build, an independent review, successful Convex and Vercel production deployments, and live smoke tests for public pages, authentication, checkout, entitlement, portal, and cancellation.

## Risks

The release combines several months of landing, teaching-flow, billing, and access-control work. Production Polar and Convex credentials must remain isolated from Sandbox. A live checkout smoke test may create a real trial customer, so any real payment step stays visible to the account owner. URL import still follows redirects after incomplete private-address checks; the user explicitly chose to preserve that behavior for this release, so SSRF hardening remains urgent follow-up work.
