# Audit Log — Light-mode Contrast Token Fix (PR C: U4)

**Date:** 2026-08-19
**Change:** SDD `landing-performance-a11y` (PR C of 3 — U4 contrast tokens + visual sweep)
**Type:** Accessibility fix (Changed)
**Delivery strategy:** ask-on-risk, chain strategy stacked-to-main; PR C forecast ~10 token
lines + ~60-100 sweep lines across ~50 files, 400-line budget risk Low (code-only; sweep
turned out to require zero component edits — see Sweep section below).

## Summary

Full SDD pipeline (spec → design → tasks → apply, engram-backed) closing out the
`landing-performance-a11y` change. Third and final independent unit: darkening two
light-mode text tokens so real-world usages clear WCAG 2.1 AA (4.5:1), and sweeping the
codebase to confirm the token-level fix propagates everywhere without needing per-component
edits.

## U4 — Light-mode contrast tokens

**Finding (from design.md, re-verified against the live `src/index.css`):** the original
proposal audited `--color-primary` and `--color-success-text` only against the lightest
surface (`--color-bg`, L98%). Both tokens are also used as text color sitting on
`--color-accent-subtle` / `--color-success-bg` (both L90% — 5 L points darker), e.g.
`SeoSchema.tsx`'s and `CartaDigitalBBDDSection.tsx`'s small (12-14px) semibold chips. At the
previous values (`--color-primary` 55%L, `--color-success-text` 50%L) the worst-case ratios
measured **~3.62:1** and **~4.17:1** respectively — both fail AA (4.5:1 for normal text).

**Fix:** in `src/index.css`, `.light` block only:

| Token | Before | After |
|---|---|---|
| `--color-primary` | `oklch(55% 0.18 250)` | `oklch(47% 0.18 250)` |
| `--color-success-text` | `oklch(50% 0.15 150)` | `oklch(45% 0.15 150)` |

Post-fix worst-case ratios (measured, this session's OKLCH→linear-sRGB→WCAG-luminance
computation): `--color-primary` vs `--color-accent-subtle` (L90%) ≈ **5.13:1**;
`--color-success-text` vs `--color-success-bg` (L90%) ≈ **5.17:1**. Both clear AA with
headroom. (Design.md's own math landed on 4.99:1 / 5.12:1 for the same pair — the small
delta is rounding/implementation variance in the OKLCH matrices, not a different token
value; both computations agree the values clear AA.)

**Why 47% and not the grid-aligned 45%:** `AboutPage.tsx`'s hover pair (`text-[var(--color-primary)]
hover:text-[var(--color-accent-hover)]`, L199/L214) would collapse to an invisible hover
state at 45% because `--color-accent-hover` is itself `oklch(45% 0.18 250)`. 47% keeps a
perceptible (~2 L point) delta between resting and hover state while still clearing AA.

**Explicitly untouched:**
- `--color-error-text` (`oklch(50% 0.18 25)`) — already measured at 4.88:1, passing AA; out
  of scope per design.md.
- Dark-mode `:root` block (`--color-primary: oklch(65% 0.18 250)`, `--color-success-text:
  oklch(70% 0.15 150)`) — byte-identical, confirmed via test assertion.
- `DashboardPreview.tsx` — confirmed dead code (zero importers) in design.md; not part of
  this or any visual sweep.

## Visual sweep

Design.md catalogued ~134 occurrences of `--color-primary` / `--color-success-text` (direct
or via Tailwind arbitrary-value utility classes) across ~50 files. Because this is a
**token-level** fix — every one of those occurrences reads the CSS custom property at paint
time rather than a hardcoded value — no per-component edits were required. The sweep
consisted of:

1. `grep -rn "oklch(55% 0.18 250)|oklch(50% 0.15 150)"` across `src/**/*.{ts,tsx,css}` —
   **2 hits, both in `src/index.css` itself** (`--color-accent-hover` L14 dark-mode and
   `--color-accent` L63 light-mode), neither of which is `--color-primary` or
   `--color-success-text` and both of which are correctly untouched (design.md: only
   `--color-primary`/`--color-success-text` change; `--color-accent` stays `55%` so it
   diverges from `--color-primary` by design — see "side effect to watch" below). **Zero**
   hardcoded old-value literals found outside `src/index.css`.
2. `grep -rn "--color-primary:\s*oklch|--color-success-text:\s*oklch"` across `src/**` —
   **1 hit, `src/index.css` only** (the canonical declaration itself). No component locally
   redeclares either custom property, so nothing can locally override or clash with the new
   values.
3. Confirmed `DashboardPreview.tsx` still references these tokens but remains dead code
   (zero importers, unchanged from design.md's finding) — left untouched per explicit scope
   exclusion.

**Side effect noted, not fixed (documented, in scope per design.md):** `--color-primary`
and `--color-accent` were identical (`oklch(55% 0.18 250)`) before this change; they now
diverge by 8 L points in light mode only (`--color-accent` stays at 55%). Anywhere a
primary-colored label sits directly beside an accent-filled button, a subtle blue-shade
mismatch is now visible. This divergence is the deliberate, documented outcome of design.md's
U4 decision (rejecting the alternative of lightening `--color-accent-subtle` instead,
which would have had a wider blast radius across dozens of chips/icon tiles) — flagged here
for the visual QA pass in `sdd-verify`, not treated as a bug to fix in this apply.

## Tests

`tests/unit/lightModeContrast.tokens.test.ts` (new, Strict TDD — genuine RED→GREEN):
reuses the same OKLCH→linear-sRGB→WCAG-luminance math already established in
`tests/unit/accentTokens.contrast.test.ts` (duplicated locally; no shared test-utils module
exists yet) to parse `src/index.css`'s `.light`/`:root` blocks and assert:
- exact authored OKLCH values for both changed tokens,
- worst-case-background contrast ratios clear AA (>=4.5:1) for both tokens,
- `--color-primary` also clears AA on `--color-bg`/`--color-bg-alt`/`--color-surface`,
- the primary/accent-hover pair keeps a perceptible (>=0.019 L) delta,
- `--color-error-text` and both dark-mode `:root` tokens are byte-identical to before.

Initial RED run (against the pre-change CSS) failed 5/9 assertions as expected (measured
3.62:1 / 4.17:1 / 4.22:1 against the 4.5:1 floor). After the two-line CSS edit, GREEN: 9/9.
One test-authoring bug found and fixed during GREEN — the hover-delta assertion used an
exact `0.02` floating-point threshold, which failed on `0.47 - 0.45 = 0.019999999999999962`
(binary floating-point representation, not a logic error); relaxed to `0.019` since the
intent is "perceptible, not exactly 2 points."

## Verification

- `npx jest --config=jest.config.js`: 77/77 suites, 973/973 tests passing (up from 76/964
  after PR B: +1 suite, +9 tests, zero regressions).
- `npx tsc --noEmit`: clean.
- `npm run lint`: clean, 0 warnings.
- `npm run build` intentionally **not** run per the project's standing rule.
