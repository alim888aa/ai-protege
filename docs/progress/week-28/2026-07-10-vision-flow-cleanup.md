# Vision Flow Cleanup

## Changed

Removed the unused Qwen drawing analysis and teaching evaluation actions. Removed their OpenRouter and Hugging Face dependencies, while preserving the results-page data shape beside the UI that consumes it.

Source-backed dialogue now sends only prior messages as `dialogueHistory`. The current message is sent once through `userMessage`, allowing the existing Convex builder to attach the first canvas image.

## Verified

TypeScript passed. Focused lint passed for the changed dialogue and result type files. The Next.js production build passed, and active source contains no remaining Qwen, OpenRouter, Hugging Face, or removed-action references.

## Remaining Risk

Repo-wide lint still reports pre-existing errors in unrelated files. A complete source-backed dialogue request still depends on an authenticated session and the configured Convex deployment, so the external AI round trip was not exercised locally.

## Next

Run one authenticated source-backed teaching session and confirm the first AI response references both the written explanation and drawing.
