# Legal pages and project cleanup

## Goal

Remove the remaining legacy hackathon material, then add clear Terms of Service and Privacy Policy pages that accurately describe AI Protégé.

## Files likely touched

The package name, README, root project guidance, landing footer, new shared legal-page components, new `/terms` and `/privacy` routes, and the historical specification directory.

## Decisions

Alimaa operates AI Protégé and can be contacted at `alim888aa88@gmail.com`. Users must be at least 13, and minors need permission from a parent or legal guardian. Mongolian law governs the terms while mandatory rights in a user's home jurisdiction remain available.

This is static content and historical cleanup. It does not alter product runtime, data flow, authentication, billing, or backend architecture, so no ADR is needed.

## Verification

Confirm no legacy hackathon references remain. Run lint and a production build. Browser-check both legal routes at desktop and mobile widths in dark and light themes, and verify every footer link.

## Risks

The pages are a practical baseline and should receive professional legal review before material growth or entry into regulated markets. The policy must avoid promises about deletion, retention, or provider behavior that the current product cannot guarantee.
