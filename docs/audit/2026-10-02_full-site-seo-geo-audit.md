# Full-site SEO / GEO / AEO audit (read-only)

**Timestamp:** 2026-10-02 12:30 UTC
**Scope:** all 9 public routes (`/`, `/tarjetas-nfc`, `/carta-digital`, `/ia-chatbots-tenerife`, `/tpv-restaurantes`, `/about`, `/legal/aviso|privacidad|cookies`), `robots.txt`, `sitemap.xml`, `llms.txt`, `.well-known/*`, `vercel.json`, `middleware.ts`, `src/entry-client.tsx`, `SeoSchema.tsx`, `LanguageContext.tsx`.
**Type:** audit (no code changed)
**Evidence base:** live production HTML/headers fetched with a Googlebot UA (served through Cloudflare → Vercel), Lighthouse 12 lab runs (mobile, local machine, 4 pages), source code, one external check (Tapstar public pages). `dist/` was NOT used (stale build from 2026-08-24). PageSpeed Insights API quota was exhausted → no CrUX field data.

## Actions
- Fetched and parsed raw HTML + headers for every public route; extracted title, description, canonical, robots, hreflang, OG/Twitter, headings, landmarks, images, JSON-LD and internal links.
- Checked HTTP behaviour: http→https, www→apex, trailing slash, case, 404, legacy redirects, `index.html` duplicates, `/admin`, `/_spa.html`, `/api/negotiate`, Vercel alias host.
- Validated `sitemap.xml`, `robots.txt` and `llms.txt` (live == repo; `llms.txt` sha256 matches `agent-skills/index.json`).
- Ran Lighthouse (performance, accessibility, SEO, best practices) on `/`, `/carta-digital`, `/tarjetas-nfc`, `/tpv-restaurantes`.

## Findings
| Priority | Finding | Evidence | Status |
|---|---|---|---|
| P0 | Self-serving `Review` JSON-LD (7 nodes: home ×4, NFC ×3). `itemReviewed` is the company itself (typed `SoftwareApplication` "Digitaliza Tenerife"), `datePublished` defaults to the build date, one "author" is "Comunidad Hostelera" and its body is a marketing claim, the same placeholder business ("Café Central Madrid") appears with different quotes on two pages. | `SeoSchema.tsx:588-600`, `SuccessStats.tsx:100-103`, `SocialProof.tsx:29-37`, `TestimonialCarousel/index.tsx:32`, live HTML | FAIL |
| P0 | Third-party (Tapstar) figures presented as own on `/tarjetas-nfc`: "4.9/5", "+20,000 negocios", "+600K reseñas", "+400 reseñas diarias", "Miles de negocios confían en nosotros", "expositor Tapstar". Tapstar's own pages/social profiles publish "+20.000 negocios" and a 4.9 rating. Contradicts home "Decenas Clientes Activos". Already visible in Google's snippet for the page. | `StatsBanner.tsx:15-33`, `LanguageContext.tsx:858,867,891,920` (+EN copies), Firecrawl search 2026-10-02 | FAIL |
| P1 | Unsourced result claims: "Hasta 45 %", "Hasta 6×", "de 200 a 1200 reseñas", "de 50 a 500 en 3 meses", FAQ "multiplicar por 6 en 90 días". | `LanguageContext.tsx:585-600,894-905`, home FAQ JSON-LD | NOT VERIFIED (owner) |
| P1 | React error #421 on lazy-loaded prerendered routes (carta, NFC, TPV): Suspense boundary gets an update before the lazy chunk resolves and falls back to client rendering, discarding SSR HTML. Lab: `/carta-digital` LCP 6.4 s (≈90 % render delay, text element), `/tarjetas-nfc` CLS 0.225 / LCP 3.3 s. Eager home: LCP 1.5 s, CLS 0.003. | `src/entry-client.tsx` (lazy routes + `hydrateRoot`), Lighthouse `errors-in-console` | FAIL (lab) |
| P1 | Home H1 "Aumenta tu facturación, ahorra horas cada semana" names no product, audience or place; GSC (2026-10-01) shows home at avg pos. ~44 matched to generic AI queries. Title was already fixed. | live HTML, `2026-10-01_gsc-search-performance-analysis.md` | FAIL |
| P2 | Entity graph gaps: no `WebSite` node; `WebPage.author/publisher` are inline `Organization` objects without `@id` (not linked to `#organization`); no `sameAs`; product pages redeclare `#organization` as `Organization` (home declares it `LocalBusiness`); `knowsAbout`/`description` still lead with n8n/automation. | home + product JSON-LD | WARNING |
| P2 | `HowTo` JSON-LD on `/tarjetas-nfc` (rich result retired by Google), relative image URLs, step text names Tapstar. | `HowItWorks.tsx:40`, `SeoSchema.tsx:686-700` | WARNING |
| P2 | `smart-connect-olive.vercel.app` serves the full site with 200 + `X-Robots-Tag: index, follow` (canonical points to the official domain, so mitigated). `http://www` → 2 redirect hops. | curl | WARNING |
| P2 | `/api/negotiate?path=…` serves Markdown copies of every page with `X-Robots-Tag: index, follow` and no canonical. | curl | WARNING |
| P2 | `robots.txt`: `Content-Signal: ai-train=no` while training crawlers (GPTBot, Google-Extended, CCBot, Bytespider, Meta-ExternalAgent) are explicitly allowed; named groups override `*`, so `/admin` Disallow and Content-Signal do not apply to them; Lighthouse flags `Content-Signal` as unknown directive. | `public/robots.txt`, Lighthouse `robots-txt` | WARNING |
| P2 | A11y: cookie-banner buttons 3.06:1 contrast (#f6f9fc on #0f92f7, 14 px) on every page; footer link text "Más información"; split headings on `/carta-digital` (kicker `div` + `h2` fragment "estás perdiendo hoy?", "cambian tu negocio"); home duplicates "Preguntas Frecuentes" as h2 + h3. | Lighthouse, live HTML | FAIL |
| P2 | `llms.txt` drift: lists n8n/WhatsApp automation as separate services, says "6 rutas" (there are 9), "React 19" (installed 18.3.1), claims "WCAG 2.1 AA" (unverified, contrast fails); `agent-skills/index.json` description lists removed pages. | `public/llms.txt`, `public/.well-known/agent-skills/index.json` | FAIL (coherence) |
| P3 | Voseo in es-ES copy ("Contactá", also in FAQ JSON-LD); hardcoded "+600K", "+400", "4.9/5" in JSX (i18n rule). | `LanguageContext.tsx:1038`, `StatsBanner.tsx` | WARNING |
| P3 | `BreadcrumbList` on product pages without a visible breadcrumb. | live HTML | WARNING |
| P3 | NFC images use supplier/CDN filenames (`S0c0ed93…jpg_640x640q75.jpg_.avif`, `Tarjeta_NFC_negra_MontesTAP.webp`); usage rights unknown. Oversized images: NFC −168 KiB, TPV −366 KiB (responsive images). | `public/assets/nfc/`, Lighthouse | NOT VERIFIED (rights) |
| P3 | `server-card.json` has no endpoint/transport (stub) and is advertised as `rel="api-catalog"` (RFC 9727 expects a linkset). | `vercel.json` Link header | WARNING |
| P3 | Security hardening: CSP allows `'unsafe-inline' 'unsafe-eval'`; no `Permissions-Policy`; `Access-Control-Allow-Origin: *` on HTML; GA4 uses Consent Mode advanced (tag loads and sends cookieless pings before consent — the `index.html` comment "nothing measured until explicit opt-in" is inaccurate). | live headers, `index.html:15-63` | WARNING |
| P4 | `/admin` linked from the public header; `<meta charset>` at byte 2334 (WHATWG: first 1024 bytes; HTTP header covers it); `/about` thin (302 words). | live HTML | INFO |
| — | PASS: canonical self-referencing on all 9 routes; real 404 + noindex; legacy 301s; trailing-slash/case handling; sitemap only 200/canonical URLs with git-derived lastmod; `/admin` + `/_spa.html` noindex; NAP identical across HTML/JSON-LD/llms.txt (no `38001`, no `smartconnectai.es`); one H1 + `main` per page; all `<img>` with alt and dimensions; OG 1200×630 per product page; HTTPS + HSTS; `llms.txt` hash valid. | live + code | PASS |

## Validation
- `npm run lint` / `type-check` / `test` / `build`: not run — no code changed in this audit.
- Live HTTP/HTML checks: done (curl, Googlebot UA).
- Lighthouse 12 (mobile, lab): done for 4 pages — home 96/96/100/83, carta 66/96/96/85, NFC 72/96/96/85, TPV 96/96/96/85 (perf/a11y/BP/SEO).
- PageSpeed Insights / CrUX: NOT VERIFIED (API quota exceeded).
- Rich Results Test, Schema.org Validator, URL Inspection, GSC: NOT VERIFIED (no access).

## Follow-ups
- Owner decisions: real testimonials/figures (P0), Tapstar relationship and wording (P0), AI-training crawler policy (P2), English URLs (P3).
- Fresh GSC export (Pages → not indexed with URL list; Performance 28 days) to check the three new product pages.
- Vercel: redirect the `*.vercel.app` alias to the official domain.
