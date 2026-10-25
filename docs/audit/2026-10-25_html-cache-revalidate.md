# HTML Cache-Control: browsers revalidate, edge caches

**Timestamp:** 2026-10-25 10:20 UTC
**Type:** fix (deploy safety), TDD

## Finding
While verifying the WebMCP fix in Chrome, the browser served the previous deploy's HTML from its cache (`Cache-Control: public, max-age=3600`). That HTML referenced `index-B264UT9f.js` and `WebMCP-CFf0ixz2.js`, which already answered 404 on production. A visitor with old HTML and no cached copy of a lazy route chunk would fail to load it; `entry-client.tsx` swallows the preload error and hydrates anyway, and `React.lazy` then rejects with no error boundary.

## Actions
- `vercel.json`: HTML rule value `public, max-age=3600` → `public, max-age=0, must-revalidate, s-maxage=3600`.
- New `tests/unit/scripts/vercelHtmlCache.test.ts`: every non-asset Cache-Control rule must have `max-age=0`, `must-revalidate` and `s-maxage`; `/assets/*` and `/fonts/*` stay `public, max-age=31536000, immutable`. RED on the old value, GREEN after.
- `docs/SEO_IMPLEMENTATION.md`: Cache-Control line updated.
- Not changed: `api/negotiate.mjs` markdown responses keep `max-age=3600` (no hashed asset references).

## Validation
- `npx tsc --noEmit`, `npm run lint`, `npx knip`: pass.
- Jest: 1786 passed, 30 skipped.

## Follow-up (optional, not done)
- Error boundary that reloads once on a chunk-load failure, as a second layer.
