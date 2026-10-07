# Audit Log — DM Sans wght-only Payload (PR 1 of 3: Font Stability)

**Date:** 2026-10-07
**Change:** SDD `font-stability`
**Type:** Perf/CLS fix (Changed)
**Branch:** `feat/font-stability-dm-sans-wght` (base: `develop`, independent PR — not stacked)

## Summary

First of three independent PRs (user-resolved: three independent PRs from `develop`, chain
strategy `stacked-to-main` recorded in the tasks artifact but superseded by the user's explicit
independent-PR choice, same pattern as the prior `core-web-vitals-perf` cycle). This PR shrinks
the self-hosted DM Sans payload by dropping the unused `opsz` (optical size) variable axis, which
the design/explore phases found the project never varies — only `wght` 400-700 is used in `src/`.

## Font assets (task 1.2)

Re-fetched from the Google Fonts CSS2 API with `family=DM+Sans:wght@400..700` (no `opsz` axis),
using a modern Chrome User-Agent to get the woff2 branch of the API's content negotiation. The
API returned byte-identical `unicode-range`s to the existing `opsz`-bearing faces for both
subsets, so no CSS subset/coverage change results from dropping the axis.

| File | Old size (opsz+wght) | New size (wght-only) |
|---|---|---|
| `dm-sans-latin-wght.woff2` (was `dm-sans-latin-opsz-wght.woff2`) | 62,724 B | 36,932 B |
| `dm-sans-latin-ext-wght.woff2` (was `dm-sans-latin-ext-opsz-wght.woff2`) | 31,292 B | 18,228 B |
| **Total** | **94,016 B** | **55,160 B** |

Reduction: −38,856 B (−41.3%). Under the design's 56,000 B budget by 840 B.

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 1.1 | `tests/unit/perf/fontSelfHosting.test.ts` | Added a new `describe` block (3 cases: no `opsz` filename referenced in `tokens.css`/`index.html`, no `opsz` file present in `public/fonts/`, DM Sans total ≤ 56,000 B) to the existing font-delivery guard file rather than a new file — the guard file already owned this contract. Ran RED: 3/13 failed against the old opsz files (94,016 B total, filenames containing `opsz`). |
| 1.2 | `public/fonts/dm-sans-latin-wght.woff2`, `dm-sans-latin-ext-wght.woff2` | Added (see Font assets above); `git rm` on the 2 old `*-opsz-wght.woff2` files. |
| 1.3 | `tokens.css` L92/L103 | Both DM Sans `@font-face` `src` urls repointed to the new wght-only filenames. `unicode-range`, `font-weight: 400 700`, `font-display: optional` untouched — identical to the old faces. |
| 1.4 | `index.html` L159 | DM Sans `<link rel="preload" as="font">` href repointed to `dm-sans-latin-wght.woff2`. |
| 1.5 | `tests/unit/scripts/criticalCssOutput.test.ts` L131 | Literal updated from `dm-sans-latin-opsz-wght\.woff2` to `dm-sans-latin-wght\.woff2`. This is a `dist/`-gated `maybeIt` — ran against a stale pre-existing (untracked, gitignored) `dist/` from a prior session's build; it failed because the stale `dist/` still referenced the old filename. Removed the stale `dist/` (gitignored build artifact, not source) so the test skips gracefully per its documented convention instead of false-failing against out-of-date output; it becomes a real gate at `sdd-verify` once a fresh `npm run build` runs. |
| 1.6 | repo-wide | `rg -n "opsz"` after all changes: zero matches in `tokens.css`, `index.html`, `tests/unit/scripts/criticalCssOutput.test.ts`. Remaining matches are historical-only: `CHANGELOG.md`'s already-released PR1-of-`core-web-vitals-perf` entry and `docs/audit/2026-10-07_cwv-fonts-self-hosted.md` (both describe the prior PR's `opsz`-bearing assets as they existed at the time — not live references), plus the new guard test's own assertion strings and `design.md`'s note explaining the dropped axis. |
| 1.7 | `design.md` L62-73, `CHANGELOG.md`, this file | `design.md`'s "Verified facts" font paragraph updated: removed the `opsz`-bearing DM Sans sizes/risk note, added the wght-only sizes and the 55,160 B total. `CHANGELOG.md` `[Unreleased] → Changed` gained a new top entry for this PR. |
| 1.8 | — | See Verification below. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean, no output.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full suite) — **1469/1524 pass, 52 skipped** (the `dist/`-gated output guards skip
  gracefully with no `dist/` present), **3 pre-existing failures** in `tests/e2e/chatbotFlow.test.ts`
  (live RAG chatbot API returning 500 — unrelated to this change, matches known project memory
  about the Gemini/Supabase chatbot integration being down). No regressions introduced by this PR.
- `npm run build`/`vite build` was **not** run (user rule: never build after changes). The
  `dist/`-gated assertion in `criticalCssOutput.test.ts` (task 1.5) is deferred to `sdd-verify`
  once a fresh build runs.

## Review budget

`git diff --cached --stat` (excluding binary `.woff2`): 6 files changed, 52 insertions(+), 10
deletions(-). Including the 2 binary font swaps: 10 files changed. Well within the tasks
artifact's PR1 forecast (~90 lines, Low risk).

## Untouched (hard constraints, carried from design/spec)

Space Grotesk faces and fallback metrics (PR2 scope), the post-hydration fixed-mount gate for
CookieBanner/reopener/chat FAB (PR3 scope), `.ds-h1` text-wrap (PR2 scope), the critical-CSS
pipeline's `isInlinableFontFace`/force-inline behavior (unchanged — same selector logic, new
filename only), CSP/`vercel.json` (unchanged — `font-src 'self'` already covers any same-origin
filename).

## Next (PR2/PR3, not in this batch)

PR2 (`feat/font-stability-h1-fallback`, independent, base `develop`): empirical Space Grotesk
fallback `size-adjust` retune + `.ds-h1` `text-wrap: wrap`. PR3
(`feat/font-stability-fixed-mount-gate`, independent, base `develop`): gate CookieBanner/reopener/
chat FAB mount on deferred-stylesheet-applied.
