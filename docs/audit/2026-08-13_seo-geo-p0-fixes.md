# SEO/GEO P0 Fixes — SDD Change Audit

**Date**: 2026-08-13
**Author**: SDD Pipeline (sdd-apply agent)
**Change**: `seo-geo-p0-fixes`
**Status**: PR#1 (`fix/geo-static-surfaces`) committed to `fix/seo-geo-p0-static-surfaces` and merge-ready. PR#2 (`fix/seo-geo-p0-routing-sitemap`, this batch) implementation complete on the working tree, not yet committed — left for user review per delivery instructions.

---

## Objective

Close 7+ dead/redirected URLs and structural SEO/GEO defects: fake integrity hashes in `agent-skills/index.json`, invalid `hrefLang` tags in `App.tsx`, an unreachable client-side `/contacto` route, an inconsistent NAP (phone number) between `AboutPage.tsx` and other surfaces, a hand-maintained `sitemap.xml` missing `/tarjetas-nfc`, and a silent-failure bug in the prerender build script that let a broken build deploy successfully.

## Delivery Strategy

`ask-on-risk` — user pre-confirmed chained PRs, `stacked-to-main` chain strategy (design §6). PR#1 → `main` first, PR#2 rebases onto `main` after.

| PR | Branch (base) | Scope |
|---|---|---|
| PR#1 | `fix/geo-static-surfaces` (base: `main`) | 5 static `.well-known`/llms.txt surfaces + guard test — content-only, no TS/build risk |
| PR#2 (this batch) | `fix/seo-geo-p0-routing-sitemap` (base: PR#1 branch) | sitemap generation, routing cleanup, NAP, WebMCP, enforcement tests, docs |

## Architectural thesis (design §0)

The bug class is duplicated route knowledge — the route list existed in 5 places with nothing forcing them to agree. PR#2 collapses this into `scripts/site-routes.json` (single source of truth, feeds both `prerender.mjs` and `sitemap.mjs`) and enforces it going forward with `tests/unit/scripts/routeParity.test.ts`.

## Work done (PR#2, tasks 2.1-2.16)

1. **`scripts/prerender.mjs` root-cause fix** — `.catch(console.error)` (logs, exits 0) → `.catch((err) => { console.error(err); process.exit(1); })`. This was the actual silent-failure mechanism; every internal `process.exit(1)` inside `prerender()` was defeated once a failure arrived as a promise rejection.
2. **`scripts/site-routes.json`** (new) — 6 routes with `path`/`priority`/`changefreq`/optional `lastmod`. Consumed by `prerender.mjs`, `sitemap.mjs` (indirectly via prerender), `routeParity.test.ts`, and `geoSurfaces.test.ts` (swapped from PR#1's literal array).
3. **`scripts/sitemap.mjs`** (new) — pure `buildSitemapXml`/`validateSitemapXml`/`writeSitemap`, all failure modes `throw` (never call `process.exit` directly) so the fix in (1) is what turns a broken sitemap into a failed build. Implements guards G1 (non-empty route table), G2 (artifact size + `<loc>` count), G3 (well-formed `<loc>`), G4 (prerender/sitemap set identity, enforced in `prerender.mjs`).
4. **`public/sitemap.xml` deleted** — was hand-maintained, missing `/tarjetas-nfc`, and had no build-time verification.
5. **`src/App.tsx`** — removed `useLocation`/`isContacto` branching, 3 invalid `hrefLang` `<link>` tags, hoisted `CANONICAL_URL`/`PAGE_TITLE`/`PAGE_DESCRIPTION` to module consts, `<Hero variant=.../>` → `<Hero />`. The SEO checklist comment (line ~109) was **rewritten, not deleted** — it now states the hreflang-absence invariant and the exact condition under which it stops holding (`i18n-url-routing`), per design D7: deleting it would remove the only guard rail against the exact regression this change fixes.
6. **`src/features/landing/presentation/components/Hero.tsx`** — removed `HeroProps`/`variant`; `React.FC` with no props.
7. **`src/entry-client.tsx`** — removed `<Route path="/contacto">`; rewrote the stale "(/, /contacto)" comment. `entry-server.tsx` was **not** touched — it never had `/contacto` (removal converges the two route trees, per design D6).
8. **`src/features/landing/presentation/components/AboutPage.tsx`** — NAP fix: `telephone` `+34922123456` → `+34 601 39 64 19`, matching `llms.txt` and `SeoSchema.tsx`.
9. **`src/WebMCP.ts`** — `get_contact_info` (EN + ES) no longer returns the dead `/contacto` URL; now `.../#contacto`. Per design D12, the `get_page_content_markdown` enum edit (removing `/contacto`, adding `/tarjetas-nfc`) is **explicitly deferred** to a future change `agent-surface-drift` — it is an agent-visible schema change requiring markdown-negotiation parity across 4 files, out of scope for a P0 content patch.
10. **`tests/unit/scripts/routeParity.test.ts`** (new) — asserts `entry-server.tsx`'s `<Route>` set exactly equals `scripts/site-routes.json`.
11. **`tests/unit/scripts/geoSurfaces.test.ts`** — swapped PR#1's literal `LIVE_ROUTES` array for a `site-routes.json` read (the one line design §6's revert-independence ADR expected to change between the two PRs).
12. **`tests/unit/scripts/sitemapGeneration.test.ts`** (new) — behavioral tests for `sitemap.mjs`'s pure functions.
13. **`.atl/skill-registry.md`** — updated the stale SPA Hydration Safety route table (previously listed `/servicios`, `/contacto`, `/carta-digital`, `/tap-review` — all long gone) to the 6 real prerendered routes + `/admin` SPA.
14. **`CHANGELOG.md`** — `[Unreleased]` Fixed/Added entries covering both PR#1 and PR#2.

## Key discovery — Jest cannot import scripts/sitemap.mjs

`jest.config.js`'s `transform` only covers `.ts(x)`/`.js(x)`; `.mjs` is untransformed, and `npm test` runs without `--experimental-vm-modules`. A `dynamic import("../../../scripts/sitemap.mjs")` inside a `.test.ts` file fails with `SyntaxError: Cannot use import statement outside a module` — empirically confirmed, matching design D1's stated rationale for choosing JSON over an `.mjs` export for the route table itself.

Rather than fall back to the project's existing weaker convention for this case (source-text regex assertions, e.g. `TpvModulesSection.structure.test.ts`), `tests/unit/scripts/sitemapGeneration.test.ts` spawns a real `node --input-type=module -e "<script>"` subprocess per test to import and execute `sitemap.mjs`'s exports directly. This gives genuine behavioral coverage of a pure ESM script with zero Jest transform involvement, and is a stronger pattern than regex-over-source for future `scripts/*.mjs` unit tests in this repo.

## Deviations from the tasks/design artifacts (documented)

1. **`tests/unit/route-registration.tarjetas-nfc.structure.test.ts`** (pre-existing, from the `/tarjetas-nfc` route-registration change, not part of this SDD change's task list) asserted `scripts/prerender.mjs` still hardcoded a `const routes = [...]` literal array containing `/tarjetas-nfc`. That assumption is superseded by this change (routes now come from `scripts/site-routes.json`). Updated the single affected assertion to check `site-routes.json` instead of the now-removed literal — same pattern as PR#1's `llmsTxt.structure.test.ts` deviation. Not scope creep: same underlying fact (`/tarjetas-nfc` is prerendered) is still verified, just from its new source of truth.
2. **Orchestrator prompt vs. tasks vs. design on the WebMCP.ts enum**: the launch prompt's summary said the `get_page_content_markdown` enum "debe incluir `/tarjetas-nfc`", while `design.md` §5/D12 explicitly defers the entire enum edit to a future change, and `tasks.md` task 2.11 says "2-string fix only; enum ... deferred" in prose but its own "Done:" criterion ("no bare /contacto (non-#) left in file") read literally would also require touching the enum. Resolved in favor of the deepest, most-reasoned source — design D12's explicit deferral — and scoped the fix to exactly the 2 `get_contact_info` string literals named in the task's action items. The enum's `/contacto` entry (and the missing `/tarjetas-nfc` entry) are untouched, flagged here for `agent-surface-drift`.
3. **CLAUDE.md route table** (task 2.14): no route table exists in `CLAUDE.md` today (verified via search) — nothing stale to correct there. Only `.atl/skill-registry.md`'s SPA Hydration Safety section had one, and that was updated.

## Validation (real command output, not assumed)

- `npx jest --config=jest.config.js` (full suite): **684/684 tests passed, 63/63 suites passed** (was 654/59 after PR#1 — net +2 test files: `App.routing.structure.test.ts`, `napAndAgentSurfaces.test.ts`, `tests/unit/scripts/sitemapGeneration.test.ts`, `tests/unit/scripts/routeParity.test.ts`; 1 pre-existing test file updated).
- `npx tsc --noEmit`: **clean, zero errors**.
- `npm run lint`: **clean, zero errors/warnings**, exit code 0.
- `npm run build` (`vite build && vite build --mode ssr && node scripts/prerender.mjs`): **succeeded**. All 6 routes prerendered; `dist/sitemap.xml` generated with exactly 6 `<loc>` entries matching `scripts/site-routes.json` (verified by direct inspection — no fabricated `lastmod` values, all from the reviewed literal table).
- Hydration verification (design §2.2, mandatory): `<!--$-->` (Suspense SSR marker) confirmed present in all 6 prerendered `dist/**/index.html` files. `#root` non-empty (real SSR HTML) in all 6; `dist/_spa.html`'s `#root` is empty (`<div id="root" class="min-h-full"></div>`), confirming the `hasSSRContent` detection (`rootElement.children.length > 0`) still correctly routes `/admin` through `createRoot` and the 6 prerendered routes through `hydrateRoot`.

## TDD Cycle Evidence

See `sdd/seo-geo-p0-fixes/apply-progress` (Engram, merged PR#1+PR#2) for the full per-task RED→GREEN table.
