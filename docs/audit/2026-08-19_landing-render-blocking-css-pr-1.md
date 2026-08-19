# Audit Log — Per-Route Critical CSS (PR 1 of 2: pure functions)

**Date:** 2026-08-19
**Change:** SDD `landing-render-blocking-css`
**Type:** New capability, inert/unwired (Added)

## Summary

First of two chained PRs (`stacked-to-main`) implementing per-route critical CSS inlining for
the 6 prerendered routes, to eliminate the render-blocking full stylesheet on initial paint
without introducing a flash of incorrectly-themed content in either dark or light mode. The
Review Workload Guard on the tasks artifact forecast ~580-650 changed lines (High risk, over the
400-line single-PR budget), so the user's cached `ask-on-risk` delivery strategy resolved to a
2-PR stacked-to-main split:

- **PR 1 (this batch)**: `scripts/critical-css.mjs` — pure, independently testable functions
  only. Not imported/called from anywhere in the real build. Zero behavior change.
- **PR 2 (follow-up)**: wires the module into `scripts/prerender.mjs`, extends `index.html`'s
  inline `<style>` with a light-mode background fallback (design Decision 3), and adds `dist/`
  output regression guards.

## Dependency gate

`beasties` (the maintained fork of the archived `critters`, used by Angular CLI ≥19) was
verified healthy before installing: `npm view beasties deprecated time.modified version` showed
no `deprecated` field, `version 0.4.3`, last published `2026-07-14` (~5 weeks before this
session) — actively maintained, not abandoned. Added as `^0.4.3` devDependency.

`npm install` flagged 4 pre-existing vulnerabilities (1 low, 3 high: `@babel/core`,
`brace-expansion`, `js-yaml`, `undici`) — verified via `npm ls` that all 4 come from existing
transitive deps (`@typescript-eslint/parser`, `babel-jest`, `eslint`, `jsdom`,
`vite-plugin-svgr`), none introduced by `beasties`. Out of scope for this PR.

## What was implemented (TDD, RED confirmed before GREEN)

`scripts/critical-css.mjs` — plain ESM, matching `scripts/sitemap.mjs`'s existing convention
(pure functions, throws instead of `process.exit`, JSDoc types, no TS/JSX):

| Export | Purpose |
|---|---|
| `LAYER_PREAMBLE` | `@layer properties,theme,base,components,utilities;` — Tailwind v4's compiled first-appearance layer order (verified in design, not guessed) |
| `buildProbeDocument({ cssHref, appHtml })` | Minimal throwaway HTML doc (route CSS link + rendered markup in `#root`) — never written to disk or shipped |
| `extractCriticalCss(probeHtml, { distDir, publicPath, routeName })` | Runs `beasties.process()` against the probe doc, regexes out only its emitted `<style>` content, discards the rest. Throws (never returns empty) on beasties error or empty extraction |
| `collectThemeTokenCss(builtCss)` | postcss-parses the **built** CSS (not `src/index.css`), keeps `:root` + all `.light*` rules (via `rule.selectors`, so `:is(a, b)`-style nested commas aren't mis-split), preserves the `@layer base` wrapper for layered rules, keeps unlayered compound rules (`.light body`, `.light .glass-card`) as-is, prepends `LAYER_PREAMBLE` |
| `deferStylesheetLink(html, cssHref)` | Rewrites only the `<link>` matching the given href to `media="print" onload="this.media='all'"`, appends a `<noscript>` twin of the original blocking tag. Idempotent (detects its own marker, no-ops on a second call). Untouched: any other `<link>` (e.g. Google Fonts, which already has its own independent print-swap) |
| `assertBodyUnchanged(beforeHtml, afterHtml)` | Throws if the `<body>...</html>` region differs between two HTML strings — the mechanism the spec's "SSR/hydration parity" requirement leans on |

### TDD Cycle Evidence

| Function | RED | GREEN | REFACTOR |
|---|---|---|---|
| `buildProbeDocument` | ✅ stub threw `not implemented`, tests failed for that reason | ✅ real impl, 2/2 pass | n/a — first pass clean |
| `extractCriticalCss` | ✅ same stub failure mode | ✅ real impl, 3/3 pass | n/a |
| `collectThemeTokenCss` | ✅ same | ✅ real impl, 5/5 pass | n/a |
| `deferStylesheetLink` | ✅ same | ✅ real impl, 4/4 pass | n/a |
| `assertBodyUnchanged` | ✅ same | ✅ real impl, 3/3 pass | n/a |

RED was captured by writing the full test file first, then temporarily replacing
`critical-css.mjs` with a stub where every export threw `"not implemented"`, confirming all 9
behavioral assertions failed for that exact reason (the other 8 tests that assert `.toThrow()`
trivially passed against the stub, as expected), then restoring the real implementation and
re-running for GREEN (17/17 pass).

Test file: `tests/unit/scripts/criticalCss.test.ts`, following the existing
`sitemapGeneration.test.ts` convention — spawns a real `node --input-type=module -e "..."`
subprocess per case (ts-jest's CJS transform cannot `import()` plain ESM `.mjs` directly; this
repo has no jsdom Jest environment wired, node-only).

## Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings (`.mjs` is excluded from `--ext ts,tsx`, expected).
- `npx jest --config=jest.config.js` — **943/943 tests pass across 71 suites** (full repo suite,
  not just the new file), no regressions.

## Untouched (hard constraint, carried from design/spec)

`entry-server.tsx`, `entry-client.tsx`, `App.tsx`, `src/index.css`, `vite.config.ts`,
`scripts/prerender.mjs`, `index.html`. Nothing imports `critical-css.mjs` yet — it is dead code
by design until PR 2 wires it in.

## Next (PR 2, not in this batch)

Wire `critical-css.mjs` into `scripts/prerender.mjs`'s per-route loop (with a `CRITICAL_CSS=0`
kill-switch and fail-loud extraction-error handling), add the `prefers-color-scheme: light`
background fallback to `index.html`'s existing inline `<style>` (design Decision 3 — flagged in
tasks.md as a spec gap, recommend a follow-up `sdd-spec` amendment before archive), and add
`dist/*.html` output regression guards (skipped gracefully when `dist/` is absent, per the "never
run `npm run build` during apply" constraint).
