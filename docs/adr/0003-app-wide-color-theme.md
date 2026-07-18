# ADR 0003: App-wide Color Theme

## Status

Accepted.

## Applies To

The root app layout, global styles, Clerk appearance, marketing pages, pricing and billing surfaces, dashboard, learning flow, and embedded landing demo.

## Context

AI Protégé currently has three separate color behaviors. The landing and pricing pages force a near-black theme with violet accents, Clerk forces a light blue-purple theme, and most authenticated pages follow the operating system through Tailwind's default dark-mode media query.

This makes the move from marketing to authentication and the dashboard feel like moving between different products. It also prevents a visitor from choosing one theme for the whole experience.

## Decision

AI Protégé uses one app-wide light or dark theme. Dark is the first-visit default. A visitor can switch themes with a persistent toggle, and the saved choice applies across marketing, authentication, billing, dashboard, review, teaching, completion, and results surfaces.

The visual foundation is neutral zinc with violet as the primary accent. Marketing pages keep their editorial layout, while Clerk and authenticated controls use the same neutral surfaces and violet interaction color.

Theme state is owned at the document root through a `light` or `dark` class. A small client-side theme store updates that class and local storage. Initial theme selection runs before the page becomes interactive so returning light-theme visitors do not see a dark flash. Components consume semantic global colors or Tailwind `dark:` variants instead of creating separate theme state.

Embedded product surfaces should follow the app theme when their libraries allow it. A library's own theme control must not silently desynchronize the surrounding app.

## Consequences

The whole product keeps one remembered appearance across routes, including Clerk overlays and billing gates. Dark remains the intended first impression, while light mode is a complete supported experience.

Existing hardcoded blue accents and fixed dark marketing colors need gradual replacement when their files are touched. Status colors such as red, amber, and green remain semantic exceptions.

Future work must preserve dark as the first-visit default, keep violet as the primary action color, and avoid introducing route-local theme storage or operating-system-only theme behavior.

## Alternatives Considered

Following the operating system would require less UI, but it would not satisfy the chosen dark default or give visitors an explicit preference.

Keeping separate marketing and app themes would preserve the current pages with fewer edits, but transitions between them would continue to feel inconsistent.

Adding a theming dependency would provide a familiar API, but the required behavior is small enough to keep in the app without another runtime dependency.
