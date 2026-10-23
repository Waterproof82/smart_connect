# Full-site SEO/GEO audit (production)

**Timestamp:** 2026-10-23 18:20 WEST (17:20 UTC)
**Scope:** all public routes of `https://digitalizatenerife.es/` (6 indexable, 3 legal noindex, 404, `/admin` `/login` `/panel`), `robots.txt`, `sitemap.xml`, `llms.txt`, markdown negotiation (`Accept: text/markdown`), JSON-LD, PSI mobile on `/` and `/carta-digital`.
**Type:** audit (no code changed)

## Actions
- Fetched every route from production with a Googlebot UA and parsed status, `X-Robots-Tag`, title, description, canonical, robots meta, OG, H1/H2, images, JSON-LD and internal links.
- Verified the live state of PR #160 (its audit log left live `curl` as NOT VERIFIED): sitemap has 6 URLs (`loc` + `lastmod` only), legal pages serve `noindex,follow` (meta + header), `/tap-review` → 301 `/tarjetas-nfc`, `/servicios` → 301 `/`. All PASS.
- Checked FAQPage JSON-LD against visible text on 5 pages (28 Q&A): 0 mismatches.
- Reproduced the markdown-negotiation output locally with `scripts/markdown-extract.mjs` against the production HTML.
- PSI mobile (pagespeed.web.dev, Lighthouse 13.5.0) on `/carta-digital` and `/`.

## Findings
| Priority | Finding | Evidence | Status |
|---|---|---|---|
| P2 | **Markdown negotiation returns truncated content on every route.** `extractRootContent()` uses `/<div id="root"[^>]*>([\s\S]*?)<\/div>\s*</`, which stops at the FIRST `</div>` followed by a tag. `/` returns 283 bytes (title + description only), `/about` 315 bytes; `/carta-digital` stops after the inline JSON-LD, so the body is raw JSON. The same endpoint backs the WebMCP tool `get_page_content_markdown`. Unit tests use a flat `<div id="root"><h1>Hola</h1></div>` fixture, so they never caught it. `scope: "main"` already exists and returns 4.9–15.9 KB of clean content per page. | `curl -H 'Accept: text/markdown'` on prod; `scripts/markdown-extract.mjs:50`; `api/negotiate.mjs:81` | FAIL (open, F-15) |
| P3 | Cloudflare Email Obfuscation rewrites the email on `/about` and the legal pages to `/cdn-cgi/l/email-protection#…` (404 without JS). Non-JS agents and AI crawlers do not see the email that JSON-LD and `llms.txt` declare. | prod HTML of `/about` | WARNING (open, F-16) |
| P3 | Home PSI mobile 90 (FCP 2.3 s, LCP 3.0 s, TBT 140 ms, CLS 0), down from 95–96 on 2026-10-07. Single run, after PR #158 added the featured carta card. | PSI 2026-10-23 18:15 WEST | WARNING (re-measure; ties into F-13) |
| P4 | `api/negotiate.mjs` 404/fallback markdown still titles the site "SmartConnect AI" (legacy brand) while every other surface says "Digitaliza Tenerife". | `api/negotiate.mjs:35,107` | INFO (open, F-17) |
| — | 5 failing tests in `tests/unit/seo/prerenderedSeo.regression.test.ts` read a stale local `dist/` built before PR #160; production meets every assertion. | jest run + prod curl | NOT A REGRESSION (rebuild locally) |
| — | `/carta-digital` PSI mobile 100/100/100/100 (FCP 0.9 s, LCP 0.9 s, TBT 10 ms, CLS 0). | PSI 2026-10-23 18:14 WEST | PASS |
| — | Canonical self-referencing on all indexable routes; `/index.html` canonicalises to `/`; one H1 per page; titles 41–59 chars; all `<img>` with alt + width + height; no Review/AggregateRating markup; NAP consistent (Tacoronte 38356) across JSON-LD, llms.txt and visible text; no hreflang (correct: EN is not URL-addressable, see `src/App.tsx:92`). | prod HTML | PASS |

## Validation
- `npx jest tests/unit/seo tests/unit/scripts tests/unit/agentSurfaceParity.test.ts`: 532 passed, 5 failed (stale `dist/`, see above), 4 skipped.
- `npm run build`: not run (owner rule).
- External tools: PSI done (browser). Rich Results Test, URL Inspection and GSC: pending manual.

## Follow-ups
- F-15: IMPLEMENTED on branch fix/markdown-negotiation-main-scope (scope main + nested-fixture regression test, RED→GREEN, 305 tests pass). Pending deploy + live curl check. Original plan: switch `api/negotiate.mjs` to `scope: "main"` (or a balanced `#root` extraction) and add a test fixture with nested divs + inline JSON-LD; TDD.
- F-16: Cloudflare → Scrape Shield → disable Email Obfuscation (or wrap the email in `<!--email_off-->`).
- Re-run PSI mobile on `/` 2–3 times before acting on F-13.
- GSC: request indexing of `/tpv-restaurantes` and `/ia-chatbots-tenerife` after today's copy change; check canonical selected by Google in URL Inspection.
