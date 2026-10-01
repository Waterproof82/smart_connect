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
