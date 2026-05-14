# 📡 SEO Implementation Guide - Landing Page

## Overview

Implementation of SEO optimization for the Landing Page using i18n translation keys, following Clean Architecture and SDD orchestrator workflow.

**Date**: 2026-05-06  
**SDD Phases**: sdd-init → sdd-explore → sdd-propose → sdd-apply → sdd-verify → sdd-archive ✅

---

## 🎯 Objective

Optimize Landing Page SEO by:

1. Adding meta tags (title, description) via i18n translation keys
2. Implementing structured data (JSON-LD Product schema)
3. Ensuring no hardcoded strings (full i18n compliance)
4. Maintaining Clean Architecture separation of concerns

---

## 🏗️ Architecture

### Files Modified

| File                                                       | Purpose           | Changes                                                                                                  |
| ---------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `src/shared/context/LanguageContext.tsx`                   | i18n translations | Added SEO keys: `seoTitle`, `seoDescription`, `seoProductDescription` in both `es` and `en` objects      |
| `src/features/landing/presentation/LandingContainer.tsx`   | Meta tags         | Helmet integration with `t.seoTitle`, `t.seoDescription`, structured data with `t.seoProductDescription` |
| `src/features/landing/presentation/components/Contact.tsx` | Content           | Updated headings to use `t.contactTitle`, `t.contactSubtitle`                                            |

---

## 🔤 Technical Implementation

### 1. Translation Keys (LanguageContext.tsx)

```typescript
interface Translation {
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoProductDescription: string;
  // ... other keys
}
```

**Spanish**:

```json
{
  "seoTitle": "Atrae Más Clientes a Tu Restaurante | Menú QR, NFC y Sistema de Pedidos - SmartConnect QRIBAR",
  "seoDescription": "Aumenta las ventas de tu restaurante y atrae más clientes con QRIBAR...",
  "seoProductDescription": "Plataforma de crecimiento para restaurantes..."
}
```

**English**:

```json
{
  "seoTitle": "Get More Customers for Your Restaurant | QR Menu, NFC & Ordering System - SmartConnect QRIBAR",
  "seoDescription": "Increase restaurant sales and attract more customers with QRIBAR...",
  "seoProductDescription": "Restaurant growth platform with digital menu..."
}
```

### 2. Meta Tags (LandingContainer.tsx)

```tsx
const LandingContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "QRIBAR",
            description: t.seoProductDescription,
            // ... other structured data
          })}
        </script>
      </Helmet>
      {/* Components */}
    </>
  );
};
```

### 3. Structured Data (JSON-LD)

- **Type**: Product
- **Properties**: name, description, brand, offers
- **Validation**: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## ✅ SDD Orchestrator Workflow

### Phases Executed

| Phase       | Model Used                   | Status |
| ----------- | ---------------------------- | ------ |
| sdd-init    | mistral/mistral-large-latest | ✅     |
| sdd-explore | mistral/open-mixtral-8x22b   | ✅     |
| sdd-propose | mistral/mistral-large-latest | ✅     |
| sdd-apply   | mistral/codestral-latest     | ✅     |
| sdd-verify  | mistral/codestral-latest     | ✅     |
| sdd-archive | opencode/big-pickle          | ✅     |

### Key Decisions

1. **i18n Compliance**: All SEO text uses translation keys (`t.seoTitle`, etc.) instead of hardcoded strings
2. **Clean Architecture**: Separation of concerns maintained - translations in `shared/context`, UI in `features/landing/presentation`
3. **TypeSafety**: Both `es` and `en` objects updated to satisfy `Record<Language, Translation>` type

---

## 🔍 SEO Features Implemented

### On-Page SEO

- ✅ Meta title with keywords: "QR Menu", "NFC", "Ordering System", "QRIBAR"
- ✅ Meta description with call-to-action and value proposition
- ✅ H1 tags optimized for "QRIBAR" and "Digital Menu"
- ✅ Keyword usage: "NFC cards for Google Reviews", "Digital menu", "QR ordering"

### Technical SEO

- ✅ Structured data (JSON-LD Product schema)
- ✅ Semantic HTML: `<section>`, `<article>` elements
- ✅ Internal linking: Links to `/tap-review` and `/chatbot`
- ✅ Performance: Lazy-loaded non-critical media

### Content SEO

- ✅ Keyword density optimized
- ✅ Readability maintained
- ✅ Internal linking strategy implemented

---

## 🛠️ Fixes Applied

### Issue: Corrupted LanguageContext.tsx

**Problem**: Duplicate keys and mixed translations after multiple edits  
**Solution**: Rebuilt entire file with clean `es` and `en` objects  
**Learning**: When file corruption occurs, rebuild from scratch instead of multiple incremental edits

### Issue: TypeScript esModuleInterop Error

**Problem**: `react-router` types trying to default-import `@types/react`  
**Solution**: Added `esModuleInterop: true` to `tsconfig.json`  
**Status**: ✅ Type-check passes

---

## 📊 Validation Checklist

- ✅ Linting: `npm run lint` passed
- ✅ Type checking: `npm run type-check` passed
- ✅ No hardcoded strings: All user-facing text via `t.*` keys
- ✅ i18n compliance: SEO keys in both `es` and `en`
- ✅ Structured data: Valid JSON-LD format
- ✅ Security: No API keys leaked
- ✅ Accessibility: ARIA attributes maintained

---

## 🚀 Next Steps

1. **Test Structured Data**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)
2. **Monitor SEO**: Set up Google Search Console for performance tracking
3. **A/B Test**: Try different meta descriptions to optimize CTR
4. **Expand SEO**: Apply same pattern to other pages (`/tap-review`, `/qribar`, `/chatbot`)

---

## 🤖 GEO Agent Readiness (AI Agent Optimization)

**Date**: 2026-05-13  
**Agent Readiness Score**: 32/100 → ~85/100 (projected)

### Overview

GEO (Generative Engine Optimization) improves discoverability and interaction capabilities for AI agents and LLMs. This complements traditional SEO by adding machine-readable files, AI bot access control, and protocol discovery.

### Files Created

| File                                          | Purpose                            | Score Impact |
| --------------------------------------------- | ---------------------------------- | ------------ |
| `public/.well-known/llms.txt`                 | Machine-readable markdown for LLMs | +20 pts      |
| `public/.well-known/mcp/server-card.json`     | MCP Server Card                    | +15 pts      |
| `public/.well-known/agent-skills/index.json`  | Agent Skills discovery             | +12 pts      |
| `public/.well-known/api-catalog`              | API Catalog (linkset+json)         | +7 pts       |
| `public/.well-known/openid-configuration`     | OAuth/OIDC metadata                | +10 pts      |
| `public/.well-known/oauth-protected-resource` | Protected APIs documentation       | +8 pts       |
| `public/.well-known/jwks.json`                | JWKS stub                          | —            |

### Files Modified

| File                   | Change                                   |
| ---------------------- | ---------------------------------------- |
| `public/robots.txt`    | AI bot rules + Content-Signal directives |
| `LandingContainer.tsx` | JSON-LD @graph with author/publisher     |
| `vite.config.ts`       | Link headers for dev                     |
| `vercel.json`          | Link headers for production              |

### AI Bot Rules Added

```
User-agent: GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, Google-Extended, OAI-SearchBot
Allow: /

Content-Signal: ai-train=no
Content-Signal: search=yes
Content-Signal: ai-input=no
```

### Protected APIs Documented

| API              | Auth Required | Rate Limit | Anonymous |
| ---------------- | :-----------: | :--------: | :-------: |
| gemini-embedding |    ✅ JWT     |     No     |    No     |
| gemini-generate  |    ✅ JWT     |   10/min   |    No     |
| chat-with-rag    | Optional JWT  |     No     |    ✅     |

### Validation

```bash
# Test llms.txt accessibility
curl https://digitalizatenerife.es/llms.txt

# Test API catalog
curl -H "Accept: application/linkset+json" https://digitalizatenerife.es/.well-known/api-catalog

# Test Link headers
curl -I https://digitalizatenerife.es/
```

### References

- [Agent Readiness Score](https://agentreadyscore.com)
- [llms.txt specification](https://llmstxt.llc/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Content-Signal IETF Draft](https://datatracker.ietf.org/doc/html/draft-moderow-httpbis-content-signals-00)

---

---

## ⚡ SSG & SEO Overhaul (2026-05-14)

### Overview

Complete Static Site Generation (SSG) implementation using custom `react-dom/server` prerendering + comprehensive SEO overhaul. The landing page was a SPA with zero Google indexation — now serves prerendered HTML for all public routes.

**Date**: 2026-05-14  
**Audit Log**: `docs/audit/2026-05-14_ssg-seo-overhaul.md`

---

### 🏗️ Architecture

#### SSG Pipeline

```
npm run build
  → vite build              (client build → dist/)
  → vite build --mode ssr   (SSR build → dist/server/)
  → node scripts/prerender   (prerenders HTML for /, /servicios, /contacto)
```

#### Dual Entry Points

| Entry                  | Purpose                         | Routes                         | Tech                                                 |
| ---------------------- | ------------------------------- | ------------------------------ | ---------------------------------------------------- |
| `src/entry-server.tsx` | SSR render for prerender script | `/`, `/servicios`, `/contacto` | `renderToString` + `StaticRouter` + `HelmetProvider` |
| `src/entry-client.tsx` | Client hydration                | All routes (incl. lazy-loaded) | `hydrateRoot` + `BrowserRouter` + `HelmetProvider`   |

#### Files Created

| File                        | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `src/entry-server.tsx`      | SSR render entry — `renderToString()` with Helmet extraction |
| `src/entry-client.tsx`      | Client hydration entry — `hydrateRoot()` with all routes     |
| `src/TapReviewHydrator.tsx` | Data-fetching wrapper for TapReviewPage (no SSR fetching)    |
| `scripts/prerender.mjs`     | Build-time script — generates static HTML for each route     |
| `public/llms.txt`           | LLM-readable markdown in public root (for AI crawlers)       |

#### Files Modified

| File                                     | Change                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                             | `<!--ssr-outlet-->` for SSR content, `entry-client.tsx` with `defer`, removed all hardcoded meta/structured data          |
| `vite.config.ts`                         | Dual-mode: SSR build (`mode=ssr`) + client build with manualChunks                                                        |
| `package.json`                           | `build:ssr`, `prerender`, combined `build` pipeline                                                                       |
| `public/sitemap.xml`                     | 8 routes incl. /servicios, /contacto; removed lastmod                                                                     |
| `public/robots.txt`                      | Restored with Allow all + AI bot rules + Content-Signal                                                                   |
| `src/App.tsx`                            | Helmet (title, description, canonical, hreflang, OG, Twitter, LocalBusiness JSON-LD) + "¿Por qué?" section + social links |
| `src/shared/context/LanguageContext.tsx` | Expanded featuresContent 1-6, featuresTitle, contactTitle                                                                 |
| `vercel.json`                            | `X-Robots-Tag: index, follow`, Cache-Control per route                                                                    |

### 🔤 SEO Improvements

#### On-Page SEO

- **Meta tags**: title, description, canonical, hreflang (es + x-default) via Helmet
- **Open Graph**: og:title, og:description, og:type, og:url, og:image
- **Twitter Card**: summary_large_image
- **Structured Data**: LocalBusiness JSON-LD schema (LocalBusiness type with areaServed, serviceType)
- **New section**: "¿Por qué SmartConnect AI?" — ~400 words, 5 paragraphs covering mission, 4 pillars, pricing, results (200+ businesses), digital imperative
- **Expanded content**: All 6 feature descriptions enriched with data, local context, and results
- **Heading fix**: "Nuestras Soluciones" → "Nuestros Servicios", features → "Contacto"
- **Social links**: New 4th footer column (YouTube, X, LinkedIn, Instagram, Facebook)
- **Total visible body text**: ~873 words

#### Technical SEO

- **SSG prerendering**: /, /servicios, /contacto → static HTML with full content
- **Viewport**: `maximum-scale=5.0` removed → clean `width=device-width, initial-scale=1`
- **Font-size**: Explicit `16px` on `body` for mobile tap targets
- **Script loading**: Changed from blocking to `defer` for non-blocking execution
- **Crawlability**: `X-Robots-Tag: index, follow` in Vercel headers
- **Cache-Control**: `public, max-age=3600` per route for CDN caching
- **Sitemap**: 8 routes with priority hierarchy (1.0 → 0.3)

### 🛡️ SSR Safety (CRITICAL)

| Module             | Issue                                                  | Fix                                                                       |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `sanitizer.ts`     | `DOMPurify(window)` at module level crashes in Node.js | Lazy init via `getDomPurify()` with `typeof window === 'undefined'` guard |
| `Contact.tsx`      | `globalThis.matchMedia()` during render crashes in SSR | Added `globalThis.matchMedia === undefined` early return                  |
| `ThemeContext.tsx` | `getInitialTheme()` uses `matchMedia`                  | Already had `typeof window === 'undefined'` guard ✅                      |

### 📊 Validation

- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run type-check` — passes (HelmetServerState type)
- ✅ `npm run build` — full pipeline succeeds (client + SSR + prerender)
- ✅ No hardcoded meta tags — all SEO via Helmet
- ✅ i18n compliance — all text via `t.*` keys
- ✅ Valid JSON-LD — LocalBusiness schema with areaServed

### Build Output

```
dist/
├── index.html              # Prerendered /
├── servicios/index.html    # Prerendered /servicios
├── contacto/index.html     # Prerendered /contacto
├── assets/                 # JS/CSS bundles
└── server/
    └── entry-server.js     # SSR build
```

### ⚠️ Known Issues / TODOs

1. **Social URLs**: Footer social links have `TODO` placeholders — need real URLs
2. **Deploy pending**: Build is local, needs Vercel deploy
3. **Hydration test**: Verify no hydration mismatches post-deploy

---

## 📝 Notes

- **Helmet Library**: Already installed (`react-helmet`), no additional setup needed
- **Translation Keys**: Must be added to BOTH language objects to satisfy TypeScript
- **SDD Profile**: Follows `.opencode/sdd-profile-free.json` with Mistral models for each phase
- **Engram Memory**: SEO implementation saved to Engram (ID: 1, Topic: `seo/landing-page-i18n`)
