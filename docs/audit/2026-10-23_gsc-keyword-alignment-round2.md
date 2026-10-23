# Audit — Keyword alignment, round 2 (external SEO review)

**Timestamp:** 2026-10-23
**Trigger:** External review of home, `/ia-chatbots-tenerife` and `/tpv-restaurantes` against queries with impressions in Search Console.
**Evidence level:** E2 (code + prerendered HTML in `dist/`). Live crawl NOT VERIFIED (sandbox proxy blocks the domain).

## Actions

| # | Review point | Status | Evidence / action |
| --- | --- | --- | --- |
| 1 | Home H1 differs from `<title>` | DONE | H1 "TPV, carta digital y chatbot con IA para restaurantes de Tenerife y Canarias"; hub reordered (Carta + TPV flagship, chatbot + NFC secondary). Prerendered `dist/index.html` checked. |
| 2 | TPV page lacks queried variants | PARTIAL | "TPV táctil" 5 mentions (H1, H2, title, description, text), "pizzerías" 5, sector H2/H3 blocks added. Literal "tpv tenerife" not forced (unnatural Spanish; "TPV táctil en Tenerife" is in an H2). Supermarkets: dropped by the owner (no weight); copy mentions none. Separate `/tpv-tenerife` page not created. |
| 3 | Other islands | DONE | Lanzarote and Fuerteventura sections with distinct copy; `areaServed` updated. |
| 4 | Outdated reviews | DONE (partial) | 2022 QR iBar reviews removed from the home, kept on `/carta-digital`. Recent reviews need real customers: owner action. |
| 5 | "Canarias Digitaliza" | DONE | Home FAQ + `/about` section. States there is no relation with the public programme (matches `iaFaqA5` and `organization.ts`). |
| 6 | No `<img>` on home | DONE | 2 real images with `alt`, `width`/`height`, `srcset`, lazy. NFC supplier photo deliberately NOT used (rights unverified, F-07). A local-venue photo of the TPV in use needs a real photo from the owner. |
| 7 | Generic anchors, `/admin` link | DONE | Keyword anchors on home cards; `/admin` links removed from both menus. `X-Robots-Tag: noindex, nofollow` already set for `/admin` in `vercel.json`. |
| 8 | `/about` content | PARTIAL | Already has mission, founder, address in Tacoronte, contact. Added services links. Team/history not invented: owner must supply real text and photos. |
| 9 | Blog | DONE | `/blog` + 4 articles (data in `src/features/landing/data/blogPosts.ts`). The "price of a TPV" article explains price drivers and gives no figures; the Glovo example is labelled illustrative. 14 prerendered routes, 11 sitemap URLs. |

## Verification

- `npm run type-check`, `npm run lint`, `npm test` (Jest), `npx vitest run src/features/landing src/shared`: pass.
- `npm run build`: 9 routes prerendered; home has 2 `<img>`, 0 `/admin` links, 0 "Opiniones".
