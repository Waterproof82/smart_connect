# Refocus Landing on Two Solutions — SDD Change Audit

**Date**: 2026-08-11
**Author**: SDD Pipeline (sdd-apply agent)
**Change**: `landing-two-solutions`
**Status**: Implementation complete locally on `main` working tree (6 sequential commits, WU0–WU5). Not yet pushed/PR'd/deployed — final `curl -I` redirect verification and production QA are pending post-deploy follow-ups.

---

## Objective

Refocus the home page (`/`) to present exactly two solutions — Carta Digital Premium and Tarjetas NFC — as merged, full scrollable sections, removing 5 other solution surfaces (n8n automation, WhatsApp automation, software Canarias, digitalización Tenerife, and a standalone QRIBAR entry) while preserving QRIBAR as a secondary CTA inside Carta Digital Premium.

## Delivery Strategy

User-approved `size:exception` — single PR, but implemented as 6 independently-committable, sequentially-checkpointed work units (WU0–WU5), each green on `tsc --noEmit` + `npm test` before the next started.

| Commit | Unit | Scope |
|---|---|---|
| `4b9ce10` | WU0 | Delete dead `src/main.tsx` (unreferenced by `index.html`, which loads `entry-client.tsx`) |
| `d4f47b7` | WU1 | `SOLUTIONS` gains `serviceValue`/`jsonLd`; `useWhatsappPhone()` hook; `buildHomeSchema()` pure fn; both Navbars + App.tsx JSON-LD rewired off `SOLUTIONS`; `ROUTE_TO_SOLUTION_ID` removed |
| `127f6ab` | WU2 | `SOLUTIONS` trimmed to 2; deleted 4 feature dirs + routes; `Features.tsx`/`Contact.tsx`/`WebMCP.ts` rewired; `vercel.json` real 301s + retargeted legacy redirects |
| `0ea1556` | WU3 | Carta Digital merged into `App.tsx` as `CartaDigitalSection` |
| `7936029` | WU4 | Tap Review merged into `App.tsx` as `TapReviewSection`; deleted the whole `TapReviewContainer` DI path |
| `d7ac280` | WU5a | FAQ consolidation (single `FAQPage` node), canonical hardcoded, `/servicios` removed |
| `346630e` | WU5b | Pruned 282 orphaned i18n keys |

## Key Discovery — Test Infra Gap (pre-existing, not introduced by this change)

`jest.config.js`'s `testMatch` only matches `.ts` files, never `.tsx` — meaning the repo's 12 pre-existing component tests (6 `CartaDigital*Section.test.tsx`, `HomeFaqSection.test.tsx`, `FAQAccordion.test.tsx`, `TestimonialCarousel.test.tsx`, 4 `*Container.test.tsx`) have **never actually run** under `npm test`. Spiked adding `jest-environment-jsdom` support and confirmed it isn't installed as a devDependency either, so React Testing Library `render()` cannot mount components in this repo's current setup at all. Left `jest.config.js` untouched (out of scope for this change — fixing it would newly "activate" 12 previously-dead suites of unknown health, a separate concern). New structural assertions (no stray `<h1>`, no re-imported `Helmet`/`Navbar`/`Footer`, anchors present) were written as plain `.test.ts` **source-text inspection** tests instead, since that's what the test runner can actually execute. Flagged for `sdd-verify` and for a future dedicated fix (add `jest-environment-jsdom`, extend `testMatch` to `.tsx`, then triage the 12 previously-silent suites).

## Deviations from the tasks/design artifacts (documented)

1. Task 1.7 bundled `Features.tsx`/`Contact.tsx`/`WebMCP.ts` rewiring into WU1; deferred those specifically to WU2 once `SOLUTIONS` was trimmed to 2, since Features.tsx's old 5th "software-ia" card had no `SOLUTIONS` counterpart at the 7-entry stage.
2. Tasks phrase "remove routes from App.tsx" for 2.3/3.5/4.5/5.7 — actual routing lives in `src/entry-client.tsx` + `src/entry-server.tsx` (`App.tsx` is the page component mounted by those routes). Adapted accordingly.
3. WU4 additionally deleted the tap-review `domain`/`data`/`types.ts` DI layer (not just `TapReviewContainer.ts` itself) after confirming zero other consumers.
4. Deleting `CartaDigitalFaqSection.tsx` (per task 5.4) also removed its embedded 3-step "Cómo funciona" / `HowToSchema` blurb (`cartaHowToStep*` keys) — a small, distinct piece of visible copy, separate from the dedicated 5-step `CartaDigitalComoFuncionaSection` component which was kept. This was an explicit instruction in the tasks artifact, called out here for visibility since it is a minor content removal, not purely mechanical cleanup.
5. Removed the `isServicios` **and** `isContacto` BreadcrumbList JSON-LD scripts from `App.tsx` (only the former was explicitly required by `/servicios` removal) — done for consistency once canonical/`og:url` became a single fixed value regardless of pathname (a page can't simultaneously claim to be canonically merged into `/` and carry its own breadcrumb trail).

## Validation

- `npx tsc --noEmit`: clean after every commit.
- `npm run lint` (`eslint . --ext ts,tsx --max-warnings 0`): clean.
- `npm test` (Jest): 29/29 suites, 248/248 tests green (baseline before this change: 23/208).
- New tests added: `solutions.test.ts`, `useWhatsappPhone.test.ts`, `homeSchema.test.ts` (extended across WU1/WU5), `CartaDigitalSection.structure.test.ts`, `TapReviewSection.structure.test.ts`, `App.home.structure.test.ts`.

## Pending (cannot be done from local dev environment)

- `curl -I https://digitalizatenerife.es/{route}` for all 7 retired routes, post-deploy, to confirm real 301 + `location: /` at the edge.
- Manual visual QA: single merged FAQ renders correctly grouped, no duplicate `<h1>`, both solution sections render their full original content.
- Recommended follow-up (separate, smaller change): install `jest-environment-jsdom`, extend `testMatch` to include `.tsx`, and triage the 12 previously-silent component test suites (some will likely need updates/fixes once actually executed for the first time).
