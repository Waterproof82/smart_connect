# Audit Log — Hero `.ds-h1` Line-Break Stability (PR 2 of 3: font-stability)

**Date:** 2026-10-07
**Change:** SDD `font-stability`
**Type:** CLS fix (Changed)
**Branch:** `feat/font-stability-h1-fallback` (base: `develop`, independent PR — not stacked on PR1)

## Summary

Second of three independent PRs (user-resolved delivery: three independent PRs from `develop`,
each its own revertable unit). This PR fixes two root causes of hero `.ds-h1` line-break CLS on
the real Space Grotesk / local Arial fallback swap (quantified in sdd-explore #1163):

1. The shared `.ds-h1,.ds-h2,.ds-h3` rule in `src/index.css` applies `text-wrap: balance` to all
   three. `.ds-h1` is the hero LCP element (`Hero.tsx`) — balanced wrapping caused a 360px
   word-grouping shift between the real font and the fallback. `.ds-h2`/`.ds-h3` are below the
   fold (not the LCP element), so they keep `balance` unchanged.
2. `tokens.css`'s `"Space Grotesk Fallback"` `@font-face` used a pure
   `@capsizecss/metrics`-derived `size-adjust: 109.69%`, which matches the real font's line breaks
   at 412px but **flips the line count** at 375px (iPhone SE/8/X — a very common real-user
   viewport) from 3 lines to 4.

## Measurement (gate required by design.md D3 before changing size-adjust)

Measured with headless Chrome (puppeteer-core) rendering `.ds-h1`'s actual markup/CSS (clamp
font-size, `line-height: 1.05`, `letter-spacing: -0.025em`, `text-wrap: wrap` — the PR's own new
value) against the real self-hosted Space Grotesk `woff2` vs. a local-Arial fallback, sweeping
`size-adjust` candidates at the 4 explore-identified widths plus the 2 Lighthouse desktop-preset
widths requested by design.md (`1024`, `1350`). ascent/descent overrides for each candidate were
re-derived from the same Capsize formula used by
`tests/unit/perf/fontFallbackMetrics.test.ts` (`ascent = 984/1000/sizeAdjust`,
`descent = |−292|/1000/sizeAdjust`).

Line count (real font vs. fallback), `text-wrap: wrap` in effect at every width:

| Width | Real | 105% | 105.5% | **106% (chosen)** | 106.5% | 109.69% (old) |
|---|---|---|---|---|---|---|
| 360px | 4 | 4 | 4 | 4 | 4 | 4 |
| 375px | 3 | 3 (exact) | 3 (exact) | **3 (exact)** | 3 (exact) | **4 — FLIP** |
| 390px | 3 | 3 | 3 | 3 | 3 | 3 |
| 412px | 3 | 3 | 3 | 3 | 3 | 3 |
| 1024px | 2 | 2 | 2 | 2 | 2 | 2 |
| 1350px | 2 | 2 | 2 | 2 | 2 | 2 |

Findings:
- Every candidate in `[105%, 106.5%]` keeps 375px byte-for-byte identical to the real font's line
  split and fixes the known 109.69%-flip. Only 109.69% (the old value) flips 375px.
- Unlike design.md's conservative worst-case assumption ("412px loses exactness" as the accepted
  tradeoff), the actual measurement shows **no regression at 412/1024/1350px** for any candidate in
  the band — 106% does not trade away desktop/tablet correctness to fix 375px.
- At 360px all candidates (including the old 109.69%) already match the real font's total height
  (151px, no box-size CLS) but with a different word grouping than 109.69% specifically — this is
  the same "no line-count flip, small word-grouping variance" result sdd-explore #1163 recorded,
  unaffected by which of the 105–106.5% candidates is picked.
- Per design.md D3's rule ("pick the highest value in [105,106.5] that keeps 375 exact"), **106%**
  is selected.
- Script and raw JSON results kept in the scratchpad (not the repo, per instructions):
  `measure-pr2.mjs`, `pr2-sweep-results.json`.

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 2.1 | (scratchpad `measure-pr2.mjs`) | Measured real vs. fallback `.ds-h1` line counts at 360/375/390/412/1024/1350px for candidates 105/105.5/106/106.5/109.69%, `text-wrap: wrap`. Table above. |
| 2.2 | `tests/unit/perf/fontFallbackMetrics.test.ts` | Refactored `computeOverrides` to delegate to a new `computeOverridesFromSizeAdjust(webfont, sizeAdjust)` helper; added `EMPIRICAL_SIZE_ADJUST = 1.06` and rewrote the Space Grotesk Fallback assertion to use it instead of the Capsize-derived value, asserting `sizeAdjust === "106%"`, `ascentOverride === "92.83%"`, `descentOverride === "27.55%"`. Confirmed RED: failed against the still-109.69%-based `tokens.css` (`Expected substring: "size-adjust: 106%"`, received `"109.69%"`). DM Sans Fallback's test/formula is untouched (still pure Capsize via `computeOverrides`). |
| 2.3 | `tokens.css` | `"Space Grotesk Fallback"` `@font-face`: `size-adjust: 106%`, `ascent-override: 92.83%`, `descent-override: 27.55%`, `line-gap-override: 0%` (unchanged). Old Capsize values kept as a commented-out line for provenance. `DM Sans Fallback` untouched. 375px exactness held — no widening beyond 106% needed. |
| 2.4 | `tests/unit/perf/fontFallbackMetrics.test.ts` | Added a new `describe(".ds-h1 text-wrap override ...")` block: (a) the shared `.ds-h1,.ds-h2,.ds-h3` rule still contains `text-wrap: balance` (regression guard that PR2 does NOT edit the shared selector), (b) a dedicated `.ds-h1 {...}` rule contains `text-wrap: wrap`, (c) that same rule does not contain a `text-wrap: balance` declaration. Confirmed RED on (b): the dedicated `.ds-h1` block (font-size/weight/line-height/letter-spacing only) had no `text-wrap` property yet. |
| 2.5 | `src/index.css` | Added `text-wrap: wrap;` plus an explanatory comment inside the existing dedicated `.ds-h1 { ... }` rule (did not touch the shared `.ds-h1,.ds-h2,.ds-h3` selector, so `.ds-h2`/`.ds-h3` keep `balance`). |
| 2.6 | — | Re-ran the sweep at the final committed value (106%, `text-wrap: wrap`) — same table as above; no line-count flip at any of the 6 widths, `.ds-h2`/`.ds-h3` confirmed still `balance` via the 2.4(a) regression test. |
| 2.7 | `design.md`, `CHANGELOG.md`, this file | Per protocol — `design.md`'s font-fallback bullet and display-typography bullet updated to describe the empirical Space Grotesk value and the `.ds-h1` wrap override; `CHANGELOG.md` `[Unreleased] → Changed` new top entry. |
| 2.8 | — | Verify below. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full suite) — **1469/1524 pass**, 52 skipped (dist-gated tests — no `dist/` present;
  a stale gitignored `dist/` directory left over from a prior session's build was removed so these
  skip gracefully per their documented `maybeIt` convention, same precedent as PR1), **3
  pre-existing failures** in `tests/e2e/chatbotFlow.test.ts` (live RAG chatbot API returning 500 —
  unrelated to this change, same failures recorded in PR1's apply-progress). No regressions
  introduced by this PR.
- `npm run build` was **not** run (user rule: never build after changes). The real production
  build + Lighthouse/PSI check (375px block-`/fonts/*` manual comparison, mobile/desktop CLS
  scores) is deferred to `sdd-verify` per design.md's own "Verification (sdd-verify)" section.

## Review budget

Modified: `tokens.css` (+13/−6 incl. comment), `src/index.css` (+5/−0), `tests/unit/perf/fontFallbackMetrics.test.ts`
(+66/−6), `design.md` (+16/−3), `CHANGELOG.md` (+1). Plus this audit log. Within the tasks
artifact's PR2 forecast (~130 lines, Low risk).

## Deviation from design.md

None in substance. One refinement: design.md's accepted worst-case tradeoff ("412px loses
exactness") did not materialize — the actual measurement shows 106% is a strict improvement (fixes
375px, zero regression elsewhere), not a tradeoff. Recorded here rather than silently assumed.

## Untouched (hard constraints, carried from design/spec)

DM Sans self-hosting/file sizes (PR1 scope, independent unmerged branch — not touched or based on
here), `DM Sans Fallback`'s Capsize-only formula, the shared `.ds-h1,.ds-h2,.ds-h3` selector itself
(only `.ds-h1`'s own dedicated rule gained `text-wrap: wrap`), post-hydration fixed-mount gate (PR3
scope).

## Next (PR3, not in this batch)

PR3 (`feat/font-stability-fixed-mount-gate`, independent, base `develop`): gate CookieConsent /
DeferredExpertAssistant mount on the deferred app stylesheet having applied, to eliminate the
flow-then-snap CLS on those fixed-position elements.
