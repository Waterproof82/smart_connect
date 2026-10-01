# Content SEO/GEO Audit (static, read-only) — 2026-10-01

**Timestamp:** 2026-10-01
**Action:** Read-only review of the current on-page SEO, structured data and GEO (LLM-readiness) setup. No code changed. The live site was unreachable from the sandbox, so findings come from source only; items marked *verify live* need a check against production.
**Context:** Follows `2026-10-01_gsc-search-performance-analysis.md`. Prepares the ground for a new Carta Digital landing.

## Findings (ordered by priority)

### P0 — Trust / consistency
1. **Contradictory social-proof numbers.** `LanguageContext.tsx` stat strip says "200+ negocios en Canarias"; `successStat4Quote` says "Más de 850 negocios confían…". Both are indexed text and both flow into LLM answers. Unverifiable or inconsistent claims ("6× más reseñas", "40% más visitas", "de 200 a 1200 reseñas") also carry consumer-advertising risk. Needs the owner to confirm real figures; cite sources or soften.
2. **Home title/H1 target no search intent.** Title "Digitaliza Tenerife | Automatización e IA para Empresas" and H1 "Aumenta tu facturación, ahorra horas cada semana" mention neither restaurants, Carta Digital, TPV nor a location. GSC confirms the mismatch (home at pos. ~44, zero product queries).
3. **Flagship product has no URL.** `/carta-digital` is a 301 → `/` (`vercel.json`).

### P1 — Technical SEO
4. **`og:image` / `twitter:image` is the square `icon.png` (512 px) with `twitter:card=summary_large_image`.** Social/LLM previews crop badly. Provide a 1200×630 image per page. Home also lacks `twitter:title/description/image` (the NFC page has them).
5. **Inconsistent hreflang.** Home deliberately has none (documented, `App.tsx:111`); `/about` and `/tarjetas-nfc` emit self-referencing `es` + `x-default`. Harmless, but pick one policy and apply it to every route (including the future landing).
6. **Stale comment in `index.html`** claims hreflang/schema are set per page (hreflang is not set on home). Misleading for future maintainers.
7. **Sitemap `lastmod` stale** (`scripts/site-routes.json`: 2026-08-11/12) although pages changed afterwards; Google uses lastmod only if it proves accurate — drive it from git date or update manually.
8. **Images:** 1 intentional `alt=""` (decorative demo image) and a non-descriptive `alt="NFC Digitaliza Tenerife Background"`; screenshots (`carta-digital-*.webp/png`) need descriptive alts in Spanish with the product context. `carta-digital-admin.png` is the only non-WebP asset.
9. **NFC page H1 is `sr-only`.** Allowed, but the visible heading should carry the primary keyword for users and snippets; verify the first visible heading matches the H1 intent.
10. **Heading structure:** verify there is exactly one H1 per route and no skipped levels in the home (TPV module sections, Carta Digital sections, FAQ). *Verify on rendered HTML.*

### P1 — Structured data
11. Home `@graph` has `LocalBusiness`, `WebPage`, `Service` nodes, `ItemList` and `FAQPage`, but:
    - No `WebSite` node (name, url, `inLanguage`) and `WebPage.@id` is `https://digitalizatenerife.es` (no trailing slash) while `url` points to `/`; align ids.
    - `LocalBusiness` lacks `sameAs` (LinkedIn/Instagram exist in `AboutPage.tsx:80-83` but not in the graph), `geo`, `openingHours`, `foundingDate`. `sameAs` is the strongest entity-disambiguation signal for LLMs and Google.
    - `knowsAbout` omits the products that matter (Carta Digital, TPV, comandero, hostelería); `description` repeats n8n/IA positioning.
    - `FAQPage` merges 11 questions from two groups (general + Carta Digital). Google restricts FAQ rich results for most sites; keep for AEO/LLMs but it will not produce a SERP feature.
    - No `BreadcrumbList` on `/about`? *Verify* (present on `/tarjetas-nfc`).
12. No `Product`/`Offer` markup for the NFC cards (price, availability) — only `Service`. Only add if real pricing is shown on the page.

### P2 — GEO / LLM readiness
13. `public/llms.txt` is accurate and consistent with routes, and `.well-known/llms.txt` is a pointer. Gaps: no per-product summary with price/limits/FAQ links, no "last updated" date, no mention of the NFC and Carta Digital differentiators as short factual bullets LLMs can quote. Must be updated when the new landing exists.
14. `.well-known/openid-configuration` advertises a Supabase OAuth server (`issuer` = Supabase project, with `client_credentials`, etc.) and `Link` headers in `vercel.json` advertise `oauth2-authorization-server` / `protected-resource` for a marketing site. These tell agents the site exposes an OAuth API it does not publicly offer, and leak the Supabase project ref. Recommend removing or reducing to what is truly public. *Needs owner decision — added in the 2026-05-13 GEO work.*
15. `Content-Signal` differs between `robots.txt` (`search=yes, ai-train=no, use=reference`) and the HTTP header in `vercel.json` (`ai-train=no, search=yes, ai-input=no`). `ai-input=no` conflicts with the stated goal of being cited by AI answers. Align both; if the goal is citation in AI search, `ai-input=yes`.
16. Prose quality for answer engines: pages are mostly marketing copy with benefit claims. Add short definitional paragraphs ("Qué es X / para quién / cuánto cuesta / cómo se instala") near the top of each product page so LLMs can quote them; keep numbers sourced.
17. Entity consistency: Google Business Profile, LinkedIn and Instagram should show the identical name, address and phone as the schema (`c/ Ernesto Castro, 57, Puerta 501`). *Verify outside the repo.*

### Already good (no action)
- SSG prerender with canonical, title and description per route; sitemap generated and validated at build; robots.txt allows search and AI crawlers; consent-gated GA4; WebMCP tools; Markdown negotiation; `lang="es"`; skip link and landmarks; performance work from 2026-08-19.

## Proposed order of work
1. Owner decisions: real business counts/claims (item 1), Content-Signal policy (15), OAuth discovery files (14), language policy (5).
2. Small, single-PR fixes: titles/descriptions (2), og/twitter tags + 1200×630 images (4), `sameAs`/`WebSite`/`@id` in the graph (11), alts (8), sitemap lastmod (7), comment cleanup (6).
3. New Carta Digital landing (route, schema, sitemap, prerender, llms.txt) via the SDD flow, once the owner specifies what to highlight.
4. Re-export Search Console after ~4 weeks.
