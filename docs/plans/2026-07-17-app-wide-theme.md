# App-wide theme

## Goal

Make dark the default across AI Protégé, add a persistent light/dark toggle, and unify marketing, Clerk, billing, and authenticated surfaces around neutral zinc and violet.

## Files likely touched

Root layout, providers, global CSS, a small theme module and toggle, authentication pages, marketing and pricing components, dashboard accents, and theme-aware landing demo files.

## Decisions

ADR 0003 records the approved choices: dark first-visit default, a saved user toggle, and landing violet as the shared accent.

## Verification

Run lint and production build. Check landing, sign-in, pricing, and dashboard at desktop and mobile widths in both themes. Confirm the saved theme survives navigation and reload, Clerk follows it, and the landing canvas remains visible and usable.

## Risks

Hardcoded colors may leave isolated mismatches. The pre-hydration theme script and the client store must agree to avoid a flash or hydration warning. Embedded Excalidraw colors must remain legible in both themes.
