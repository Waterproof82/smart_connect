# SEO planning: standalone Carta Digital page and simplified landing

**Date**: 2026-10-01

## Actions

- Analysed Google Search Console exports (Performance and Coverage, 2026-10-01) and the "Carta Digital vs Glovo" presentation.
- Reviewed the current routing (`entry-client.tsx`, `entry-server.tsx`, `scripts/site-routes.json`, `vercel.json`) and the Carta Digital / TPV section structure.
- Created `docs/PLAN_SEO_CARTA_DIGITAL_LANDING.md` (planning document only; no application code changed).

## Notes

- Search Console sample is very small (25 clicks, ~420 impressions); findings are directional.
- No search demand for carta digital / Glovo is visible yet; keyword research is recommended before finalising H1/URLs.
- Largest unserved demand cluster: AI / chatbots for businesses in Tenerife (84 impressions).
- Updated plan after product-owner decisions: Glovo messaging reduced to the ~30% commission vs 0% claim (no calculator or profit figures); AI chatbots on a single page.

## 2026-10-01 — Structure scaffolding (PR 1 scope)

- Added routes `/carta-digital` and `/ia-chatbots-tenerife` (client + SSR entries, `site-routes.json`, `vercel.json` rewrites/cache headers; removed the legacy 301 `/carta-digital` -> `/`).
- Added `CartaDigitalPage`, `CartaDigitalGlovoSection`, `CartaDigitalTeaser`, `IaChatbotsPage` and `i18n/modules/page-copy.ts` (es/en).
- Replaced the full Carta Digital module on the home page with a teaser to avoid duplicate content.
- Updated `llms.txt` + agent-skills hash; adjusted route-parity, sitemap, solutions and TPV structure tests.
- Generated `docs/SEO_PROTOCOL.md` through an SEO-specialist subagent (read-only review of the repo SEO setup).
- Validation: lint clean, `tsc` clean, build prerenders all 8 routes; unit tests pass (only `documents-rls` integration test fails, it needs a live Supabase and fails identically without these changes).

## 2026-10-01 — /tpv-restaurantes and simplified home (PR 3 scope)

- Added `TpvRestaurantesPage` (eager `TpvModulesSection` so the 13 modules prerender) and registered `/tpv-restaurantes` (client + SSR routes, `site-routes.json`, `vercel.json`, `llms.txt`).
- Added `HomeSolutionsSection` (2 flagship cards + 2 service cards); removed the TPV modules and "Pilares Tecnológicos" from `App.tsx`; updated home title/description and `buildHomeSchema` input (SOLUTIONS, 4 entries).
- Extended `SOLUTIONS` with `ia-chatbots` and `tpv-restaurantes` (Navbar + Contact options); moved the Carta Digital FAQ to `/carta-digital` (`useCartaFaqGroup`).
- Retargeted 5 legacy 301s to the matching pages; fixed `WebMCP.ts` product URLs.
- Replaced the obsolete "home is NFC-free" structure tests with `App.homeHub.structure.test.ts`; updated home, schema, solutions, sitemap and route-parity tests.
- Validation: lint and `tsc` clean; build prerenders 9 routes; unit tests pass (only the `documents-rls` Supabase integration suite fails, pre-existing). Desktop and mobile screenshots checked. React error #419 (lazy Suspense boundaries in SSR) appears in the browser console both before and after this change.

## 2026-10-01 — Block 1: technical indexing fixes

- `vercel.json`: removed the `/:path*` -> `/_spa.html` catch-all (soft 404), added `trailingSlash: false`, split `X-Robots-Tag` so `/admin`, `/panel`, `/login` and `_spa` get `noindex, nofollow`.
- `entry-server.tsx`: `render(url, { notFound })` renders `NotFound`; `prerender.mjs` writes `dist/404.html` (served by Vercel with HTTP 404).
- Added `tests/unit/scripts/vercelNotFound.test.ts` (no catch-all, explicit rewrite per prerendered route, noindex header, 404.html generation).
- Validation: lint, `tsc`, build and unit tests pass (only the pre-existing `documents-rls` Supabase suite fails). Local static server check: unknown URL -> 404 with H1 "404" and robots noindex, no hydration errors; `/tpv-restaurantes` -> 200.
- Pending manual steps (Search Console, after deploy): resubmit sitemap, request indexing of the 4 new pages, re-validate "Page with redirect" and "Crawled - currently not indexed".

## 2026-10-01 — Block 2: internal linking, shared footer, IA page, JSON-LD @id

- Added `shared/components/SiteFooter.tsx` (used by home, about, legal and the 4 product pages) and `shared/components/RelatedServices.tsx` (product pages).
- Expanded `IaChatbotsPage` (cases, steps, demo, 2 FAQs); `ExpertAssistant` now opens on the `sc:open-assistant` window event.
- `ServiceSchema` provider carries `@id` of the home organization entity.
- Fixed untranslated Spanish footer strings and the duplicated copyright symbol.
- Added `tests/unit/internalLinking.structure.test.ts`.
- Validation: lint, `tsc`, build and unit tests pass (only pre-existing `documents-rls` fails). Browser check: no React errors on load for the 4 product pages, about and legal; demo button opens the assistant.
