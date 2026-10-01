# Search Console Analysis — 2026-10-01

**Timestamp:** 2026-10-01
**Action:** Analysed the Google Search Console exports (Performance on Search + Coverage) for `digitalizatenerife.es` and cross-checked them against the current SEO setup in the repository. Analysis only — no application code changed.
**Not verified:** the live site is unreachable from the agent sandbox (proxy `host_not_allowed`), so rendered HTML, headers and Core Web Vitals were not re-checked live. The 2026-08-17 audit covers those.

## Data window and reliability

- Performance data starts 2026-05-12 and ends 2026-09-28 (the "16 months" filter only has ~4.5 months of data).
- Totals: **25 clicks, ~435 impressions**. Sample is very small — treat every figure as directional, not statistically significant.
- Monthly trend (clicks / impressions): May 1/26 · Jun 2/96 · Jul 3/137 · Aug 8/109 · Sep 11/81 (to the 28th). Clicks are rising while impressions are flat → CTR is improving, driven by the NFC page.

## Pages

| URL | Clicks | Impr. | CTR | Avg pos. |
| --- | -----: | ----: | --: | -------: |
| `/tarjetas-nfc` | 14 | 92 | 15.2% | 7.3 |
| `/tap-review` (now 301 → `/tarjetas-nfc`) | 7 | 109 | 6.4% | 9.4 |
| `/` | 3 | 277 | 1.1% | 44.3 |
| `http://…/` | 1 | 8 | 12.5% | 19.6 |

- The only page with real traction is the NFC page; the home gets most impressions but sits on page 5 (pos. ~44).
- `/tap-review` still shows impressions from before the redirect; its signals are being transferred to `/tarjetas-nfc` and will fade out of the report.
- The `http://` variant still appears in Google → confirm HTTP→HTTPS 301 at the edge (Cloudflare "Always Use HTTPS") and keep a single canonical origin.

## Queries (all 23 reported)

| Intent group | Queries (impr., pos.) | Total impr. |
| --- | --- | ---: |
| Generic AI / automation + "tenerife" | ia para empresas (35, 73) · chatbots ia (20, 61) · automatización procesos (12, 56) · aplicaciones ia (10, 85) · robots de atención al público (9, 78) · inteligencia artificial empresas (8, 83) · automatización empresas (5, 60) · automatización n8n (2, 57) · chatbot web (1) · n8n (1) · chatbots whatsapp (1) · datos estructurados ia (1) | ~105 |
| Brand | canarias digitaliza (21, 32) · digitalizatenerife.es (20, 1.05) · digitaliza (4, 7) · digitaliza canarias (4, 30) | ~49 |
| NFC / Tap-to-Review (product + competitor) | tapstar (3, 38, **1 click**) · tap to review (5, 3.4) · tap nfc (4, 18.5) · nfc tap review (2, 6) · tap and review (1, 7) | ~15 |
| Other | ozónica smart food (2) · restaurantes inteligentes (1) · digitalizar mi negocio en canarias (1) | 4 |

Findings:

1. **No query mentions the flagship products** (carta digital / menú QR / TPV / comandero for restaurants). Zero impressions. The home page is being matched to generic "IA para empresas" searches instead, at positions 55–85 (page 6–9) — no clicks possible.
2. **The NFC family already ranks on page 1** (pos. 3–9 for "tap to review" variants) with a high CTR. It is the only proven demand.
3. "canarias digitaliza" (21 impr., pos. 32) most likely matches a regional programme name, not buyer intent for our services. Do not optimise for it.
4. `/carta-digital` is a 301 → `/`: the main product has no landing URL of its own to rank for restaurant-intent queries.

## Geography and devices

- Spain 373 impr. / 24 clicks; Mexico 10 impr. / 1 click at pos. 10.5; US 54 impr. at pos. ~2 (0 clicks, probably brand/bot-like); remaining countries ≤ 4 impr. each.
- Mobile: 110 impr., 10% CTR, pos. 7.8 (NFC page). Desktop: 338 impr., 4.1% CTR, pos. 39 (home).
- The NFC product is not location-bound, and Mexico shows Spanish-speaking demand outside Spain.

## Coverage / indexing

- Indexed: 2 (up from 2→3→2 around 11–15 Aug). Not indexed: 7 (flat since 15 Aug).
- Reasons: 2 × "Page with redirect" (validation: Error) · 4 × "Crawled — currently not indexed" (validation started) · 1 × "Discovered — currently not indexed" (validation passed).
- The sitemap (`scripts/site-routes.json`) lists 6 URLs: `/`, `/tarjetas-nfc`, `/about`, `/legal/aviso`, `/legal/privacidad`, `/legal/cookies`. Redirect rows are expected (old URLs in `vercel.json`) and are not a defect; "validation: Error" on them is normal and can be ignored.
- The 5 non-redirect rows are unnamed in the export. Likely candidates: `/about`, the three `/legal/*` pages (thin by nature) and the `http://` variant. **The URL list from Indexación → Páginas is needed to confirm.**

## Repository SEO review (static)

- Home `<title>`: "Digitaliza Tenerife | Automatización e IA para Empresas" — aligns with the generic-AI impressions but not with the products the business sells (`src/App.tsx:120`).
- Home description does not mention restaurants, Carta Digital or TPV (`src/App.tsx:121`).
- `/tarjetas-nfc` title/description/H1 are consistent with its ranking queries (`TapReviewPage.tsx:17-26`); the H1 is `sr-only`.
- `lastmod` values in `scripts/site-routes.json` are stale (2026-08-11/12 for pages edited since) — update them whenever page content changes.
- The language decision (no `/en/`, no hreflang) is documented and consistent with `llms.txt`; unchanged.
- Prior decision (2026-08-17): the user declined new content pages for IA/automation keywords. The data above is new evidence for revisiting that decision, but it is the user's call.

## Recommendations (not applied — awaiting user decision)

1. **Home: re-target title/description to the products** (Carta Digital QR + TPV for restaurants in Tenerife/Canarias). Low risk, 2 strings.
2. **Dedicated indexable landing for Carta Digital / TPV** (route + sitemap + prerender + llms.txt). Targets the zero-impression commercial queries. New content → requires SDD flow.
3. **Widen the NFC page beyond Tenerife** (España / Latam wording, "tarjetas NFC reseñas Google restaurantes"), since the product ships anywhere and already ranks.
4. **Only if the user wants the generic AI / chatbot / n8n audience:** one landing page per cluster (chatbots, automatización), otherwise remove that messaging from the home title to avoid ranking on page 7 for terms that do not convert.
5. Confirm HTTP→HTTPS and www→apex redirects at the edge; request indexing of `/tarjetas-nfc` and `/` after changes; refresh `lastmod`.
6. Check the Aviso/Privacidad/Cookies pages are acceptable as "not indexed" (they are legal boilerplate; no action needed).
7. Keyword demand: GSC only shows queries that already produce impressions. Market volume must be validated with Google Keyword Planner / Trends before building new pages.
8. Re-export Search Console in ~4 weeks to measure the effect.
