# Audit — GSC indexing cleanup and on-page keyword alignment

**Timestamp:** 2026-10-23
**Trigger:** Google Search Console report of 2026-10-23 (6 indexed, 10 not indexed; avg position 26.8).

## Findings and actions

| Item | Evidence | Action |
| --- | --- | --- |
| `/tap-review` redirect validation failed | `vercel.json` already redirected to `/tarjetas-nfc` with 308 (`permanent: true`); no redirect chain; no internal link to the old URL (only the feature folder name and a WebMCP id). The "failed" status is expected for a URL that redirects. | Made it an explicit 301. |
| `/servicios` (old URL) | Redirect to `/` already existed (308). The home is the services hub (`#soluciones`). No internal links. | Made it an explicit 301. |
| Legal pages crawled, not indexed | Thin boilerplate listed in the sitemap. | `noindex,follow` meta + `X-Robots-Tag`, removed from the sitemap (`indexable: false`), still prerendered and linked from the footer. |
| Sitemap `lastmod` | Build runs in a shallow clone (Vercel) so the git resolver falls back to the hardcoded floors in `site-routes.json`; it never uses the build date. `/` and `/carta-digital` had real changes on 2026-10-23. | Floors bumped only for pages whose content changed today; `changefreq`/`priority` removed. |
| robots.txt | Allows all public content, blocks `/admin`, `/panel`, `/login`, declares the sitemap. `Content-Signal` triggers an "unknown directive" lint (intentional, F-notes). | No change (PASS). |
| On-page | See CHANGELOG. | Titles 55-59 chars, descriptions 134-144 chars, one H1 per page. |

## Verification (build output, local)

- `npm run build`: sitemap has 6 URLs, only `loc` + `lastmod`.
- Prerendered HTML: canonical self-referencing, 1 `<h1>`, JSON-LD parses on every page, FAQ text present without JS.
- Live `curl -I` NOT VERIFIED: the sandbox proxy blocks digitalizatenerife.es (403 CONNECT).
