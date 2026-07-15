# Interactive Landing Canvas Demo

## Goal

Turn the landing hero into a usable preview of AI Protege's core loop: draw, explain, and receive one source-aware question from an AI student.

## Likely Files

- `src/app/page.tsx`
- `src/app/components/home/HeroSection.tsx`
- `src/app/components/home/LandingCanvasDemo.tsx`
- `src/app/components/home/landingDemoScene.ts`
- `src/app/components/ExcalidrawWrapper.tsx`
- `convex/landingDemo.ts`
- `convex/http.ts`
- `convex/schema.ts`
- `src/app/globals.css`
- `docs/progress/week-28/`

## Decisions

The demo is the hero centerpiece. It uses a fixed stack-data-structure lesson while positioning the product for learners across subjects. Each anonymous browser gets one live AI response per day. The demo stays separate from Clerk, saved sessions, and authenticated lesson navigation. Convex is the only backend and the browser calls its landing-demo HTTP action directly. Its canvas, floating chat, and floating input should mirror the authenticated teaching surface.

The landing page uses a dark editorial theme around the product surface. The seeded stack diagram must stay compact and keep arrows away from labels and overlay panels. The canvas viewport stays fixed while its drawing tools remain active. Submitting the unchanged starter explanation returns a local canned question immediately and does not call the provider; edited explanations use the Convex-hosted OpenAI stream with low-detail vision. The current image is authoritative, so lesson facts cannot reintroduce removed canvas elements.

## Verification

Run lint and build. In the browser, verify desktop and mobile layouts, direct drawing without an activation step, text submission by button and Enter, the used-limit state, the fallback state, a nonblank canvas, and keyboard focus remaining scoped to the demo.

## Risks

Excalidraw can add meaningful landing-page JavaScript and can capture pointer or wheel input. Anonymous browser identifiers are easy to reset and should be treated as cost friction rather than strong abuse prevention. Canvas image export must be bounded before it reaches the Convex endpoint.
