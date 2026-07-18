# Legal pages and project cleanup

## Changed

Added theme-aware `/terms` and `/privacy` pages with a shared editorial legal-page layout. The documents identify Alimaa as the operator, publish the support and privacy email, set a minimum age of 13 with guardian permission for minors, describe the app's real AI and data flows, name the active service providers, and use Mongolian governing law while preserving mandatory local rights.

Added Terms and Privacy links to the shared footer, renamed the package to `ai-protege`, refreshed the README project tree, and removed the old hackathon credit, editor setting, historical specification files, and wireframe assets.

Aligned browser-cache behavior with the privacy policy by clearing a deleted lesson's temporary `sessionStorage` cache. Reserved extra footer space so the floating theme control cannot cover legal links on narrow screens.

## Verified

The repository-wide legacy-brand search returns no matches outside ignored build, dependency, and Git data. ESLint and the optimized production build pass, with both legal routes generated statically. Playwright verified Terms and Privacy at desktop and mobile widths across dark and light themes; both pages rendered with zero app console errors, and the footer exposes working route links. A reviewer checked the legal copy against the current implementation; the resulting retention, cache, and footer findings were addressed.

## Risk

These documents are a product-specific baseline and should receive professional legal review before substantial growth, regulated use, or expansion into new jurisdictions. Account-level deletion currently requires an email request, so future self-service deletion work must keep the policy accurate.

## Next

Consider adding a self-service account deletion flow and a dedicated privacy inbox if support volume grows. Review the documents whenever providers, analytics, billing, retention, or AI data handling changes.
