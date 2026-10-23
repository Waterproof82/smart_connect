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

## Resolution (same day, 2026-10-23 18:00–19:10 WEST)

| ID | Outcome | Commit | Live check |
|---|---|---|---|
| F-15 | `api/negotiate.mjs` uses `scope: "main"`; regression test with nested divs + inline JSON-LD (RED → GREEN). | a0b4558 (merge c089816) | `/` 4957 B, `/about` 2170 B, `/carta-digital` 16152 B, `/tpv-restaurantes` 13125 B; no raw JSON-LD |
| F-17 | Single `BRAND = "Digitaliza Tenerife"` constant for 404/error markdown; tests forbid the legacy name. | 06a4e3f | `/api/negotiate?path=/no-existe` → `# Digitaliza Tenerife` |
| F-16 | Owner disabled Cloudflare Scrape Shield → Email Obfuscation. | manual | 0 obfuscation markers; `mailto:info@digitalizatenerife.es` on /about, plain email on aviso/privacidad |
| F-13 | Diagnosed; no change (score ≥ 90). | fb8a034 (docs) | See below |

### F-13 diagnosis (PSI mobile FCP 2.3 s)
- Home PSI mobile, 5 runs: 90 / 94 / 91 / 90 / — with FCP 2.3 s every run, LCP 2.6–3.0 s, CLS 0 except one run at 0.024.
- **Not home-specific**: a later `/carta-digital` run also gave FCP 2.3 s / LCP 3.6 s; its earlier 0.9 s was a favourable run.
- PSI observed load is fast: TTFB ≈ 0 ms, observed LCP ≈ 270 ms, no render-blocking requests. The served critical path is identical on both pages (same entry chunk, same 16 modulepreloads, 0 blocking stylesheets) and TTFB is equal (Vercel cache HIT).
- Lighthouse critical chain on both pages: HTML → `index.js` (9 KiB) and HTML → `dm-sans-latin-wght.woff2` (37.85 KiB, not preloaded). When the font lands before the observed first paint, Lantern puts it in the FCP graph and simulates ~2.3 s on slow 4G; otherwise ~0.9 s. Same bimodal mechanism as F-11.
- Ruled out: hidden hero CSS, pending Suspense boundaries, blocking CSS, server latency.
- Decision: NO CHANGE REQUIRED (threshold: act only below 90). If needed later: a lighter DM Sans subset/static weights, or a system font for body text. Do not preload DM Sans again (F-11).
- Local Lighthouse (headless, Windows) is not usable for this: both pages paint after `load` locally.

### Tooling
- Graphify MCP fixed: the user-scope entry used `python -m graphify --mcp`, which graphifyy 0.9.14 removed. Built this repo's code graph (`graphify update .`, 4939 nodes), registered a project-local MCP (`graphify-mcp.exe <repo>/graphify-out/graph.json --transport stdio`) and removed the broken user-scope entry. `graphify-out/` is gitignored.

## Follow-ups
- Owner: rotate the Supabase access token stored in plain text in the user MCP config.
- Owner: indexing was re-requested in GSC for all pages (2026-10-23); check the Google-selected canonical in URL Inspection in about a week.
- Local: rebuild `dist/` before trusting `prerenderedSeo.regression.test.ts` locally.
- Refresh the code graph with `graphify update .` after large changes.
