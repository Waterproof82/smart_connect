# SSG + SEO Overhaul — Audit Log

**Date**: 2026-05-14
**Type**: Feature / SEO
**Scope**: Landing page prerendering, SEO optimization, SSR safety

---

## Summary

Implemented Static Site Generation (SSG) with custom `react-dom/server` prerendering and comprehensive SEO overhaul for the landing page at digitalizatenerife.es. The site has never been indexed by Google — this PR prepares it for full crawlability and indexing.

## Phases

### Phase 1: Crawlability

- **robots.txt**: Restored with Allow all + Disallow admin/panel/login + AI bot rules (GPTBot, ClaudeBot, etc.) + Content-Signal directives + Sitemap reference
- **sitemap.xml**: Expanded from 5 to 8 routes, added /servicios and /contacto with proper priorities
- **vercel.json**: Added `X-Robots-Tag: index, follow` header, Cache-Control per route (/, /servicios, /contacto)

### Phase 2: Custom SSG (Static Site Generation)

- **`src/entry-server.tsx`**: SSR entry with `renderToString`, `StaticRouter`, `HelmetProvider`, renders `/`, `/servicios`, `/contacto`
- **`src/entry-client.tsx`**: Hydration entry with `hydrateRoot`, `BrowserRouter`, all routes (including lazy-loaded admin/carta-digital/tap-review/404)
- **`src/TapReviewHydrator.tsx`**: Extracted data-fetching wrapper for TapReviewPage (avoids SSR data fetching)
- **`scripts/prerender.mjs`**: Build-time script that generates static HTML for each public route, injects SSR content into `<!--ssr-outlet-->` and helmet head tags
- **`vite.config.ts`**: Dual-mode config — SSR build (`mode=ssr`) produces `dist/server/entry-server.js`, client build produces `dist/` with entry-client.tsx
- **`index.html`**: Replaced static H1 fallback with `<!--ssr-outlet-->` and entry-client.tsx script with `defer`
- **`package.json`**: Added `build:ssr`, `prerender`, and combined `build` pipeline scripts + `cross-env` devDependency

### Phase 3: On-page SEO

- **`src/App.tsx`**: Helmet with title, description, canonical, hreflang (es, x-default), OG tags (title, description, type, url, image), Twitter card, LocalBusiness JSON-LD schema
- **New content section**: "¿Por qué SmartConnect AI?" with ~400 words covering mission, four pillars, transparent pricing, results (200+ businesses in Canarias)
- **Heading fixes**: featuresTitle → "Nuestros Servicios", contactTitle → "Contacto"
- **Content expansion**: All 6 featuresContent paragraphs expanded with more detail (data, results, local context)
- **Social links footer**: New 4th column in footer with YouTube, X, LinkedIn, Instagram, Facebook links
- **Total visible body text**: ~873 words

### Phase 4: Technical SEO

- **viewport**: Changed from `maximum-scale=5.0` to clean `width=device-width, initial-scale=1`
- **font-size**: Added explicit `16px` on `body` for mobile tap target compliance
- **Scripts**: Changed from default (blocking) to `defer` for non-blocking execution
- **Helmet**: Removed all hardcoded meta tags from index.html (title, description, OG, Twitter, canonical, JSON-LD) — now all managed dynamically via Helmet in App.tsx

### Phase 5: SSR Safety

- **`sanitizer.ts`**: DOMPurify changed from eager module-level `DOMPurify(window)` to lazy init via `getDomPurify()` with `typeof window === 'undefined'` guard
- **`Contact.tsx`**: `prefersReducedMotion()` now checks `globalThis.matchMedia === undefined` before calling
- **`ThemeContext.tsx`**: Already had SSR guard in `getInitialTheme()` — confirmed working

## Files Created

| File                        | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `src/entry-server.tsx`      | SSR render entry (renderToString + HelmetProvider + StaticRouter) |
| `src/entry-client.tsx`      | Client hydration entry (hydrateRoot + BrowserRouter + all routes) |
| `src/TapReviewHydrator.tsx` | Data-fetching wrapper for TapReviewPage                           |
| `scripts/prerender.mjs`     | Build-time prerender script (/, /servicios, /contacto)            |
| `public/llms.txt`           | LLM-readable markdown file in public root                         |

## Files Modified

| File                                                       | Change                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `index.html`                                               | SSR outlet, entry-client.tsx, viewport fix, font-size, removed hardcoded meta/structured data |
| `package.json`                                             | build pipeline, build:ssr, prerender scripts, cross-env dep                                   |
| `package-lock.json`                                        | cross-env + invariant deps                                                                    |
| `public/sitemap.xml`                                       | 8 routes with priorities, removed lastmod                                                     |
| `src/App.tsx`                                              | Helmet SEO tags, "¿Por qué?" section, social links footer, 4-column footer                    |
| `src/shared/context/LanguageContext.tsx`                   | Expanded content (featuresContent 1-6), featuresTitle, contactTitle                           |
| `src/features/landing/presentation/components/Contact.tsx` | SSR guard for prefersReducedMotion                                                            |
| `src/shared/utils/sanitizer.ts`                            | DOMPurify lazy init (SSR-safe)                                                                |
| `vercel.json`                                              | X-Robots-Tag, Cache-Control per route                                                         |
| `vite.config.ts`                                           | Dual SSR/client build mode                                                                    |

## SSR Safety Guards Applied

| Module             | Issue                                                                 | Fix                                                                  |
| ------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `sanitizer.ts`     | `DOMPurify(window)` crashes at module init when `window` is undefined | Lazy init with `typeof window === 'undefined'` guard                 |
| `Contact.tsx`      | `globalThis.matchMedia(...)` called during render (not in useEffect)  | Early return `true` if `matchMedia` is undefined                     |
| `ThemeContext.tsx` | Same pattern                                                          | Already had `typeof window === 'undefined'` guard (no change needed) |

## Build Pipeline

```bash
# Full build (client + SSR + prerender)
npm run build
# Which runs:
#   1. vite build              → client build to dist/
#   2. cross-env MODE=ssr vite build --mode ssr → SSR build to dist/server/
#   3. node scripts/prerender.mjs               → prerenders HTML for each route
```

## Validation

- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run type-check` — passes (HelmetServerState type used correctly)
- ✅ `npm run build` — client build + SSR build + prerender all succeed
- ✅ DOMPurify — lazy init pattern works in both SSR (returns null) and browser (returns instance)
- ✅ No hardcoded meta tags — all SEO via Helmet in App.tsx
- ✅ i18n compliance — all user-facing text via `t.*` keys
- ✅ Structured data — Valid JSON-LD LocalBusiness schema

## Build Output

```
dist/
├── index.html                 # Prerendered homepage
├── servicios/index.html       # Prerendered servicios page
├── contacto/index.html        # Prerendered contacto page
├── assets/                    # Client bundle (JS/CSS)
└── server/
    └── entry-server.js        # SSR build (for prerender script)

```

**Bundle size**: Client build unchanged from previous SPA build — SSG adds zero runtime overhead.
