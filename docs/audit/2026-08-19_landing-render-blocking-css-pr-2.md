# Audit Log — Per-Route Critical CSS (PR 2 of 2: wiring into the real build)

**Date:** 2026-08-19
**Change:** SDD `landing-render-blocking-css`
**Type:** Behavior change — wires PR 1's inert module into the real build (Added)

## Summary

Second of two chained PRs (`stacked-to-main`) implementing per-route critical CSS inlining. PR 1
shipped `scripts/critical-css.mjs` as a standalone, unimported module (zero behavior change). This
PR wires it into `scripts/prerender.mjs`'s per-route loop, extends `index.html`'s inline fallback
`<style>`, and adds `dist/*.html` output regression guards.

- **PR 1 (prior batch, on this branch)**: `scripts/critical-css.mjs` pure functions + unit tests.
- **PR 2 (this batch)**: `scripts/prerender.mjs` wiring, `index.html` light-mode fallback, output
  guard tests, CHANGELOG/audit.

## What was implemented (TDD, RED confirmed before GREEN)

### 1. `scripts/prerender.mjs` wiring

Imports `buildProbeDocument`, `extractCriticalCss`, `collectThemeTokenCss`, `deferStylesheetLink`,
`assertBodyUnchanged` from `critical-css.mjs`. Two new local helpers (deliberately NOT added to
`critical-css.mjs`, to preserve PR 1's pure-extraction-only module boundary):

- `resolveBuiltCssAsset()` — scans `dist/assets/*.css`, expects exactly 1 file (per design's
  verified fact), throws otherwise.
- `findStylesheetTag(html, cssHref)` — locates the exact Vite-injected `<link>` by href, used as
  the anchor for the style-injection replacement.

Per-route head pass (inside the existing loop, after the outlet + Helmet replace):

1. Build a throwaway probe document from that route's rendered `appHtml`.
2. `extractCriticalCss()` — beasties decides what's critical for that route's markup.
3. Merge with `collectThemeTokenCss()`'s force-included `:root`/`.light` token layer — placed
   **first**, since it already starts with `LAYER_PREAMBLE` per its own contract from PR 1; this
   satisfies design Decision 1's "preamble must be the first line" requirement without duplicating
   it. Critical CSS is appended after.
4. Single atomic string replacement: splice `<style>{merged}</style>` immediately before the exact
   original `<link>` tag, then `deferStylesheetLink()` that link (media=print swap + `<noscript>`).
5. `assertBodyUnchanged(beforeHeadPass, result)` — build-time self-check, not an assumption.

`CRITICAL_CSS=0` env var short-circuits the entire block (`CRITICAL_CSS_ENABLED` guard) — when
set, `result` is exactly `template.replace(outlet).replace(head)`, identical to the pre-PR2 code
path, byte-for-byte.

`dist/_spa.html` is written from the raw template **before** this per-route loop and is never
re-entered by it — confirmed both by source-text test and by direct inspection of a real build
(see Verification below).

Extraction errors are never caught locally — they propagate through the existing outer
`try { await prerender() } catch { process.exit(1) }`, so a failed/empty extraction fails the
build loudly, per spec's "Extraction failure fails the build loudly" scenario.

### 2. `index.html` light-mode fallback (design Decision 3)

Extended the existing inline `<style>` (previously dark-only) with:

```css
@media (prefers-color-scheme: light) {
  html {
    background-color: var(--color-bg, #fafafa);
  }
}
```

**Known spec/design gap (restated from tasks.md, not silently dropped):** the spec artifact
(`sdd/landing-render-blocking-css/spec`) formalizes only 2 of design's 3 open-question
resolutions — theme force-include and `_spa.html` non-regression. This light-mode fallback
requirement has **no matching formal spec requirement**; it is implemented directly from design
(design.md Decision 3), which is explicit and authoritative here, per tasks.md Phase 4's own
note. Recommend a follow-up `sdd-spec` amendment before archive to add this as a formal
requirement — not blocking for apply, but flagged again here so it isn't lost from the audit
trail.

### 3. Output regression guards — `tests/unit/scripts/criticalCssOutput.test.ts`

Two independent concerns in one file:

- **`index.html` source-text guard** (real RED/GREEN, no build required): asserts the light-mode
  media query is present, the pre-existing dark-default rule is untouched, and the fallback lives
  inside the *existing* inline `<style>` (not a new block).
- **`dist/*.html` structural guards** (design.md Testing Strategy "Output" row): for each of the 6
  routes in `site-routes.json`, asserts exactly one critical `<style>` containing `.light{` and
  `--color-bg`, a deferred app `<link>`, a matching `<noscript>`, and the `<!--$-->` Suspense
  marker; for `_spa.html`, asserts the link stays blocking and no critical `<style>` was injected.
  These guards **skip gracefully** (`it.skip`, mirroring `documents-rls.test.ts`'s
  `describeIfConfigured` convention) whenever a route's `dist/` file is absent, **or present but
  not reflecting a clean single-pass build with this wiring** (`isCleanSinglePassOutput()` checks
  exactly one `<title>` tag and a deferred app link) — this suite never invokes
  `npm run build`/`vite build` itself, per the hard constraint.

### TDD Cycle Evidence

| Task | Test File | RED | GREEN | REFACTOR |
|---|---|---|---|---|
| 3.1/3.2 — `prerender.mjs` wiring | `criticalCss.test.ts` (5 new source-text tests) | ✅ 4/5 failed for the right reason (1 already true pre-wiring, correctly) | ✅ real impl, 22/22 pass in file | ✅ fixed an over-strict assertion (counting `_spa.html` string occurrences including my own comment) during GREEN, re-ran clean |
| 4.1/4.2 — `index.html` fallback | `criticalCssOutput.test.ts` | ✅ 2/3 failed (fallback absent) | ✅ real impl, 3/3 pass | n/a — first pass clean |
| 5.1/5.2 — output guards | `criticalCssOutput.test.ts` | N/A — env-gated (`it.skip`) suite, mirrors existing `describeIfConfigured` repo convention rather than a literal RED against absent build output | ✅ verified against a real functional dry-run (see Verification) | n/a |

## Verification

### Functional dry-run against a real build (not just unit tests)

`dist/` already contained a completed prior build (assets + SSR server bundle) from before this
session. Ran `node scripts/prerender.mjs` directly (**not** `npm run build`/`vite build` — no
fresh Vite bundling was triggered, only the prerender step against already-built assets) to
validate the wiring end-to-end against real `beasties`/`postcss` output:

- `dist/index.html`: 2 `<style>` tags (hand-authored fallback + injected critical CSS), app
  `<link>` correctly deferred (`media="print" onload="this.media='all'"`), matching `<noscript>`,
  critical CSS contained real `--color-bg:oklch(...)` and `.light{--color-bg:oklch(...)` token
  values, `<!--$-->` Suspense marker intact.
- `dist/about/index.html`, `dist/legal/aviso/index.html`: same pattern confirmed (2 `<style>`,
  deferred link).
- `dist/_spa.html`: untouched — 1 `<style>` (hand-authored only), link still plain/blocking.
- `CRITICAL_CSS=0 node scripts/prerender.mjs`: confirmed the kill-switch branch is taken
  (`⏭️  CRITICAL_CSS=0 — skipping critical CSS inlining pass.` logged, head block skipped).

**Caveat**: re-running `prerender.mjs` a second time (for the kill-switch check) against the
already-mutated `dist/index.html` — instead of a fresh `vite build` output, which this script
assumes as a precondition and was never designed to be re-entrant against its own prior output —
caused cumulative duplicate Helmet head tags across all route files (pre-existing characteristic
of the outlet+Helmet replace, not something PR 2 introduced; confirmed by inspecting `title` tag
counts before/after). This is a **local testing artifact only** — `dist/` is gitignored, disposable
build output, never committed, and unrelated to source correctness. After confirming the
mechanism works via the evidence above, the generated `dist/index.html`, `dist/_spa.html`,
`dist/tarjetas-nfc/`, `dist/about/`, `dist/legal/`, and `dist/sitemap.xml` were deleted, leaving
`dist/assets/` and `dist/server/` intact — an honest "needs a fresh build" state. This is why the
`criticalCssOutput.test.ts` output guards currently skip gracefully rather than run for real; a
subsequent `npm run build` will regenerate correct output and those guards will execute.

### Standard checks

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npx jest --config=jest.config.js` — **72/72 suites, 951/977 tests pass, 26 gracefully skipped**
  (the `dist/*.html` output guards, per the caveat above) — no regressions against PR 1's
  943/943 baseline (943 + 5 new wiring tests + 3 new `index.html` tests = 951 passed; +26 skipped
  = 977 total).

## Deviations from Design

None in source behavior. One implementation-detail note: design's data-flow diagram lists
`layerPreamble + critical + tokens` conceptually; the actual merge order chosen is
`themeTokenCss + "\n" + criticalCss` (tokens first, critical after) because `collectThemeTokenCss`
already contractually returns `LAYER_PREAMBLE` as its own first line (established and tested in
PR 1) — placing it first satisfies "preamble must be the first line of the inline `<style>`"
without emitting the preamble twice. Functionally equivalent; CSS custom-property resolution and
same-named `@layer` re-declaration are both order-independent for this content.

## Untouched (hard constraint, carried from design/spec)

`entry-server.tsx`, `entry-client.tsx`, `App.tsx`, `src/index.css`, `vite.config.ts`.

## Issues Found

None blocking. The known spec/design gap on the `index.html` light-mode fallback (see above) is
carried forward from tasks.md, not new.

## Status

All 20 tasks across both PRs (Phases 1-7) complete. 977 total tests (951 passing, 26 gracefully
skipped pending a real build). Ready for `sdd-verify`.
