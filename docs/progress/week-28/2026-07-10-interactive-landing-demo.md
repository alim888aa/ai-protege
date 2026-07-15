# Interactive Landing Demo

## What Changed

The landing hero now contains a real stack-data-structure Excalidraw lesson. Visitors can draw immediately, edit a starter explanation, and request one vision-aware question from an AI student. The demo now mirrors the teaching route's dark canvas, draggable and resizable floating panels, and navigation surface instead of using a landing-only sidebar. It keeps its own Convex HTTP action, local fallback, shared daily browser limit, and no authenticated-session dependency.

The surrounding landing page is dark again, the extra hero subheading and visible response counter are gone, and the stack scene now uses compact horizontal PUSH and POP arrows. Sending the unchanged starter explanation returns a canned question immediately; edited explanations continue through the OpenAI vision route. The route now returns a clear 503 before claiming the visitor limit when `OPENAI_API_KEY` is absent.

The scene presents one coherent state: Book 5 waits above the stack while POP exits from Book 4. Mobile and desktop users can reset after the canned answer to try a custom prompt. Provider requests complete before the success cookie is issued, so transient failures release the in-process reservation instead of consuming the daily response.

The Excalidraw viewport is now fixed while drawing and editing remain usable. Wheel input continues scrolling the landing page instead of panning the board. The landing background rules, standalone horizontal dividers, and the decorative CTA book icon were removed for a quieter dark surface. The final CTA button is centered and reads “Start a Lesson.”

The edited-response endpoint moved from a Next.js route to a direct Convex HTTP action. Convex now owns the OpenAI request, validation, and hashed visitor-limit records; failed provider calls release their claim. The obsolete Next.js demo route was removed.

Completed submissions now keep the Send button in place as a disabled gray control instead of replacing it with “Try another answer.” The canned starter path waits 500 ms in the same thinking state as the live request, then reveals its response word by word at the same 24 ms cadence. Resetting the canvas cancels any local response still in progress.

The rest of the landing page was tightened around the product surface, and the shared Excalidraw wrapper now supports a focused demo mode without adding more effect-based callback plumbing.

## Verified

Targeted ESLint and TypeScript pass. Convex code generation and deployment pass, and the new HTTP action returns the expected CORS preflight. A measured live request returned a drawing-aware OpenAI response with HTTP 200 across 46 separately flushed word chunks.

Targeted checks also pass for the disabled-send and simulated canned-stream changes. The in-app preview webview did not attach for the final timing observation, so that last interaction remains code-verified rather than visually verified.

The production build reached the font-fetch stage and was blocked by restricted Google Fonts network access. The in-app preview pane failed to attach after the server restart, so the latest fixed-viewport gesture and CTA layout still need browser verification. Earlier browser checks covered the dark desktop and mobile layouts, nonblank canvas, mobile chat toggle, and canned response.

## Remaining Risk

The local Next.js environment does not need the OpenAI key because Convex owns it. The failure came from passing a complete image data URL to the AI SDK inside Convex, where it was treated as a downloadable URL. The endpoint now passes the base64 image payload with an explicit PNG media type, requests low-detail vision processing, and streams the provider output through a light word-smoothing transform. The prompt treats the current image as authoritative and uses stack facts only for accuracy checking. A box-only replacement-canvas test described only the rounded rectangle and “THIS IS A BOX,” without reconstructing books, LIFO, PUSH, or POP. Provider logging redacts image data while retaining a short error message for future diagnosis. Stream errors and browser aborts release the response-limit claim. A cleared browser identifier can bypass the anonymous daily limit. Full-repo lint continues to fail on older untouched Convex and teaching-flow debt.

## Next

Deploy the new Convex functions and exercise one live response against the configured Convex OpenAI key.
