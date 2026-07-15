# ADR 0001: Controlled Landing Canvas Demo

## Status

Accepted.

## Applies To

The landing-page hero, its embedded Excalidraw canvas, the anonymous demo AI endpoint, and the app-wide backend boundary.

## Context

The landing page currently explains the product with a screenshot. Visitors cannot experience the core loop of drawing, explaining, and receiving a question from an AI student.

The authenticated teaching route already supports that loop, but it also owns saved sessions, source retrieval, topic navigation, hints, onboarding, and movable panels. Reusing that route inside the landing page would make a marketing demo depend on the full learning runtime.

Backend work is currently split between Convex functions and Next.js API routes or server actions. That creates two places for secrets, validation, rate limits, and AI behavior to drift.

## Decision

The landing page will use a controlled, landing-only demo as its hero centerpiece.

The demo uses a fixed stack-data-structure lesson while the surrounding product language stays relevant to learners across subjects. Visitors can draw on a real Excalidraw canvas, type an explanation, and receive one streamed, vision-aware AI-student response. The canvas viewport stays fixed so it cannot pan or zoom while embedded in the landing page; its drawing and editing tools remain usable.

Convex is the app's only backend and API surface. Frontend code calls Convex functions or Convex HTTP actions directly. New Next.js API routes and server actions must not contain app backend, data, or AI logic. Existing Next.js backend routes are migration debt and should move to Convex in focused slices rather than being extended.

The landing demo calls a dedicated Convex HTTP action directly. It must not use a Next.js API proxy. Canvas images use low-detail vision processing, and the current exported image is authoritative about visible elements; source facts may check accuracy but must never reconstruct deleted starter content. The anonymous live response is limited to one request per browser per day using a hashed visitor identifier stored in Convex. A second global quota allows at most 150 accepted live attempts per UTC day across every visitor, which bounds provider spend even when browser identifiers are rotated or streams are aborted. The demo does not create accounts, persist lessons, or enter the authenticated teaching flow. Accepted attempts consume their claims even when the provider fails or the visitor aborts, and the UI may show a clearly identified local fallback.

Desktop keeps the canvas and conversation visible together. Mobile keeps the canvas directly usable while the AI chat starts collapsed to preserve drawing room.

The landing demo may share low-level canvas and export utilities. It must not import authenticated teaching orchestration, session hooks, lesson navigation, or Clerk-specific UI.

## Consequences

The homepage can demonstrate the real product interaction without inheriting the authenticated app's loading and failure states. The fixed lesson also keeps the first interaction fast and easy to understand. Convex owns the OpenAI secret, request validation, and the shared response limit in one backend.

The product will maintain a small amount of demo-specific UI and prompting. The anonymous browser identifier can still be reset by clearing browser storage. The global daily quota provides the hard cost boundary, while the per-browser limit remains ordinary-use friction.

Future work should preserve page scrolling over the fixed canvas, scoped keyboard handling, a useful no-AI fallback, the direct Convex boundary, and the separation between the landing demo and persisted learning sessions.

## Alternatives Considered

Embedding the complete teaching route would maximize visual reuse but would also couple the homepage to authentication, Convex data, and session state.

Proxying the demo through a Next.js API route would keep it same-origin, but it would split backend behavior and secrets across Next.js and Convex. The browser therefore calls Convex directly.

Using only a rehearsed response would be cheaper and more predictable, but it would not prove that the AI can react to the visitor's explanation and drawing. The unchanged starter explanation receives a canned response; edited explanations use the live route.

Using a water-cycle lesson would signal broader subject coverage, but the stack example more faithfully mirrors the current product surface and keeps the landing demo visually consistent.
