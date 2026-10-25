# Blog: OG images, "Lee también" links, two new articles

**Timestamp:** 2026-10-25 11:00 UTC
**Scope:** items 6 (partial), 7 and 8 of `docs/MEJORAS_PENDIENTES.md`, done without owner data. Skill: seo-geo-expert.
**Type:** feat (SEO), TDD

## BEFORE / CHANGE / AFTER

### 8 — OG image per article (f76ace6)
- BEFORE: every article and `/blog` used `/og/home.png` (E2: `BlogPostPage.tsx`, `BlogIndexPage.tsx`).
- CHANGE: `blogOgImage(slug)` and `BLOG_INDEX_OG_IMAGE` in `blogPosts.ts`; `og:image`, `twitter:image` and `BlogPosting.image` use them; `scripts/generate-og-images.mjs` gained one entry per article plus `blog.png`. Only the new PNGs were committed (the script re-renders the existing five with different bytes; those were restored).
- AFTER: `src/__tests__/blogOgImages.test.tsx` renders every article through `entry-server` and checks the three tags and a 1200x630 PNG. RED before, GREEN after.

### 7 — "Lee también" on service pages (826c23b)
- BEFORE: the blog was linked only from the footer.
- CHANGE: `RelatedArticles.tsx` lists the articles whose `cta.to` is the page, after the FAQ of the four service pages; i18n keys `relatedArticlesTitle` / `relatedArticlesIntro` (EN says the guides are in Spanish).
- AFTER: `src/__tests__/relatedArticles.test.tsx` renders each service page and checks exactly the matching links; `/about` renders no block.

### 6 — two articles
- `comandero-movil-vs-libreta-restaurante` → `/tpv-restaurantes`; `carta-digital-bares-cafeterias` → `/carta-digital`. Every product statement is taken from current site copy (comandero module bullets, carta digital modes, 5 languages, Telegram for pickup, own customer database). The comandero article says "móvil" only: the "tablet" wording was removed from TPV copy on 2026-10-23 as unconfirmed.
- Wired in `prerenderedRoutes.ts`, `serverPages.ts`, `clientPages.ts`, `clientRoutes.tsx`, `site-routes.json` (lastmod 2026-10-25), `middleware.ts`, `vercel.json` (rewrite + HTML Cache-Control rule), `llms.txt` (sha256 in `agent-skills/index.json` recomputed with the same method: old hash matched the previous file).
- Tests: removed hardcoded counts (`keywordAlignment` 4 articles, `pageMaps` 4 blog paths, `agentSurfaceParity` 14 routes ×2) in favour of parity with `BLOG_POSTS` / `site-routes.json`; "no price figure" now applies to every article except the labelled Glovo example.

## REGRESSION CHECK
- `ssrHydrationParity` (now 16 prerendered paths + 2 unknown): pass.
- `npx tsc --noEmit`, `npm run lint`, `npx knip`: pass. Jest 1786 passed (40 skipped: dist-only suites grow per route). Vitest 49 files / 265 tests.

## NOT VERIFIED (manual)
- Rich Results Test / URL Inspection for the two new URLs, and requesting indexing in Search Console.
- Inconsistency found, not changed: `src/shared/i18n/modules/comandero-movil.ts` (live on `/tpv-restaurantes`) still says "tablet o móvil". Owner to confirm whether tablets are supported.
