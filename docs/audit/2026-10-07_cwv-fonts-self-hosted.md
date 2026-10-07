# Audit Log — Self-Hosted Fonts (PR 1 of 3: Core Web Vitals Perf)

**Date:** 2026-10-07
**Change:** SDD `core-web-vitals-perf`
**Type:** CLS fix (Changed)
**Branch:** `feat/cwv-fonts-self-hosted` (base: `develop`, independent PR — not stacked)

## Summary

First of three independent PRs (user-resolved `ask-on-risk` decision: three independent PRs from
`develop`, not stacked, superseding the tasks artifact's initial `stacked-to-main` suggestion)
fixing Core Web Vitals regressions. This PR eliminates font-driven CLS by:

1. Self-hosting DM Sans + Space Grotesk (no more `fonts.googleapis.com`/`fonts.gstatic.com`).
2. Using `font-display: optional` on every primary face (owner decision on file, 2026-10-07) so
   text never swaps late — font CLS is 0 by construction regardless of which fonts a lab/user
   machine has.
3. Force-inlining the primary faces (not just the metric-matched fallback faces) in each route's
   critical CSS, so the `optional` block window isn't missed on first paint.
4. Narrowing the CSP `font-src`/`style-src` to `'self'` and caching `/fonts/` immutably.

## Font assets (task 1.5)

Fetched from the Google Fonts CSS2 API (`family=DM+Sans:opsz,wght@9..40,400..700` +
`family=Space+Grotesk:wght@400..700`, requested with a Chrome User-Agent to get woff2 +
`unicode-range`), latin + latin-ext subsets only (no vietnamese — not needed for Spanish/English
copy), normal style only (no italic — verified zero `<em>`/`<i>`/italic usage in `src/` per
design.md). Saved to `public/fonts/` with `OFL.txt` (SIL Open Font License 1.1, both families'
copyright lines).

| File | Real size |
|---|---|
| `dm-sans-latin-opsz-wght.woff2` | 62,724 B |
| `dm-sans-latin-ext-opsz-wght.woff2` | 31,292 B |
| `space-grotesk-latin-wght.woff2` | 22,288 B |
| `space-grotesk-latin-ext-wght.woff2` | 18,940 B |

**Risk flagged, not blocking**: the DM Sans latin face (~61 KB) is noticeably larger than the
~40 KB budget assumed in design — it carries the full `opsz 9..40` + `wght 400..700` variable
axes. Not changing the plan (variable-font D1 decision already accepted this tradeoff for a
single preloaded request vs. several static per-weight files); flagging for `sdd-verify`/future
subsetting consideration.

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 1.1–1.2 | `scripts/critical-css.mjs`, `tests/unit/scripts/criticalCss.test.ts` | Added a RED case asserting a root-relative `/fonts/*.woff2` `@font-face` is inlined by `collectThemeTokenCss` while an `https://` `url()` face is excluded — failed against the old `isLocalFallbackFontFace` (local()-only). Renamed to `isInlinableFontFace`, extended to accept a `src` where every `url()` matches `/^\/fonts\/[^/]+\.woff2$/`. Also fixed a pre-existing fixture in the same file that used `/fonts/remote.woff2` to mean "remote" (actually root-relative, so it would now wrongly be inlined) — changed to a real `https://` URL to preserve its original cross-origin-exclusion intent. 24/24 pass. |
| 1.3–1.4 | `tests/unit/scripts/criticalCssOutput.test.ts` | Added a `dist/`-gated `maybeIt` (same skip-gracefully convention as the rest of the file) asserting the inlined critical `<style>` contains both the `*Fallback` faces and the primary `/fonts/dm-sans-latin-opsz-wght.woff2`/`/fonts/space-grotesk-latin-wght.woff2` references. No build was run in this apply (user rule), so this test currently **skips** — it becomes a real RED→GREEN gate at `sdd-verify` once `npm run build` runs. 1.4 (wiring) needed no code change: `collectThemeTokenCss` already calls `isInlinableFontFace` directly and is already imported by `scripts/prerender.mjs` (confirmed via the existing "imports critical-css.mjs's exports" test) — 1.2 already covered the pipeline wiring. |
| 1.5 | `public/fonts/*`, `design.md` | See Font assets above. |
| 1.6 | `tokens.css` | Added 4 `@font-face` rules (DM Sans latin/latin-ext, Space Grotesk latin/latin-ext): `url("/fonts/...")`, `font-display: optional`, `font-weight: 400 700`, exact Google-provided `unicode-range` per subset. |
| 1.7 | `index.html` | Removed the 2 Google `<link rel="preconnect">`s, the `preload as="style"`, and the `stylesheet` (print/onload swap) link. Added 2 same-origin `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the latin faces (`space-grotesk-latin-wght.woff2`, `dm-sans-latin-opsz-wght.woff2`). |
| 1.8 | `vercel.json` | CSP: `style-src 'self' 'unsafe-inline'` (dropped `https://fonts.googleapis.com`), `font-src 'self'` (dropped `https://fonts.gstatic.com`). Added a `/fonts/(.*)` rule with `Cache-Control: public, max-age=31536000, immutable`. |
| 1.9 | `tests/unit/scripts/vercelHeaderRules.test.ts` | Checked — this file only asserts `X-Robots-Tag`/`Link`/CSP-presence rules (design.md D5 scope), it does not enumerate `font-src` value or `Cache-Control` rules, so no update was required. Re-ran after the `vercel.json` change: 7/7 still pass. |
| 1.10–1.11 | `tests/unit/perf/fontSelfHosting.test.ts` (new) | 10 RED cases written first (faces↔files exist, `font-display: optional` + weight/unicode-range present on all 4 primary faces, both families present, exactly 2 preloads with `crossorigin`+matching hrefs, zero `googleapis`/`gstatic` refs in `index.html`, CSP `font-src` exactly `'self'`, immutable `/fonts/(.*)` cache rule) — 8/10 failed before 1.6–1.8, as expected. All 10 pass after. |
| 1.12 | `scripts/critical-css.mjs` | Swept the `deferStylesheetLink` doc comment's stale "Google Fonts stylesheet link" example to a generic "third-party stylesheet link" wording. |
| 1.13 | `CHANGELOG.md`, this file | Per protocol. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full suite) — **1435/1490 pass, 52 skipped** (the `dist/`-gated output guards, including
  the new 1.3 case, skip gracefully with no `dist/`), **3 pre-existing failures** in
  `tests/e2e/chatbotFlow.test.ts` (live RAG chatbot API returning 500 — unrelated to this change,
  matches known project memory about the Gemini/Supabase chatbot integration being down). No
  regressions introduced by this PR.
- `npm run build`/`vite build` was **not** run (user rule: never build after changes). Per the
  tasks artifact's 1.14 verify step (routes' inline `<style>` has 4 primary + 2 fallback faces, no
  light-mode flash, no React #421), that full build+prerender+preview check is deferred to
  `sdd-verify`.

## Review budget

`git diff --stat` (cached, excluding binary `.woff2`): 9 files changed, 409 insertions(+), 28
deletions(-) (315 excluding the boilerplate `OFL.txt` license text). Within the tasks artifact's
PR1 forecast (~260-360 lines, Medium risk) when the license file is excluded; slightly over when
included, but `OFL.txt` is non-reviewable boilerplate attribution text, not application logic.

## Untouched (hard constraints, carried from design/spec)

Consent Mode v2 + deferred gtag loader (`index.html`'s inline `<script>`), the critical-CSS
pipeline's body-parity guard (`assertBodyUnchanged`), JSON-LD, markdown negotiation routes,
`manualChunks`/`vite.config.ts` (PR2 scope), WebMCP registration timing (PR3 scope).

## Next (PR2/PR3, not in this batch)

PR2 (`feat/cwv-manual-chunks`, independent, base `develop`): exact-match `manualChunks`. PR3
(`feat/cwv-webmcp-defer`, independent, base `develop`): defer WebMCP registration past hydration.
