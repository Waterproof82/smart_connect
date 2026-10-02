/**
 * Real, verbatim QR iBar reviews (seo-trust-claims-cleanup, design.md D5).
 *
 * These are fixed evidence, not translatable UI copy: copying each quote
 * into `es` and `en` in LanguageContext would risk drift or a translator
 * "fixing" the quote into something that was never actually said. Both
 * quotes render inside `<blockquote lang="es">` regardless of the active
 * UI language (follows the `seo-nap-eeat-fixes` D1 precedent used for
 * `organization.ts`).
 *
 * Framing (eyebrow/title/source label/rating label) lives in
 * LanguageContext (es+en) — see `cartaReviews*` keys.
 */
export interface CustomerReview {
  /** Abbreviated per the source review (never a full surname). */
  readonly author: string;
  /** Verbatim, truncated. MUST end with "…" — never completed. */
  readonly quote: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly year: number;
  /** Quotes are never translated; always rendered with lang="es". */
  readonly lang: "es";
}

export const CARTA_DIGITAL_REVIEWS: readonly CustomerReview[] = [
  {
    author: "Carlos S.",
    quote:
      "Está muy bien la aplicación, muy intuitiva y es más cómodo a la hora de pedir e incluso de pagar…",
    rating: 5,
    year: 2022,
    lang: "es",
  },
  {
    author: "Luis M.",
    quote:
      "El mejor método para pedir y ser atendido que he encontrado. Muy efectivo, cómodo y visual…",
    rating: 5,
    year: 2022,
    lang: "es",
  },
];
