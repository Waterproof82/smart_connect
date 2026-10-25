# Shared AppShell + prerendered route table — PR1 (route table + page maps)

**Timestamp:** 2026-10-25 01:40 WEST (00:40 UTC)
**Scope:** `shared-app-shell` change, PR1 of 2 (stacked-to-main). Replaces the hand-copied route lists in `entry-client.tsx` and `entry-server.tsx` with one shared, typed path table and per-entry page maps. AppShell/ClientApp extraction and the render-based shell-parity guard are PR2, not in scope here.
**Type:** refactor (SSR/hydration), TDD

## Actions
- Created `src/shared/routing/prerenderedRoutes.ts` — `PRERENDERED_PATHS` (14 paths, `as const`) and `PrerenderedPath` type. Zero React imports (Jest-importable).
- Created `src/shared/routing/prerenderedRouteElements.tsx` — `PageMap` type and `prerenderedRouteElements(pages)` helper that turns a page map into `<Route>` elements.
- Created `src/serverPages.ts` (`SERVER_PAGES`, eager imports, 4 blog paths → `BlogPostPage`) and `src/clientPages.ts` (`CLIENT_PAGES`, `"/"` → `App`, rest → the matching `clientRoutes.ts` preloadable's `Component`).
- Edited `src/clientRoutes.tsx`: dropped the local `PrerenderedPath` union in favor of importing it from the shared table; `PRERENDERED_ROUTES` is now keyed by `Exclude<PrerenderedPath, "/">`; un-exported `BLOG_POST_ROUTE` (module-local — nothing outside the file needs it directly anymore).
- Edited `src/entry-server.tsx` and `src/entry-client.tsx`: both build their `<Routes>` via `prerenderedRouteElements(SERVER_PAGES | CLIENT_PAGES)` instead of 14 hand-written `<Route>` elements each. The client appends `/admin` then `*` (NotFound) after the shared table, and **no longer registers `/blog/:slug`** — see Fixed entry in CHANGELOG.md. Providers (Helmet/Theme/Language/Consent/ScrollToTop/CookieConsent/Suspense) are untouched in this PR; the shared `AppShell` extraction is PR2.
- Rewrote 6 tests from source-text regex matching to import/identity-based assertions: `routeParity.test.ts`, `clientRouteParity.test.ts`, `route-registration.tarjetas-nfc.structure.test.ts` (points 1-2), `App.routing.structure.test.ts` (the `/contacto` "still renders `<App/>` for `/`" case moved to `pageMaps.test.tsx`, Vitest, because `clientPages.ts`/`serverPages.ts` are page-map modules Jest must not import), `keywordAlignment.gsc.test.ts` (blog coverage block). Added 1 new test file, `src/__tests__/pageMaps.test.tsx` (Vitest), covering exhaustiveness, the "Server Pages Never Lazy" guard, and the blog-coverage both-directions check.
- Followed strict TDD throughout: each new/changed assertion was run RED (missing module / stale regex) before the corresponding implementation made it GREEN.

## Validation
- `npx tsc --noEmit`: pass, 0 errors.
- `npm run lint` (`eslint . --ext ts,tsx --max-warnings 0`): pass, 0 warnings.
- `npx knip`: pass, 0 findings (confirms `BLOG_POST_ROUTE` is no longer flagged as an unused export now that it's module-local).
- `npm test` (Jest): 146/147 suites pass, 1778/1808 tests pass, 30 skipped (unrelated pre-existing conditional skips), 1 suite skipped — `tests/unit/seo/prerenderedSeo.regression.test.ts`, which needs a built `dist/` and is stale from 2026-10-08; not touched or caused by this change, and no build was run to "fix" it per the owner's never-build-after-changes rule.
- `npx vitest run`: 39/39 files pass, 219/219 tests pass.

## Deviations from design
- None in scope/approach. One sequencing note: `src/clientRoutes.tsx` (task 2.2) was updated in the same pass as `src/clientPages.ts` (task 1.5) because `clientPages.ts`'s type-checked `PageMap` literal needed `PRERENDERED_ROUTES`'s new `ClientRoutePath`-keyed shape to compile; `clientRouteParity.test.ts` (task 2.1) was therefore written after that code already existed rather than strictly before it. The RED phase was still exercised for every other task (1.1, 1.4, 3.1) via a real failing run before implementation.

## Follow-ups (PR2, out of scope here)
- `src/shared/presentation/AppShell.tsx`, `src/ClientApp.tsx`, provider-order/Helmet-threading tests, the render-based `ssrHydrationParity.test.tsx` shell-parity guard, and the owner-gated build/dist diff (Phase 4).
