# Audit Log — Tap-Review Hardcoded Palette Colors

**Date:** 2026-08-19
**Components:** `Features.tsx`, `HowItWorks.tsx`, `ProductGallery.tsx` (`src/features/tap-review/presentation/components/`)
**Type:** Refactor / consistency fix (Changed)

## Summary

Item 5 from the sitewide theme audit (`sdd/sitewide-theme/explore`, Engram): 3 files in the
tap-review feature used literal Tailwind palette classes instead of this project's design-token
system. Single-file-scope-per-issue, purely mechanical substitutions — implemented directly per
the SDD Enforcement Threshold ("1-3 archivos, cambio puramente mecánico → inline permitido"), no
full SDD pipeline needed.

## Changes

- **`Features.tsx`**: the 4 feature-icon badges built their background/text color from a local
  `colorClasses` map (`bg-blue-500/10 text-blue-500`, `amber`, `green`, `purple` — raw Tailwind
  palette, not a token). Replaced with the existing `accentStyle()` / `.tpv-accent-chip` idiom
  (`src/shared/config/accents.ts`, already used by `FichajesControlHorarioSection.tsx`): each
  feature now carries an `AccentToken` (`--color-icon-blue/amber/green/purple`), applied via
  `style={accentStyle(feature.accent)}` + `className="tpv-accent-chip text-[color:var(--tpv-accent)]"`.
  Same visual intent (colored icon in a tinted circular badge), now theme-correct and consistent
  with the rest of the site's icon-accent system instead of a one-off local map.
- **`HowItWorks.tsx`** and **`ProductGallery.tsx`**: both used
  `bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900` for their
  image-placeholder backdrop. This relies on Tailwind's `dark:` variant (`darkMode: 'class'`,
  toggled via `document.documentElement.classList` in `ThemeContext.tsx`) — a second, parallel
  theming mechanism that happens to still work here, but is disconnected from the `:root`/`.light`
  CSS custom-property system every other themed surface in the app uses. Swapped to
  `from-[var(--color-bg-alt)] to-[var(--color-surface)]`, which self-adapts through the same
  tokens as everything else, with no dependency on the `dark` class being present.

## Verification

- `npx tsc --noEmit` — 0 errors.
- `npm run lint` — 0 warnings.
- `npx vitest run` — 69/72 (same 3 pre-existing, unrelated failures present all session:
  `TestimonialCarousel.test.tsx` ×1, `HomeFaqSection.test.tsx` ×2).
- `npm run test -- --silent` (Jest) — 926/926, 0 regressions.
- No dedicated test file added — pure token/className substitution with no new behavior,
  consistent with how `AboutPage.tsx`'s and `CartaDigitalCTAFinalSection.tsx`'s token fixes were
  handled earlier in this same audit trail.

## Follow-ups (not done here, per the sitewide audit's prioritized list)

- Emoji-as-icon convention across 6 `CartaDigital*` files — separate, larger initiative, not yet
  scoped.
