# Audit Log — AboutPage.tsx Design-Token Fix

**Date:** 2026-08-18
**Component:** `src/features/landing/presentation/components/AboutPage.tsx`
**Type:** Refactor / consistency fix (Changed)

## Summary

Follow-up from the sitewide theme audit (`sdd/sitewide-theme/explore`, Engram) that flagged
`AboutPage.tsx` as the highest-impact remaining issue: entirely off the design-token system,
forced-dark with no light-mode support, and duplicating its own nav instead of reusing the
shared `Navbar`.

## Process

Ran a scoped `sdd-explore` first (`sdd/about-page-theme-fix/explore`, Engram) to confirm the
real fix boundary before touching anything. It found this is a genuine single-file, mechanical
change — `Navbar` reuse is already proven on two other SSR-prerendered routes (`/tarjetas-nfc`,
`/legal/*`), and there is no shared `Footer` component anywhere in the codebase to reuse (each
route's footer content differs intentionally; `AboutPage`'s local footer just needed
tokenizing, not extracting). Per this project's own SDD Enforcement Threshold
("1-3 archivos, cambio puramente mecánico → inline permitido"), implemented directly instead
of running the full propose/spec/design/tasks pipeline.

## Changes

- `min-h-screen bg-base text-white` → `min-h-screen bg-base text-default` (theme-aware).
- Removed the hand-rolled logo-only `<nav>`, replaced with `<Navbar scrolled={true} />` (same
  usage as `LegalPage.tsx`).
- Hero gradient: `from-blue-600/20 via-blue-900/10 to-base` → `from-[var(--color-primary)]/20
  via-[var(--color-primary)]/8 to-transparent`.
- Headline gradient: `from-blue-400 to-purple-400` → `from-[var(--color-icon-blue)]
  to-[var(--color-icon-purple)]`.
- All `text-white/NN` → `text-muted` (or `text-default` where full contrast was intended).
- Values section: `bg-white/5` → `bg-base-alt`; cards `bg-white/5 backdrop-blur-sm border
  border-white/10` → `bg-[var(--color-surface)] border-subtle` (surface token is already
  theme-correct, backdrop-blur no longer needed); card titles `text-blue-300` →
  `text-[var(--color-primary)]`.
- Contact icon circles: `bg-blue-500/10 border-blue-500/30` + `text-blue-400` →
  `bg-[var(--color-accent-subtle)] border-[var(--color-accent-border)]` +
  `text-[var(--color-primary)]` — same idiom already used by `Hero.tsx`'s eyebrow badge.
- Footer: `border-t border-white/10 text-white/40` → `bg-[var(--color-bg-alt)] border-t
  border-[var(--color-border)]` + `text-muted`, matching `TapReviewPage.tsx`'s footer pattern.
- Footer/contact links: `text-blue-400 hover:text-blue-300` →
  `text-[var(--color-primary)] hover:text-[var(--color-accent-hover)]` (or inherited `text-muted`
  with a primary hover for the footer nav links).
- **Bug fix**: `className="text-white-60"` (line 223, invalid Tailwind class — missing `/`,
  silently did nothing) → `text-muted`.
- Removed the now-unused `Cpu` icon import (was only used by the deleted mini-nav).
- `AboutPage`/`Organization` JSON-LD block left untouched (verified — real NAP data, previously
  fixed for a SEO audit, must stay in sync with `Contact.tsx`/`SeoSchema.tsx`).

## Verification

- `npm run lint` — 0 warnings.
- `npx tsc --noEmit` — 0 errors.
- `npm run test -- --silent` (Jest) — 70/70 suites, 926/926 tests, 0 regressions.
- `npx vitest run` — 9/9 files ran, 39/42 tests passing; the 3 failures are pre-existing,
  unrelated (`TestimonialCarousel.test.tsx`, `HomeFaqSection.test.tsx` ×2), not introduced or
  fixed by this change.
- No dedicated test file added — this is a token/className refactor with no new behavior
  (consistent with how `Contact.tsx`'s and `CartaDigitalCTAFinalSection.tsx`'s token fixes were
  handled in the preceding `landing-illustrative-redesign` change).

## Follow-ups (not done here, per the sitewide audit's prioritized list)

- Unify the 4 different "primary CTA" button shapes across the site (needs its own `/sdd-new`).
- Missing `type="button"` on 5 buttons across the site.
- `ChatToggleButton.tsx` missing `aria-label`.
- Hardcoded palette colors in `tap-review/Features.tsx`, `ProductGallery.tsx`, `HowItWorks.tsx`.
- Emoji-as-icon convention across 6 `CartaDigital*` files (separate, larger initiative).
