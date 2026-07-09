---
name: feature-adr
description: Use before major AI Protege feature, page, app-flow, data-flow, runtime, payment, auth, Convex, Excalidraw, or landing-demo architecture changes when no existing ADR clearly covers the touched area.
---

# Feature ADR

## Quick Start

Before major feature work, scan `docs/adr/`, inspect the touched code paths, then report whether an existing ADR covers the change.

If no ADR covers it, stop before implementation and ask the user whether to create one.

## Workflow

1. Find existing decisions.

Check `docs/adr/` for ADRs that apply to the feature, flow, page, data model, AI behavior, Convex behavior, auth behavior, payment behavior, or landing-demo architecture being changed.

2. Inspect the real code.

Read the relevant files. Ignore generated output, caches, `.next`, `node_modules`, and build artifacts.

3. Explain the current shape.

Tell the user how the area currently works, where it feels messy or risky, and whether cleanup pressure is low, medium, or high. Use plain language.

4. Explain the proposed change.

State what the change would preserve, what it would alter, and what future agents should avoid breaking.

5. Ask before writing.

Ask whether to create or update an ADR. Do not create one silently.

6. Create the ADR if approved.

Add the ADR under `docs/adr/` using the next number, for example `0001-landing-canvas-demo.md`.

## ADR Shape

```md
# ADR 000X: Title

## Status

Proposed or Accepted.

## Applies To

Paths, pages, modules, or feature areas covered by this decision.

## Context

What problem, constraint, product need, bug, or runtime behavior forced this decision.

## Decision

The architecture choice and the rules future work must follow.

## Consequences

What this makes easier, what tradeoffs it creates, and what future agents must avoid breaking.

## Alternatives Considered

Other plausible approaches and why they were rejected.
```

## Standards

Use ADRs to protect non-obvious choices, such as building the landing canvas as a controlled demo, separating authenticated teaching flow from marketing UX, choosing a payment provider, or changing session ownership rules.

Write in plain language. Keep the decision useful for future agents.

Do not require ADRs for tiny bug fixes that follow an existing pattern.
