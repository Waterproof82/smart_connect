# Audit Log — Button/CTA System Unification

**Date:** 2026-08-19
**Change:** SDD `button-system-unification`
**Type:** Refactor + a11y fix (Changed / Fixed)

## Summary

Follow-up from the sitewide theme audit (`sdd/sitewide-theme/explore`, Engram) that flagged 4
visually different "primary CTA" button shapes for the same semantic role across the public
site, plus a handful of missing `type="button"` attributes and a nameless icon-only toggle
button. Ran the full SDD pipeline (explore → propose → spec → design → tasks → apply → verify →
archive) per this project's own SDD Enforcement Threshold (4+ files, cross-cutting change).

## Process

Estimated ~566 changed lines across the full scope — over the 400-line single-PR review
budget — so the Review Workload Guard triggered and the user chose **3 chained PRs**:

- **PR1 — Foundation**: `.btn-primary`/`.btn-secondary`/`.btn-primary-inverse` added to
  `src/index.css` (`@layer components`, geometry/color only — callsite keeps layout/typography
  utilities). `Hero.tsx`'s two CTAs and `Contact.tsx`'s submit button swapped to consume them;
  `Contact.tsx`'s `getSubmitButtonClass()` branch function deleted (its `canSubmit` condition is
  identical to the `disabled` attribute's, so `.btn-primary:disabled` covers it 1:1).
- **PR2 — Carta Digital**: `CartaDigitalHeroSection.tsx` and `CartaDigitalCTAFinalSection.tsx`
  swapped to `.btn-primary`/`.btn-secondary`, `type="button"` added to both buttons.
- **PR3 — Tap-review + chatbot + orphans + a11y** (this batch): completed after PR1/PR2's
  `sdd-apply` sub-agent hit an account-level spend-limit API error mid-run for PR3 — verified via
  `git status`/`git diff --stat` that the interrupted run had written zero files (clean PR1+PR2
  state only), then implemented PR3 directly under Strict TDD rather than retrying delegation.

## PR3 changes

| File | Change |
|---|---|
| `tap-review/TapReviewSection.tsx` | Hero CTA `<a>`s → `.btn-primary` / `.btn-secondary` |
| `tap-review/components/CTASection.tsx` | CTA `<a>` → `.btn-primary-inverse` (white-on-accent fill, not `.btn-primary`) |
| `landing/components/NotFound.tsx` | 404 CTA `<Link>` → `.btn-primary` (a proposal miss — the design phase found this had no focus-visible ring at all) |
| `chatbot/components/ChatToggleButton.tsx` | Toggle `<button>`: added `type="button"` + `aria-label="Asistente Experto"` (matches visible label, WCAG 2.5.3-safe); both toggle button and WhatsApp `<a>`: `focus:` → `focus-visible:` |
| `chatbot/components/ChatInput.tsx` | Send `<button>` only: added `type="button"`, `focus:` → `focus-visible:`. The `<input>` was deliberately left untouched — `:focus-visible` on a text field would regress pointer-focus visibility |
| `tap-review/components/ProductGallery.tsx` | Thumbnail `<button>`s: added `type="button"` |

No class-swap on the chatbot/gallery buttons — those are icon/pill chrome, not CTAs, so they
only needed the `type`/`aria-label`/`focus-visible` fixes, not `.btn-primary`.

## Explicitly out of scope (verified zero diff)

- `CookieBanner.tsx` — shared `BUTTON_CLASS` is an AEPD art. 22.2 requirement (Accept/Reject
  must be equally prominent); its `rounded-lg`/banner-scale sizing is deliberate, `.btn-primary`
  would force the wrong height.
- `src/features/admin/**` — admin surface, not the public CTA system.
- `App.tsx`, `Navbar.tsx`, `ChatWelcome.tsx` — deliberate deferrals per the design doc (not CTAs
  in the same semantic role, or already tracked separately).

Confirmed via `git diff --stat -- CookieBanner.tsx src/features/admin/` returning empty before
committing.

## Testing (Strict TDD)

Six new colocated test files (`__tests__/`), each written RED-first against the pre-change
source, then GREEN after the implementation:

- `TapReviewSection.test.tsx`, `tap-review/components/__tests__/CTASection.test.tsx`,
  `NotFound.test.tsx`, `ChatToggleButton.test.tsx`, `ChatInput.test.tsx`,
  `ProductGallery.test.tsx`.

Assertions follow the same pattern as PR1/PR2: class presence (`toHaveClass`), stale-utility
absence (`className` regex `not.toMatch`), explicit `type` attribute, accessible name /
`aria-label`, and (for `ChatInput`) confirming the `<input>`'s `focus:` classes are unchanged.
One test-only gotcha: `TapReviewSection.test.tsx` needed `getAllByRole(...)[0]` for its
"Contactar ahora" hero CTA, since `CTASection` (rendered as a child further down the same page)
has a CTA with the identical accessible name.

## Verification

- `npx tsc --noEmit` — 0 errors.
- `npm run lint` (`--max-warnings 0`) — 0 warnings.
- `npx vitest run` — 69/72 passing; the 3 failures are the same pre-existing, unrelated failures
  present all session (`TestimonialCarousel.test.tsx` ×1, `HomeFaqSection.test.tsx` ×2) — not
  introduced or fixed by this change.
- `npm run test -- --silent` (Jest) — 926/926 passing, 0 regressions.
- `git diff --stat -- CookieBanner.tsx src/features/admin/` — empty, confirming the DO-NOT-TOUCH
  boundary held.

## Follow-ups (not done here, per the sitewide audit's prioritized list)

- Hardcoded palette colors in `tap-review/Features.tsx`, `ProductGallery.tsx`, `HowItWorks.tsx`.
- Emoji-as-icon convention across 6 `CartaDigital*` files (separate, larger initiative).
- `tap-review/CTASection.tsx:21`'s gradient (`from-[var(--color-accent)] to-[var(--color-primary)]`)
  is a no-op since both stops are byte-identical — worth a standalone cleanup, out of scope here.
