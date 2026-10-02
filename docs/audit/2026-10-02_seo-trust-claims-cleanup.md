# SEO trust-claims cleanup — 2026-10-02

**Timestamp:** 2026-10-02
**Change:** `openspec/changes/seo-trust-claims-cleanup`
**Scope of this entry:** all 3 chained PRs — PR1 (markup/dead code/registry/guards), PR2a (home: Carta Digital reviews, stat strip, FAQ, nav) and PR2b (NFC: TrustBadges/TrustFacts, CTASection, HowItWorks/feature copy, hero feature, this CHANGELOG/audit entry).
**Origin audit:** `docs/audit/2026-10-02_full-site-seo-geo-audit.md` (P0 findings: self-serving `Review` JSON-LD, third-party Tapstar figures presented as the site's own).

## Why

The full-site audit found the site presenting another company's numbers as its own (Tapstar's "4.9/5", "+20,000 negocios", "+600K reseñas", "+400 reseñas diarias"), 3 fabricated testimonials with invented businesses and quotes, an unsourced home stat strip ("Decenas", "Hasta 6×", "Hasta 45%"), NFC guarantees nobody had committed to ("Garantía 30 días", "Envío gratis 24h", "Soporte 24/7"), and self-serving `Review` JSON-LD (`itemReviewed` was the company itself) plus a retired `HowTo` rich result. This is an E-E-A-T and Google spam-policy risk. The fix removes everything unverifiable and replaces it with facts already stated elsewhere in the site's own copy, plus 2 real, attributed QR iBar reviews.

## Actions taken

### PR1 — Markup, dead code, registry, structured-data guards

1. Deleted the `ReviewSchema`/`HowToSchema` exports and their prop/type interfaces from `SeoSchema.tsx` (~160 lines); removed their imports/usages from `SuccessStats.tsx`, `SocialProof.tsx` (now `TrustFacts.tsx`), `HowItWorks.tsx` — visible steps/cards stayed unchanged.
2. Deleted the dead `TestimonialCarousel` component and its test (zero live imports confirmed before deletion).
3. Added `tests/unit/seo/structuredDataPolicy.test.ts`: `SeoSchema` exports no `ReviewSchema`/`HowToSchema`; no `"@type":"Review"`/`"HowTo\w*"` literal anywhere in `src/`.
4. Extended `tests/unit/seo/prerenderedSeo.regression.test.ts` with a freshness-gated check that no prerendered route emits `Review`/`HowTo` JSON-LD.
5. Corrected `.atl/skill-registry.md`'s Structured Data section: removed the `ReviewSchema`/`HowToSchema` rows and the "Reglas para ReviewSchema" block, fixed the trigger list, and documented the policy — no self-serving `Review`/`AggregateRating`, `HowTo` retired, `FAQPage` is semantic-only.

### PR2a — Home: Carta Digital reviews, stat strip, FAQ, nav

6. Added `src/features/landing/data/cartaDigitalReviews.ts` (`CARTA_DIGITAL_REVIEWS`, 2 real, verbatim-truncated Google reviews of QR iBar: Carlos S. and Luis M., both 5★, 2022).
7. Added `CartaDigitalReviews.tsx` (static 2-card block, `<figure><blockquote lang="es"/><figcaption/>`, `role="img"` star group with a translated `aria-label`, no `ld+json`) and deleted `SuccessStats.tsx` (its stat strip — 45%, 6×, "Decenas", a hardcoded ★★★★★ — was entirely unsourced). Mounted at `#exito` with `navSuccess` relabelled "Opiniones"/"Reviews".
8. Reworded the home `#por-que` stat strip to 3 already-stated facts (languages, review speed, one-time payment) and fixed `homeFaqA2` ("Contactá" → "Contacta", no voseo) and `homeFaqA3` (dropped the unsourced "×6 en 90 días" claim).
9. Extended `structuredDataPolicy.test.ts` with a FAQ JSON-LD parity block proving `buildHomeSchema` and the visible `HomeFaqSection` share the exact same `t.homeFaqA2`/`t.homeFaqA3` strings (drift is structurally impossible, not just untested), and created `tests/unit/content/trustClaims.guard.test.ts` (home scope).

### PR2b — NFC: TrustBadges, TrustFacts, CTASection, HowItWorks, hero feature

10. Deleted `StatsBanner.tsx` and the now-orphaned `StarRating.tsx` — the "4.9/5", "+600K", "+400" figures were Tapstar's published numbers, not Digitaliza Tenerife's.
11. Rebuilt `TrustBadges.tsx` as a 4-item facts strip (no app needed, NFC + backup QR, iPhone 8+/Android compatibility, no subscriptions), replacing the unverified "30-day guarantee / free 24h shipping / 24/7 support" badges. Removed `tapReviewTrust{30Days,24h,Support}`; added `tapReviewTrust{NoApp,QrFallback,Compat}` (es+en).
12. Renamed `SocialProof.tsx` to `TrustFacts.tsx`: 3 factual cards sourced from the existing NFC FAQ copy (we configure the device for you; works with almost any phone, NFC + QR fallback; direct WhatsApp contact with a Tenerife-based team) replace the 3 fabricated testimonials (invented businesses "Restaurante El Bodegón", "Café Central Madrid", "Bar La Tapa" and their quotes). Removed `tapReviewSocial{Title,Subtitle}` and `tapReviewTestimonial{1,2,3}{Quote,Author,Business}`; added `tapReviewFacts{Title,Subtitle}` + `tapReviewFact{1,2,3}{Title,Desc}` (es+en).
13. `CTASection.tsx`: feature list now reads "Sin app"/"Configuración incluida" (was "Garantía 30 días"/"Envío gratis 24h"); subtitle no longer cites the "+20,000 negocios" figure.
14. `HowItWorks.tsx` step 1 copy dropped the "Tapstar" brand mention from its own exhibitor-placement instructions.
15. `tapReviewFeatGoogle`(+Desc) and `tapReviewHeroFeature3` reworded from "Aparece primero en Google"/"Aparece el primero en Google Maps" (an unverifiable #1-ranking guarantee) to "Mejora tu posicionamiento y ayuda a tener más visibilidad" / "Improve your ranking and help boost your visibility" (owner-approved wording, matches Google's own published local-ranking factors).
16. Found and removed an additional orphaned claim not explicitly listed in the task breakdown: `tapReviewStats{Businesses,Reviews,Daily}` (the "+20,000 negocios" figure) had been `StatsBanner.tsx`'s only consumer; once that component was deleted these 3 keys were dead code still carrying the Tapstar figure. Removed from both locales.
17. Extended `tests/unit/content/trustClaims.guard.test.ts` with the NFC-scoped assertions (Tapstar, 4.9/5, 600K, +400, the 3 removed guarantee strings in both locales, the old Google-ranking wording, "Café Central", "+20,000", and the removed key names).
18. Added `tests/unit/content/localeParity.test.ts`: parses the literal keys declared in the `es`/`en` translation blocks and asserts they're identical, documenting the parity `Record<Language, Translation>` already enforces at compile time (`tsc --noEmit`).
19. **Extra fix (owner-facing accuracy, outside the original task list)**: `cartaReviewsTitle` read "Lo que dicen nuestros clientes" / "What our customers say", but the 2 QR iBar reviews are from diners who ordered through the app, not business-owner customers of Digitaliza Tenerife. Changed to "Lo que dicen los comensales" / "What diners say", with a dedicated test.

## Deviation recorded (tasks.md 2b.11 scope correction)

tasks.md's NFC-scoped claim list also named `"L'Escale"` and a bare `"400"`. Both were verified and dropped from the guard before use:

- **`"L'Escale"`** only ever appears in `contactPlaceholderCompany: "Ej. Restaurante L'Escale"` — the contact form's example-business placeholder. It is unrelated to the tap-review testimonials, which used different fabricated businesses ("Restaurante El Bodegón", "Café Central Madrid", "Bar La Tapa" — none of them "L'Escale"). Scanning for it would have deleted legitimate, out-of-scope UI copy for no reason tied to this change.
- **bare `"400"`** collides with ~34 pre-existing, unrelated occurrences across `src/`/`public/` (`font-weight: 400`, pixel widths, etc. — confirmed via a repo-wide grep before writing the guard). The actual Tapstar figure was the literal `"+400"` (the daily-reviews stat in the now-deleted `StatsBanner.tsx`); the guard scans that exact substring instead.

## Component-test runner correction (PR2a's recorded deviation was inaccurate)

PR2a's apply-progress record stated that `.test.tsx` RTL component tests "are NOT runnable in this repo" because Jest's `testEnvironment` is `"node"` and its `testMatch` is `.test.ts`-only — true for Jest, but incomplete: `vite.config.ts` configures a separate Vitest project (`test.include: ["src/features/**/*.test.tsx", ...]`, `environment: "jsdom"`) specifically for these files, and `src/features/tap-review/presentation/components/__tests__/CTASection.test.tsx` already existed and ran under `npx vitest run` before this PR. Verified directly (`npx vitest run` on the pre-existing file: 3/3 passed) before relying on it. PR2b's `TrustBadges.test.tsx` and `TrustFacts.test.tsx` were therefore written as real RTL component tests (co-located `__tests__/`, `LanguageProvider` + `@testing-library/react`, matching the existing `CTASection.test.tsx` convention) and run via `npx vitest run`, per design.md's original testing-strategy row — not as `.structure.test.ts` source-text assertions. Recommend correcting this in any future apply-progress notes so the next agent doesn't skip the working Vitest path.

One side-effect found and fixed during this: 3 of the new/edited component tests initially self-failed the new NFC-scoped `trustClaims.guard.test.ts` scan, because their own source text (negative assertions quoting the forbidden strings, and one JSDoc comment) lives under `src/` and was therefore itself scanned. Resolved by removing the redundant component-level negative assertions (the repo-wide guard already proves their absence) and rewording the one offending comment — not by weakening the guard.

## TDD evidence (PR2b)

| Task | RED (cause) | GREEN (fix) |
|------|-------------|--------------|
| 2b.2/2b.3 | `TrustBadges.test.tsx` written first; failed — old guarantee text present, new fact text absent (`screen.getByText` threw) | Rewrote `TrustBadges.tsx` + added `tapReviewTrust{NoApp,QrFallback,Compat}` keys; 4/4 green |
| 2b.4/2b.5 | `TrustFacts.test.tsx` written first; failed with a Vite module-resolution error (`TrustFacts.tsx` didn't exist yet) | Renamed/rewrote `SocialProof.tsx` → `TrustFacts.tsx` + added `tapReviewFacts*`/`tapReviewFact{1,2,3}*` keys; 4/4 green |
| 2b.6/2b.7 | Extended `CTASection.test.tsx`; 2/5 failed (old guarantee text present, new feature text absent) | Reworded `tapReviewCTASubtitle`/`Feature1`/`Feature2`; 5/5 green |
| 2b.8–2b.10 | N/A — direct copy edits (Tapstar mention, Google-ranking wording); confirmed RED-capable via `git show 218d820~1` on the pre-PR2b baseline (14 forbidden-string matches) | Values changed; covered by the 2b.11 guard |
| 2b.11 | `trustClaims.guard.test.ts` NFC-scoped assertions written against the already-edited tree (passed immediately); RED-capability independently confirmed via the same `git show` baseline check | 25/25 pass |
| 2b.12 | `localeParity.test.ts` is a new file, confirm-only (the `Record<Language, Translation>` type already gate-keeps parity at compile time) | 4/4 pass; `tsc --noEmit` stays clean throughout |
| Extra fix | `CartaDigitalReviews.structure.test.ts` extended; the positive `cartaReviewsTitle` assertion would have failed against the pre-fix value ("Lo que dicen nuestros clientes") | Changed `cartaReviewsTitle` es/en; 12/12 pass |

## Files changed (PR2b)

| File | Action |
|------|--------|
| `src/features/tap-review/presentation/components/StatsBanner.tsx`, `StarRating.tsx`, `SocialProof.tsx` | Deleted |
| `src/features/tap-review/presentation/components/TrustFacts.tsx` | Created (replaces `SocialProof.tsx`) |
| `src/features/tap-review/presentation/components/TrustBadges.tsx` | Rewritten |
| `src/features/tap-review/presentation/TapReviewSection.tsx` | Modified (mount swap) |
| `src/features/tap-review/presentation/components/__tests__/TrustBadges.test.tsx`, `TrustFacts.test.tsx` | Created |
| `src/features/tap-review/presentation/components/__tests__/CTASection.test.tsx` | Extended |
| `src/shared/context/LanguageContext.tsx` | Modified (es+en: CTA, HowStep1, FeatGoogle, HeroFeature3, trust/fact keys, cartaReviewsTitle) |
| `tests/unit/content/trustClaims.guard.test.ts` | Extended (NFC scope) |
| `tests/unit/content/localeParity.test.ts` | Created |
| `tests/unit/seo/prerenderedSeo.regression.test.ts` | Modified (`TOUCHED_SOURCES`) |
| `tests/unit/features/landing/CartaDigitalReviews.structure.test.ts` | Extended (diner-label fix) |
| `CHANGELOG.md` | Modified (`[Unreleased]` Removed/Changed) |
| `docs/audit/2026-10-02_seo-trust-claims-cleanup.md` | Created (this file) |

## Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (`eslint . --ext ts,tsx --max-warnings 0`).
- `npx jest` — 1337 passed, 1 skipped, 3 pre-existing failures in `tests/e2e/chatbotFlow.test.ts` (network/Supabase-dependent E2E, expects a live backend; unrelated to this change).
- `npm run test:vitest -- --run` — 112 passed, 0 failed (23 files), including the new `TrustBadges.test.tsx`/`TrustFacts.test.tsx` and the extended `CTASection.test.tsx`.
- `npm run build` — succeeded (owner-authorized this run); 9 routes prerendered, sitemap written.
- `npx jest tests/unit/seo` (post-build) — 149/149 passed, including the `distFresh`-gated Review/HowTo-absence check (confirmed running for real, not skipped, via `--verbose`).
- `npx jest tests/unit/content src/__tests__/brand.guard.test.ts` — 32/32 passed (home-scope + NFC-scope trust-claims guard, locale parity, brand guard).

### `/tarjetas-nfc` frozen-surface check (structured-data-policy spec, "Frozen Surface Stays Untouched")

Extracted directly from the fresh `dist/tarjetas-nfc/index.html`:

- `<title>`: "Tarjetas NFC Tap-to-Review | Digitaliza Tenerife" — matches `TapReviewPage.tsx`'s hardcoded `PAGE_TITLE` constant.
- `<h1>` (sr-only): "Tarjetas NFC Tap-to-Review para multiplicar tus reseñas de Google" — matches `PAGE_H1`.
- `<meta name="description">`: matches `PAGE_DESCRIPTION`.
- `<link rel="canonical">`: `https://digitalizatenerife.es/tarjetas-nfc` — matches `PAGE_URL`.
- JSON-LD `@type`s present: `Service`, `BreadcrumbList`, `FAQPage` — no `Review`, no `HowTo`.

A literal byte-for-byte diff against a pre-PR1 build was not possible (no trustworthy pre-change `dist/` snapshot exists locally, per PR1's recorded deviation — the only local build predated the Oct 1 `TapReviewPage.tsx` design-system changes). Byte-identity is established instead by construction: `git log develop..HEAD -- src/features/tap-review/presentation/TapReviewPage.tsx src/shared/config/solutions.ts` returns zero commits across all of PR1/PR2a/PR2b — the file that produces this output was never touched — and the one touch to `SeoSchema.tsx` (PR1) only removed the unused `ReviewSchema`/`HowToSchema` exports, with zero lines changed in `ServiceSchema`/`BreadcrumbListSchema` (confirmed via `git diff develop...HEAD -- SeoSchema.tsx | grep ServiceSchema|BreadcrumbListSchema` — no matches).

## Docs check (tasks.md "check docs/ for other guidance recommending ReviewSchema/HowTo")

PR1's 1.8 checked `docs/GUIA_IMPLEMENTACION_RAG.md`, `docs/CHATBOT_RAG_ARCHITECTURE.md`, `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`, `docs/context/*` and `docs/slides/*` — none found. This entry additionally checked the rest of `docs/` for `ReviewSchema`/`HowToSchema`/`AggregateRating` mentions:

- `docs/SEO_IMPLEMENTATION.md`, `docs/audit/2026-08-14_*`, `docs/audit/2026-08-11_*`, `docs/audit/2026-05-16_*` — all historical implementation/audit logs describing what was built in the past, not active "do this" guidance. No change needed.
- **`docs/SEO_PROTOCOL.md` — found, not fixed, flagged as a follow-up**: this is an *active* protocol doc (not a dated log). Its per-route table lists `HowTo` as "opcional" for `/ia-chatbots-tenerife` (line 41) — a different route, outside this proposal's scope (which covers only home and `/tarjetas-nfc`) — and its known-issues table still carries `P-19` ("`ReviewSchema` usa `datePublished = new Date()`"), which is now moot since `ReviewSchema` no longer exists anywhere in the codebase (PR1). Left untouched deliberately: editing a protocol doc that governs routes and schemas this proposal never touches was judged out of scope rather than silently done. Recorded here as an explicit "found, not fixed" per the task instruction, for the next change to pick up.

## Follow-ups (not in scope for this change, carried from the origin audit)

- QR iBar's Google Business Profile reconciliation (Las Rozas listing vs. the site's own Tenerife service area) — origin audit P2, explicitly out of scope by proposal.
- React error #421 on lazy-loaded prerendered routes (Suspense/hydration perf issue) — origin audit P1, explicitly out of scope by proposal.
- Home H1 ("Aumenta tu facturación, ahorra horas cada semana") naming no product/audience/place — origin audit P1, explicitly out of scope by proposal.
- Entity graph gaps (no `WebSite` node, `@id`-less `author`/`publisher`, no `sameAs`) — origin audit P2, explicitly out of scope by proposal.
- `docs/SEO_PROTOCOL.md`'s stale `HowTo`-for-chatbots suggestion and `P-19` entry (see Docs check above).
- Mounting `CartaDigitalReviews` on `/carta-digital` (design.md D4, owner decision deferred — tasks.md 3.1).
- After merge: resubmit home and `/tarjetas-nfc` to Search Console for recrawl (tasks.md 3.2).

## Commits

PR1 (`feat/seo-trust-markup-cleanup`, base `develop`):
1. `chore(cleanup): delete dead TestimonialCarousel component`
2. `refactor(seo): remove self-serving Review and retired HowTo JSON-LD`
3. `test(seo): extend prerendered regression to forbid Review/HowTo JSON-LD`
4. `docs(atl): correct structured-data policy in skill registry`

PR2a (`feat/seo-trust-home-reviews`, base PR1):
5. `feat(landing): add real QR iBar review data constant`
6. `feat(landing): add CartaDigitalReviews component`
7. `refactor(landing): mount CartaDigitalReviews on home, fix trust claims`
8. `test(seo): guard home FAQ JSON-LD parity with visible copy`

PR2b (`feat/seo-trust-nfc-claims`, base PR2a):
9. `docs(audit): add full-site SEO/GEO audit`
10. `refactor(tap-review): replace Tapstar figures and testimonials with verified facts`
11. `refactor(tap-review): drop Tapstar wording from CTA, how-it-works and feature copy`
12. `test(content): extend trust-claims guard and add ES/EN locale-parity test (PR2b)`
13. `fix(landing): label carta reviews as diner reviews`
14. `docs(seo): changelog and audit log for trust-claims cleanup` (this commit)

## Status

PR1 (10/10), PR2a (18/18) and PR2b (17/17, tasks.md 2b.1–2b.17) are all complete. All 3 branches are stacked (`feat/seo-trust-markup-cleanup` → `feat/seo-trust-home-reviews` → `feat/seo-trust-nfc-claims`), committed locally, not pushed, no PR opened (per instructions). Ready for `sdd-verify`.
