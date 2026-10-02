import fs from "node:fs";
import path from "node:path";

/**
 * CartaDigitalReviews.tsx is a React component (.tsx) and this repo's Jest
 * is `testEnvironment: "node"` with no `jest-environment-jsdom` installed
 * (see tests/unit/shared/ConsentContext.structure.test.ts and
 * tests/unit/features/landing/HomeFaqSection.structure.test.ts for the
 * established convention), so it cannot be rendered behaviorally. We assert
 * on the source text instead: the 2-card structure, the figure/blockquote/
 * figcaption markup, the role="img" star group, the headingId prop, and
 * the absence of any ld+json script (trust-claims spec: no Review JSON-LD).
 */
const SRC = path.resolve(__dirname, "../../../../src");
const COMPONENT_PATH = path.join(
  SRC,
  "features/landing/presentation/components/CartaDigitalReviews.tsx",
);

describe("CartaDigitalReviews (seo-trust-claims-cleanup PR2a, design.md D4/D6/D7)", () => {
  it("exists", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("exports a named CartaDigitalReviews component", () => {
    expect(readSource()).toMatch(
      /export const CartaDigitalReviews:\s*React\.FC/,
    );
  });

  it("accepts an optional headingId prop (D4 — reused later on /carta-digital)", () => {
    expect(readSource()).toMatch(/headingId\?:\s*string/);
  });

  it("maps over CARTA_DIGITAL_REVIEWS from the typed data constant (no inline duplicated quotes)", () => {
    const source = readSource();
    expect(source).toMatch(
      /import\s*\{\s*CARTA_DIGITAL_REVIEWS\s*\}\s*from\s*["']@features\/landing\/data\/cartaDigitalReviews["']/,
    );
    expect(source).toMatch(/CARTA_DIGITAL_REVIEWS\.map\(/);
  });

  it("renders each review as a <figure><blockquote lang=\"es\"/><figcaption/></figure>", () => {
    const source = readSource();
    expect(source).toMatch(/<figure/);
    expect(source).toMatch(/<blockquote[^>]*lang=\{?["']?es/);
    expect(source).toMatch(/<figcaption/);
  });

  it("renders the star rating as an aria-hidden icon group inside a role=\"img\" wrapper with a translated aria-label", () => {
    const source = readSource();
    expect(source).toMatch(/role=["']img["']/);
    expect(source).toMatch(/aria-label=\{`\$\{.*rating.*\}\s*\$\{t\.cartaReviewsRatingOf\}`\}/);
    expect(source).toMatch(/aria-hidden/);
  });

  it("uses the --color-icon-amber token for the star color (no hardcoded color)", () => {
    expect(readSource()).toMatch(/--color-icon-amber/);
  });

  it("imports Star from lucide-react", () => {
    expect(readSource()).toMatch(
      /import\s*\{[^}]*\bStar\b[^}]*\}\s*from\s*["']lucide-react["']/,
    );
  });

  it("never emits an ld+json script (no Review JSON-LD — structured-data-policy)", () => {
    expect(readSource()).not.toMatch(/ld\+json/);
    expect(readSource()).not.toMatch(/ReviewSchema/);
  });

  it("is a static block — no IntersectionObserver / opacity-0 SSR-hiding pattern (D6)", () => {
    const source = readSource();
    expect(source).not.toMatch(/useIntersectionObserver/);
    expect(source).not.toMatch(/opacity-0/);
  });
});

describe("cartaReviewsTitle labels the reviews as diner reviews, not customer reviews (PR2b fix)", () => {
  const LANGUAGE_CONTEXT_PATH = path.join(
    SRC,
    "shared/context/LanguageContext.tsx",
  );
  const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");

  // The 2 QR iBar reviews are from diners who ordered through the app, not
  // from business-owner customers of Digitaliza Tenerife — "clientes"/
  // "customers" conflated the two audiences.
  it('es "cartaReviewsTitle" reads "Lo que dicen los comensales" (not "clientes")', () => {
    expect(source).toMatch(/cartaReviewsTitle:\s*"Lo que dicen los comensales"/);
    expect(source).not.toMatch(
      /cartaReviewsTitle:\s*"Lo que dicen nuestros clientes"/,
    );
  });

  it('en "cartaReviewsTitle" reads "What diners say" (not "our customers")', () => {
    expect(source).toMatch(/cartaReviewsTitle:\s*"What diners say"/);
    expect(source).not.toMatch(
      /cartaReviewsTitle:\s*"What our customers say"/,
    );
  });
});
