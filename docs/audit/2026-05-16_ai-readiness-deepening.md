# AI Readiness Deepening — Content Negotiation, WebMCP & Authorship

**Date**: 2026-05-16  
**Type**: Architecture / SEO / AI Readiness  
**Agent**: Gentle Orchestrator (big-pickle)

## Changes Summary

Complete second round of GEO/AI-readiness improvements:

### 1. Markdown Content Negotiation (+10 pts)

- Created `middleware.ts` — Vercel Edge Middleware that intercepts `Accept: text/markdown`
- Created `api/negotiate.mjs` — Node.js Serverless Function that reads prerendered HTML, extracts #root content, converts to Markdown via `turndown`
- Created `vite-plugin-md-negotiation.ts` — Vite plugin for dev-mode SSR-to-Markdown conversion
- Modified `vite.config.ts` — Added the plugin

### 2. Agent Skills Index (+12 pts)

- Added `$schema` field to `public/.well-known/agent-skills/index.json`
- Replaced empty sha256 hashes with real hash of `llms.txt`
- Added 2 new skills: `markdown-negotiation` and `webmcp-tools`

### 3. WebMCP Tools (+10 pts)

- Created `src/WebMCP.ts` — Registers 4 tools via `navigator.modelContext.provideContext()`
- Modified `src/entry-client.tsx` — Calls `registerWebMCPTools()` at boot

### 4. Authorship & Authority Signals (+7 pts)

- Modified `src/App.tsx` — Added `<link rel="author">`, expanded JSON-LD to `@graph` with WebPage + author + publisher
- Modified `src/features/landing/presentation/LandingContainer.tsx` — Fixed URLs from `smartconnect.ai` to `digitalizatenerife.es`, added `rel="author"`
- Created `src/features/landing/presentation/components/AboutPage.tsx` — New `/about` page with Organization info
- Added `/about` route to `entry-server.tsx`, `entry-client.tsx`, `scripts/prerender.mjs`, `vercel.json`

## Technical Decisions

1. **Edge Middleware + Serverless Function** over pure-Edge conversion: `turndown` requires Node.js DOM APIs not available in Edge Runtime.
2. **Vite plugin** for dev: Uses `server.ssrLoadModule` to SSR-render pages, then `turndown` to convert.
3. **Separate `/about` page** instead of embedding org info in every page: cleaner separation, one source of truth for Organization schema.
4. **URL correction**: All JSON-LD references changed from `smartconnect.ai` to `digitalizatenerife.es` (official domain per CLAUDE.md).

## Files Changed

### Created (5)

- `middleware.ts`
- `api/negotiate.mjs`
- `vite-plugin-md-negotiation.ts`
- `src/WebMCP.ts`
- `src/features/landing/presentation/components/AboutPage.tsx`

### Modified (8)

- `vite.config.ts`
- `src/App.tsx`
- `src/features/landing/presentation/LandingContainer.tsx`
- `src/entry-server.tsx`
- `src/entry-client.tsx`
- `scripts/prerender.mjs`
- `vercel.json`
- `public/.well-known/agent-skills/index.json`

### Documentation (5)

- `.atl/skill-registry.md` — Added AI Readiness compact rules
- `.atl/smart-connect-standards.md` — Added AI Readiness standards section
- `docs/SEO_IMPLEMENTATION.md` — Added full documentation section
- `docs/audit/2026-05-16_ai-readiness-deepening.md` — This file
- `docs/PRODUCTION_CHECKLIST.md` — Updated section 9

## Validation

- ✅ `npx tsc --noEmit` — 0 errors
- ✅ `npx eslint . --ext ts,tsx --max-warnings 0` — 0 errors, 0 warnings
- ✅ `npm run build` — Client build clean (1765 modules)
- ✅ `npm run build:ssr` — SSR build clean
- ✅ Prerender — 10 routes including `/about`
- ✅ `rel="author"` verified in prerendered HTML
- ✅ JSON-LD `@graph` with author/publisher verified
- ✅ URLs use `digitalizatenerife.es`

## Dependencies Added

- `turndown` (production)
- `@types/turndown` (dev)
- `@vercel/edge` (dev)
