# Landing Canvas Demo Design QA

Source visual truth: `/Users/andyba/projects/ai-protege/public/demo-2.png`

Implementation screenshots: `/Users/andyba/projects/ai-protege/.codex-dark-landing-hero.png` and `/Users/andyba/projects/ai-protege/.codex-dark-landing-diagram.png`

Viewport: 1440 × 900 desktop. Mobile was also checked at 390 × 844.

State: dark landing hero plus seeded stack lesson before submission, dark canvas, floating AI Student panel, floating explanation input, and landing navigation visible.

## Full-view comparison evidence

The implementation uses the same Excalidraw chrome, black board, rough white drawing language, top-right AI Student panel, bottom-left input panel, and bottom-right navigation pattern as the product source. The revised scene keeps PUSH and POP horizontal, away from the stack title and overlay panels. The surrounding landing page now carries the same near-black theme. The floating panels preserve the product's drag behavior and desktop resize controls.

## Focused region evidence

A separate crop was unnecessary because the chat and input panels were readable at original resolution in the combined comparison. Their header, role colors, message surfaces, textarea, send control, borders, spacing, and dark tokens were checked directly.

## Findings

No actionable P0, P1, or P2 differences remain. Typography, spacing, colors, icons, canvas rendering, and copy are coherent with the existing teaching surface. The requested hero subheading and live-response counter are absent. The landing frame is shorter than the authenticated full-screen route by design, and the topic navigation uses landing conversion copy.

## Comparison history

The first landing implementation used a light split sidebar, activation curtain, and instruction callouts. Those were P1 fidelity and interaction differences. They were replaced with the embedded dark Excalidraw surface and floating product panels.

The first correction pass inverted the canvas colors and let the mobile chat cover the board. The scene colors were adjusted for Excalidraw dark-mode rendering, and the mobile chat now starts collapsed. The post-fix evidence is the implementation screenshot above plus `/Users/andyba/projects/ai-protege/.codex-landing-demo-mobile-v2.png`.

A reviewer then found that the first panel pass showed drag affordances without movement, followed by resize bounds that could overflow after a panel moved. Shared pointer-based drag and resize behavior was added, with bounds calculated from each panel's current position and anchored resize edge. The final reviewer pass found no remaining concrete issues.

## Interaction and browser checks

Drawing was tested by selecting Excalidraw's Draw tool and dragging directly on the canvas; Undo became enabled. Enter-to-send on the unchanged starter explanation displayed the canned AI response without the provider. An edited explanation used the API route and fell back safely because this local environment has no OpenAI key. The desktop and mobile dark layouts, mobile board, chat toggle, and input were checked. No browser console errors were reported.

final result: passed
