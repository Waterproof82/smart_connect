# Structured Data Enhancement — Audit Log

**Date**: 2026-05-16
**Type**: SEO / Feature
**Scope**: JSON-LD structured data schemas for Tap Review page and shared components

---

## Summary

Integrated three additional JSON-LD schema types (HowTo, CollectionPage, FAQPage) into the Tap Review landing page and shared components to improve search engine visibility and rich result eligibility. All schemas are i18n-compliant (Spanish/English), SSR-compatible, and use DOMPurify for XSS sanitization.

## Schemas Integrated

### 1. FAQPage Schema

- **Component**: `src/features/tap-review/presentation/components/FAQ.tsx`
- **Schema**: `SeoFaqSchema` — renders FAQPage with mainEntity questions/answers
- **i18n**: Dynamic via LanguageContext

### 2. CollectionPage Schema

- **Component**: `src/shared/presentation/components/TestimonialCarousel/index.tsx`
- **Schema**: `CollectionPageSchema` — renders CollectionPage with itemListElement for testimonials
- **i18n**: Dynamic via LanguageContext

### 3. HowTo Schema

- **Component**: `src/features/tap-review/presentation/components/HowItWorks.tsx`
- **Schema**: `HowToSchema` — renders HowTo with step array (name, text, image)
- **i18n**: Dynamic via LanguageContext

## Schema Components Added

- `src/shared/presentation/components/SeoSchema.tsx`:
  - `HowToSchema` — accepts title, description, steps array with optional image/video
  - `CollectionPageSchema` — accepts title, description, items array with optional image/url

## Validations

| Check                       | Result                             |
| --------------------------- | ---------------------------------- |
| TypeScript (`tsc --noEmit`) | ✅ 0 errors                        |
| Build (`vite build`)        | ✅ Success                         |
| Tests (`jest`)              | ✅ 132/132 passing                 |
| Lint (`eslint`)             | ✅ 0 warnings                      |
| i18n compliance             | ✅ No hardcoded strings            |
| XSS sanitization            | ✅ DOMPurify on user content       |
| SSR compatibility           | ✅ Schemas render in both contexts |

## Files Modified

- `src/features/tap-review/presentation/components/FAQ.tsx` — SeoFaqSchema integration
- `src/features/tap-review/presentation/components/HowItWorks.tsx` — HowToSchema integration + structural cleanup
- `src/shared/presentation/components/TestimonialCarousel/index.tsx` — CollectionPageSchema integration
- `src/shared/presentation/components/SeoSchema.tsx` — Added HowToSchema and CollectionPageSchema components
- `CHANGELOG.md` — Updated [Unreleased] section
