## Working Style

Keep responses short, direct, and conversational. Ask smart questions when decisions matter. Ask up to 3 questions at a time.

Inspect the repo before proposing broad changes. Explain the current state in plain language before making major edits.

Do not assume product, pricing, architecture, stack, or portfolio-positioning decisions. State the decision that needs to be made and ask the user.

Push back when a request risks messy architecture or duplication and/or cannot be maintained.

Before meaningful feature work, scan the codebase and answer what can be answered from existing code. Then ask focused questions in order, so each answer unlocks the next useful decision.

## Product Direction

AI Protege helps learners understand material by teaching an AI student. The core loop is source material -> extracted concepts -> drawing and explaining on a canvas -> AI questions and source-grounded feedback.

Current polish direction as of 2026-07-09: build a controlled interactive landing-page demo that shows the canvas teaching experience using canned Excalidraw elements. Prefer a landing-only product window over embedding the full authenticated teaching route.

## Source Of Truth

The repo is canonical for implementation.

Use `docs/` for durable project memory, plans, ADRs, and progress notes.

When meaningful progress happens, update the relevant docs before finishing the task.

Delete or rewrite docs that are clearly stale instead of preserving confusion.

## Planning

For meaningful work, create or update a plan under `docs/plans/` before coding.

Tiny bug fixes can skip a plan if the agent explains why.

Plans should be short and practical: goal, files likely touched, decisions needed, verification path, and risks.

## Architecture And ADRs

`docs/adr/` is the canonical ADR location.

For major feature, page, app-flow, data-flow, runtime, payment, auth, AI, Convex, Excalidraw, or landing-demo architecture changes, check whether an ADR already covers the touched area.

If no ADR applies, use `.agents/skills/feature-adr/SKILL.md` before implementation.

Ask before creating or accepting an ADR. Do not write architecture decisions silently.

Write ADRs in plain language. Explain WHY a feature works/implemented the way it is and what future agents must avoid breaking.

## Repo Shape

`src/app/` owns the Next.js App Router app.

`src/app/components/home/` owns the landing page sections.

`src/app/components/ExcalidrawWrapper.tsx` owns the low-level Excalidraw wrapper.

`src/app/teach/[sessionId]/[conceptIndex]/` owns the authenticated teaching experience.

`src/app/dashboard/`, `src/app/review/`, `src/app/complete/`, and `src/app/results/` own the authenticated learning/session flow.

`src/app/actions/` and `src/app/api/` own app-side AI/server routes.

`convex/` owns Convex schema, functions, HTTP routes, RAG, PDF/source processing, and persisted learning session data.

`public/` owns static assets. Replace screenshot-only proof with stronger product visuals when landing polish begins.

## Code Standards

Inspect `git status` before editing files.

All new or edited source files should stay below 400 lines. If a touched file is already larger, refactor the touched area only when it helps the task.

Do not add `useEffect`, `useMemo`, or `useCallback` in new code. Existing usage is technical debt; do not expand it. If an existing hook-heavy component must be touched, prefer reducing hook usage when practical.

Do not use `any`.

Do not put backend-shaped logic inside UI components.

Use structured APIs and parsers instead of ad hoc string manipulation when a better option exists.

Use lucide icons where icons are needed.

Do not add decorative gradient blobs, orb backgrounds, or generic SaaS fluff. The product visual should carry the page.

For landing work, use a real product surface or generated/captured product visual. Avoid vague marketing sections that could belong to any AI app.

## Dependencies

Use pnpm.

Do not bulk-update dependencies blindly.

First install current dependencies and verify the existing app. Then update low-risk patch/minor packages separately.

Treat Clerk major upgrades, AI SDK major upgrades, OpenRouter provider major upgrades, Convex upgrades, Excalidraw upgrades, and lucide 0.x to 1.x as focused upgrade tasks with their own verification.

README currently may lag behind `package.json`; verify package versions from source before repeating setup claims.

## Security And Data

Do not read or print `.env`, `.env.local`, secrets, API keys, Clerk secrets, Convex deployment secrets, OpenAI/OpenRouter keys, private tokens, or auth cookies.

Before making the app widely public, review session ownership and access control for routes and Convex queries/mutations that take `sessionId`.

Do not submit forms, create accounts, send emails, or change external services without explicit user approval.

## Testing And Verification

Before calling work done, run the most relevant available checks: usually `pnpm lint`, `pnpm build`, and targeted manual browser verification for landing-page work.

If env vars or external services block verification, say exactly what was blocked.

For landing-page changes, verify desktop and mobile screenshots in browser before finalizing.

For Excalidraw/demo changes, verify the canvas renders nonblank and does not hijack page scroll or keyboard focus.

State whether the result is repo-verified, browser-verified, or unverified.

Run a reviewer agent after a large chunk of work.

## Git Workflow

Never overwrite, revert, or clean up user changes unless the user explicitly asks.

Use short-lived branches for meaningful feature work if the user wants branch isolation.

Commit after a coherent verified slice. Do not commit broken or unverified code unless the commit is clearly marked as a checkpoint and the user asked for it.

## Progress Logging

Use `docs/progress/week-XX/` for durable progress notes when meaningful work happens.

Each progress note should say what changed, what was verified, what remains risky, and what should happen next.

Keep notes short enough that future agents will actually read them.
