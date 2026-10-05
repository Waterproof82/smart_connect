import { CARTA_DIGITAL_REVIEWS } from "@features/landing/data/cartaDigitalReviews";

/**
 * Real, verbatim QR iBar reviews shown on the home Carta Digital block
 * (seo-trust-claims-cleanup, PR2a — trust-claims spec: "Real Reviews Are
 * Attributed and Truncated"). Quotes are fixed evidence, not translatable
 * UI copy (design.md D5) — exactly 2, both truncated with a trailing "…",
 * never completed.
 */
describe("CARTA_DIGITAL_REVIEWS", () => {
  it("has exactly 2 reviews", () => {
    expect(CARTA_DIGITAL_REVIEWS).toHaveLength(2);
  });

  it("is attributed to Carlos S. and Luis M.", () => {
    const authors = CARTA_DIGITAL_REVIEWS.map((review) => review.author);
    expect(authors).toEqual(["Carlos S.", "Luis M."]);
  });

  it("every quote is truncated with a trailing ellipsis", () => {
    for (const review of CARTA_DIGITAL_REVIEWS) {
      expect(review.quote.endsWith("…")).toBe(true);
    }
  });

  it("every review is 5-star and dated 2022", () => {
    for (const review of CARTA_DIGITAL_REVIEWS) {
      expect(review.rating).toBe(5);
      expect(review.year).toBe(2022);
    }
  });

  it("every review is tagged lang 'es' (quotes stay untranslated, D5)", () => {
    for (const review of CARTA_DIGITAL_REVIEWS) {
      expect(review.lang).toBe("es");
    }
  });

  it("carries the exact verbatim quotes (never completed beyond the source)", () => {
    expect(CARTA_DIGITAL_REVIEWS[0].quote).toBe(
      "Está muy bien la aplicación, muy intuitiva y es más cómodo a la hora de pedir e incluso de pagar…",
    );
    expect(CARTA_DIGITAL_REVIEWS[1].quote).toBe(
      "El mejor método para pedir y ser atendido que he encontrado. Muy efectivo, cómodo y visual…",
    );
  });
});
