# 2026-10-28 — GA4 CTA events and phone link

- 2026-10-28: Added `trackCtaClick` and the `CtaEventName`/`CtaLocation` types to `src/shared/utils/analyticsEvents.ts`.
- 2026-10-28: `trackEvent` now requires analytics consent in `sc_consent_v1` (via `readConsent`) in addition to analytics scope.
- 2026-10-28: Hero ("Contactar", "Ver Demo") and Navbar ("Contacto", desktop and mobile) fire `cta_contact_click` / `cta_demo_click`; `WhatsAppCta` accepts an optional `onClick`.
- 2026-10-28: Added `src/shared/utils/telLink.ts`; the Contact phone card links to `tel:` so `contact_phone` fires.
- 2026-10-28: Tests added/updated: `analyticsEvents.test.ts`, `telLink.test.ts`, `HeroCtaTracking.test.tsx`.
