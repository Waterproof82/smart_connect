# SEO/GEO/AEO Audit — P0/P3 Fixes

**Date**: 2026-08-14
**Author**: Claude Code (conversational session, verified against source before editing)
**Trigger**: External SEO/GEO/AEO/Search Console audit report pasted by the user (`digitalizatenerife.es`, 2026-08-14).
**Status**: Committed directly to `main` per explicit user instruction (no branch/PR — user request overrides default branch-first workflow).

---

## Objective

Verify the external audit's P0/P1/P3 findings against the actual codebase before touching anything, then apply the fixes that were (a) confirmed real and (b) safe to make without further business decisions from the user.

## Verification results (before any edit)

| Audit claim | Verdict | Evidence |
|---|---|---|
| Fabricated `aggregateRating` (4.9★/850) + fake `offers.price` (29.90) in Review JSON-LD | **Confirmed** | `SeoSchema.tsx` `ReviewSchema`'s default `itemReviewed` hardcoded both, applied to every real testimonial via `TestimonialCarousel`. |
| NAP address mismatch between JSON-LD and visible Contact section | **Confirmed** | JSON-LD hardcoded `"Calle Las Palmas 123"` (`SeoSchema.tsx`, `AboutPage.tsx`); `Contact.tsx` renders `settings.physicalAddress` from Supabase (`app_settings.physical_address` = `"c\Ernesto Castro, 57, Puerta 501"`) — two independent sources that can never agree by construction. |
| GA4 not receiving data | **Confirmed, root cause found** | Zero occurrences of `gtag`/`googletagmanager` anywhere in `src/` or `index.html` — GA4 was never installed in code, not a consent-blocking or misconfiguration issue. |
| H1 duplicates `<title>` on `/tarjetas-nfc` | **Confirmed** | `TapReviewPage.tsx` used the same `PAGE_TITLE` constant for both `<title>` and the `sr-only` `<h1>`. |
| robots.txt has contradictory `Allow`/`Disallow` for AI bots | **Refuted for the repo** | `public/robots.txt` is clean — `Allow: /` for every listed AI bot, no `Content-Signal` header, no duplicate blocks. The contradiction the audit saw is injected at Cloudflare's edge ("AI Crawl Control"), not present in source. **No code change made** — flagged to user as a Cloudflare dashboard action. |

## Fixes applied

1. **`src/shared/presentation/components/SeoSchema.tsx`** — `ReviewSchema`'s default `itemReviewed` no longer includes `aggregateRating` or `offers`; kept `name`/`applicationCategory`/`operatingSystem` only (valid schema.org, just not eligible for the star-rating rich snippet until a real rating exists). Also fixed `buildHomeSchema`'s hardcoded `LocalBusiness.address.streetAddress` to the real address.
2. **`src/features/landing/presentation/components/AboutPage.tsx`** — same address fix, mirrored (this file hand-rolls its own `LocalBusiness` JSON-LD rather than reusing `buildHomeSchema`).
3. **`src/features/landing/presentation/components/Contact.tsx`** — the address fallback string (`settings?.physicalAddress || "..."`, shown only if the Supabase read fails) was `"Madrid, España"`, which doesn't match the business's Tenerife location under any source. Changed to `"Santa Cruz de Tenerife, España"`.
4. **`src/features/tap-review/presentation/TapReviewPage.tsx`** — added a distinct `PAGE_H1` constant (`"Tarjetas NFC Tap-to-Review para multiplicar tus reseñas de Google"`) separate from `PAGE_TITLE`, so the H1 reads as a natural sentence instead of repeating the `<title>` verbatim.
5. **`index.html`** — installed the GA4 gtag.js snippet (`G-F9KQ7X8TSQ`, supplied directly by the user from the GA4 property setup screen) as the first element inside `<head>`, per Google's own installation instructions. Added a `preconnect` to `googletagmanager.com`.

## Known limitations / explicitly deferred (not done in this session)

- **Address is still a hand-copied literal in 2 places** (`SeoSchema.tsx`, `AboutPage.tsx`), independent of `app_settings.physical_address`. It will drift again the next time someone edits the address via the admin `SettingsPanel`. The durable fix — reading the address from the same Supabase-backed settings source used by `Contact.tsx` — touches 4+ files and adds new async-data-into-JSON-LD logic, which per this project's own SDD enforcement threshold (`CLAUDE.md`) requires `/sdd-new`, not an ad hoc inline change. Recommended as the next change.
- **`app_settings.physical_address` has a data typo** (`"c\Ernesto Castro"` — backslash instead of `/`) — not fixed, it's production data, not code. Flagged to the user to correct via the admin panel.
- **No cookie consent gate exists in the codebase** (`CookiesPage.tsx` is a static legal document, no functioning CMP/consent logic). GA4 now tracks every visitor from page load with no consent gate — a real RGPD/LSSI-CE compliance gap for a Spain-based business, independent of and pre-existing this change. Flagged to the user, not addressed (out of scope of "install the GA4 ID").
- **robots.txt/Cloudflare AI Crawl Control contradiction** — dashboard-only fix, cannot be made from the repo.
- Everything else in the original audit (LCP mobile performance, missing image `alt`, new "IA para empresas" content page, Google Business Profile completeness) is unaddressed — larger scope, deferred pending user prioritization.

## Verification run

- `npx tsc --noEmit -p tsconfig.json` — clean, no errors.
- `npm run lint` — clean, 0 errors/warnings (`--max-warnings 0`).
- No build was run (per user's global "never build after changes" rule).
