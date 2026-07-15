# Remove Legacy Vision Path And Fix First Canvas Message

Status: complete

## Goal

Remove the unused Qwen evaluation path and make source-backed dialogue send the first canvas image without duplicating the user's message.

## Files Likely Touched

- `src/app/actions/analyzeDrawing.ts`
- `src/app/actions/evaluateTeaching.ts`
- `src/app/results/_components/types.ts`
- `src/app/results/_components/ResultsClient.tsx`
- `src/app/results/_components/ScoreBreakdown.tsx`
- `src/app/teach/[sessionId]/[conceptIndex]/_components/hooks/useDialogueHandlers.ts`
- `package.json`
- `pnpm-lock.yaml`

## Decisions

Keep every active OpenAI model unchanged. Preserve the legacy results-page data shape locally because the page still renders it, while removing the unused server actions and third-party model providers.

## Verification

Run TypeScript, lint, and production build checks. Confirm static references to Qwen, OpenRouter, Hugging Face, and the deleted actions are gone from active source.

TypeScript, focused lint, and the production build passed. Repo-wide lint remains blocked by pre-existing errors outside this change.

## Risks

End-to-end source-backed dialogue requires a working Convex deployment and authenticated session, so local automated checks may not exercise the external AI request.
