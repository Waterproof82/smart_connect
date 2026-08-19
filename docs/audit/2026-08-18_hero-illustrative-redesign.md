# Audit Log — Hero Illustrative Redesign

**Date:** 2026-08-18
**Component:** `src/features/landing/presentation/components/Hero.tsx`
**Type:** Visual design change (Changed)

## Summary

Replaced the landing hero's glassmorphism/glow-blob visual with a flat, illustrative
scene grounded in the actual product (QR menu, NFC review card, AI chatbot), following
the `frontend-design` and `artifact-design` skill guidance against generic "AI slop"
patterns (glow blur blobs, glass floating cards, cyan/purple gradients on dark).

## Process

1. Mocked up the new direction as a standalone Artifact
   (`landing-illustrative-concept.html`) using the project's real brand tokens
   (`oklch(65% 0.18 250)` primary, Space Grotesk/DM Sans) and real `es` copy pulled
   from `LanguageContext.tsx`, before touching any production code.
2. User reviewed and approved the direction ("si continua").
3. Implemented in `Hero.tsx` reusing only existing design-system tokens from
   `src/index.css` (`--color-accent`, `--color-surface`, `--color-border`,
   `--color-icon-amber`, etc.) and the existing `.animate-float-fancy` /
   `.reveal-1` motion utilities — no new CSS tokens, no new dependencies.

## Changes

- Removed: full-hero `blur-[150px]` glow blob div.
- Removed: glass card with `glow-blue`, `shimmer`, backdrop-blur floating badges
  (used `t.nfcActive`, `t.brandName`, `t.enterpriseAINode`, `t.aiCore`, `t.processing`,
  `t.uplinkStable` — those translation keys stay defined in `LanguageContext.tsx` but
  are no longer referenced from `Hero.tsx`).
- Added: inline SVG illustration (bar counter, QR tent card, order phone, NFC tap
  card, chatbot bubble) with a static ticket-paper dot-field backdrop, using
  `color-mix`-free existing CSS variables so it inherits light/dark theming for free.
- Removed unused imports: `CheckCircle2`, `Sparkles`, `Volume2` from `lucide-react`.
- Left column (eyebrow, `<h1>`, subtitle, CTAs) left untouched — same copy, same
  brand tokens, same reveal stagger.

## Verification

- `npm run lint` — 0 errors, 0 warnings.
- `npm run type-check` — clean.
- `npm run test` — 70/70 suites, 926/926 tests passing (no Hero-specific test
  existed; no other suite referenced the removed translation keys).
- Not built per project rule (never build after changes).

## Follow-ups (not done here)

- Rest of the landing page (`SuccessStats`, `CartaDigital*` sections, `Contact`)
  still uses the older glow/glass visual language — out of scope for this change,
  flagged for a future pass if the new direction should extend past the hero.
