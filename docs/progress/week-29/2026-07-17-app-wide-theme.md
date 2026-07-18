# App-wide theme

## Changed

Added one persisted root theme with dark as the first-visit default and a light/dark toggle. Marketing, pricing, billing, Clerk, dashboard, review, teaching, completion, and results now use neutral zinc surfaces with violet primary actions. The landing Excalidraw demo and authenticated teaching canvas follow the selected theme.

The independent Excalidraw theme control was removed so the app toggle stays authoritative, and the dashboard subscription control now has matching light and dark states.

Moved the theme toggle from a floating page control into the shared marketing and dashboard navigation headers.

ADR 0003 records the theme ownership, default, and palette rules. The duplicated sign-in and sign-up framing now shares one auth shell.

## Verified

`pnpm lint` and `pnpm build` pass. Browser checks covered the landing page at desktop and mobile widths in dark and light, first-visit dark behavior, light-theme persistence after reload, pricing on mobile, and Clerk sign-in in both themes. The browser console showed no app errors.

## Risk

The dashboard and authenticated learning routes were code- and build-verified, but a clean Playwright session could not visually enter them without an authenticated account. Existing Clerk development-key and middleware deprecation warnings remain outside this theme slice.

## Next

Visually spot-check the dashboard and teaching route in an authenticated browser session. Keep new primary actions violet and preserve status colors for success, warning, and destructive states.

## July 18 Clerk follow-up

Applied Clerk's complete dark base theme at the shared provider, moved the dashboard avatar styling into that same source, and removed the per-button appearance override that dropped dark popover text colors.
