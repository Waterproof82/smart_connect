# Audit Log — Landing Illustrative Redesign (SDD `landing-illustrative-redesign`)

**Date:** 2026-08-18
**Components:**

- `src/shared/presentation/components/DotField/index.tsx` (new)
- `src/shared/presentation/components/DotField/DotField.test.tsx` (new)
- `src/features/landing/presentation/components/Hero.tsx`
- `src/features/landing/presentation/components/CartaDigitalHeroSection.tsx`
- `src/features/landing/presentation/components/__tests__/CartaDigitalHeroSection.test.tsx` (new)
- `src/features/landing/presentation/components/Contact.tsx`
- `src/features/landing/presentation/components/CartaDigitalCTAFinalSection.tsx`

**Type:** Refactor + visual consistency fix (Changed)
**SDD change:** `landing-illustrative-redesign` — planned via `/sdd-new`, delivered as 2 chained PRs per the tasks phase's Review Workload Forecast (`ask-on-risk`, user-approved).

## Summary

Codified the flat, thick-outline, token-only, static-SVG illustration convention
introduced in `Hero.tsx` (see `2026-08-18_hero-illustrative-redesign.md`) into a
shared, reusable primitive, then closed the 3 remaining inconsistencies elsewhere
on the landing page that still used the older glassmorphism/glow-blob/noise-texture
visual language.

## Process (Strict TDD active)

1. **Spec + design** were produced via SDD phases (`sdd-spec`, `sdd-design`) before
   any implementation — see engram topics `sdd/landing-illustrative-redesign/spec`
   and `sdd/landing-illustrative-redesign/design`.
2. **PR#1** (this apply batch's predecessor): wrote `DotField.test.tsx` RED first,
   implemented `DotField/index.tsx` to GREEN, then refactored `Hero.tsx` to consume
   it with zero prop overrides beyond `className` (pixel-parity requirement).
3. **PR#2** (this batch): wrote `CartaDigitalHeroSection.test.tsx` RED first
   (asserting title, both CTAs, all 4 stat labels, the horizon band's presence,
   exactly 4 `.animate-float-fancy` motif groups, and zero focusable nodes inside
   the band), then implemented the band to GREEN. `Contact.tsx` and
   `CartaDigitalCTAFinalSection.tsx` changes were mechanical (no new tests needed —
   existing coverage for those components was unaffected).

## Changes

### `DotField` primitive (PR#1)

- New presentational component: `{ mask?, dotSize=1.4, spacing=16, color="var(--color-border)", className? }`.
- Renders a single `aria-hidden="true"` `<div>` with `pointer-events-none`, inline
  `style` for `backgroundImage`/`backgroundSize`/`maskImage`/`WebkitMaskImage`
  (mask must be inline — Tailwind JIT cannot see runtime prop strings).
- No default positioning classes (project has no `tailwind-merge`; a default
  `absolute inset-0` would collide unresolvably with call-site positioning).
- Default mask/dot-size/spacing/color reproduce Hero's prior inline literals
  exactly — `Hero.tsx`'s swap is a pure substitution with zero pixel diff.

### `Hero.tsx` (PR#1)

- Replaced the inline dot-field `<div>` with
  `<DotField className="absolute -inset-[8%] rounded-full" />`.

### `CartaDigitalHeroSection.tsx` (PR#2)

- Removed the `radial-gradient(...)`/`radial-gradient(...)`/`var(--color-bg)`
  inline background style, replaced with the `bg-[var(--color-bg)]` class.
- Removed the `feTurbulence` noise-texture data-URI div entirely.
- Added a `<DotField>` backdrop (`className="absolute inset-x-0 bottom-0 h-1/2"`,
  elliptical bottom mask) as the section's first child.
- Added a full-width "counter horizon band" SVG
  (`data-testid="carta-hero-band"`, `viewBox="0 0 960 220"`) as a sibling after
  the existing `.text-center.max-w-4xl` content block, below the 4 stat badges:
  - Base: a `--color-surface`/`--color-border` counter rect + a `--color-accent`
    accent strip.
  - 4 motif groups (`x≈120/360/600/840`), each wrapped in
    `<g className="animate-float-fancy" style={{ animationDelay }}>` reusing
    Hero's stagger (`0s / -1.2s / -2.1s / -3s`), mapped 1:1 to the real stats
    confirmed in `LanguageContext.tsx:700-703`/`1321-1324`
    (`Idiomas`/`Comisiones`/`Pedidos online`/`Clientes` — **not** the earlier
    proposal draft's incorrect "platos/dishes" guess):
    - `5` → Idiomas: globe (lat/long strokes) + 3 stacked language chips.
    - `0%` → Comisiones: coin circle with a `--color-icon-amber` diagonal
      strike-through.
    - `24/7` → Pedidos online: clock face (2 hands) overlapped by a
      notification card.
    - `∞` → Clientes: 3 customer figures (head circle + shoulder arc), the
      third positioned near the right edge of the `viewBox` so it's visually
      clipped by the SVG boundary.
  - No `<text>` nodes anywhere in the band — no new i18n keys required.
  - Wrapper: `hidden sm:block [@media(max-height:500px)]:hidden`, `svg`
    capped at `max-h-[180px] lg:max-h-[220px]` — guarantees the section's
    `min-h-screen` content (eyebrow → title → subtitle → CTAs → stats) never
    gets pushed off short/landscape viewports.
  - Band is `aria-hidden="true"`, `focusable="false"`, contains zero
    focusable descendants (verified by test).

### `Contact.tsx` (PR#2)

- Replaced the leftover
  `bg-[var(--color-accent)]/10 rounded-full` glow-blob `<div>` (200×200px) with
  `<DotField className="absolute top-1/2 left-0 w-[240px] h-[240px] -translate-y-1/2 -ml-16" mask="radial-gradient(circle at 50% 50%, black 45%, transparent 75%)" />`.
  240px (vs. the blob's 200px) compensates for the mask fading from 45%,
  preserving the original visual footprint.

### `CartaDigitalCTAFinalSection.tsx` (PR#2)

- Replaced the hardcoded `rgba(201,168,76,0.12)` background literal with
  `color-mix(in oklch, var(--color-primary) 10%, transparent)` — user
  explicitly approved brand-indigo over the prior one-off gold value during
  the design phase's open question (D4).

## Scope closure

Per spec's "Out-of-scope files remain untouched" requirement, the diff is
limited to the files listed above plus `CHANGELOG.md` and this audit log.
`CartaDigitalSolucionSection`, `CartaDigitalDemoSection`,
`CartaDigitalComparacionSection`, `SuccessStats`, `CartaDigitalDineroSection`,
`CartaDigitalProblemaSection`, `CartaDigitalComoFuncionaSection`, the
emoji-icon components, `CartaDigitalBBDDSection`, section ordering,
`src/index.css`, and `package.json` show zero diff in this change.

## Verification

- `npx vitest run` (actual runner for colocated `.test.tsx` files under `src/` —
  Jest's `testMatch` only covers `tests/**/*.test.ts`, confirmed as a pre-existing
  split, not something this change caused): 9 files / 42 tests — 39 passed, 3
  pre-existing failures unchanged (`TestimonialCarousel` × 1, `HomeFaqSection` × 2,
  both unrelated to this change) — **DotField 4/4, CartaDigitalHeroSection 5/5,
  all new tests passing.**
- `npm run test -- --silent` (Jest): 70 suites / 926 tests — unchanged, 0
  regressions.
- `npm run lint`: 0 warnings.
- `npx tsc --noEmit`: 0 errors.
- Not built per project rule (never build after changes).

## Known housekeeping item (not blocking, flagged separately)

The repo runs two separate test runners: Jest (`npm run test`, `tests/**/*.test.ts`)
and Vitest (`npm run test:vitest`, colocated `src/**/*.test.tsx`). Colocated
component tests (like `DotField.test.tsx` and `CartaDigitalHeroSection.test.tsx`)
silently do not run under `npm run test` — only under `npm run test:vitest` /
`npx vitest run`. Both runners must be checked for any future landing-component
change; this was not introduced by this change but is worth the team knowing.
