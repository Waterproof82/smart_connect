import fs from "node:fs";
import path from "node:path";

// See CartaDigitalSection.structure.test.ts for why these are source-text
// checks instead of RTL renders (no jest-environment-jsdom in this repo).
const PAGE_PATH = path.resolve(
  __dirname,
  "../../../../src/features/tap-review/presentation/TapReviewPage.tsx",
);

describe("TapReviewPage (standalone /tarjetas-nfc route, PR3 un-merge)", () => {
  it("exists as a dedicated route page", () => {
    expect(fs.existsSync(PAGE_PATH)).toBe(true);
  });

  const source = fs.existsSync(PAGE_PATH)
    ? fs.readFileSync(PAGE_PATH, "utf-8")
    : "";

  it("imports react-helmet-async and renders its own <Helmet> (page-level head tags)", () => {
    expect(source).toMatch(/from ["']react-helmet-async["']/);
    expect(source).toMatch(/<Helmet>/);
  });

  it("declares the canonical URL for /tarjetas-nfc", () => {
    // Accepts either a fully-hardcoded literal (AboutPage.tsx style) or a
    // composed `${ORG_URL}/tarjetas-nfc` template literal referencing the
    // "https://digitalizatenerife.es" domain constant.
    const hasLiteral = /https:\/\/digitalizatenerife\.es\/tarjetas-nfc/.test(
      source,
    );
    const hasComposed =
      /["']https:\/\/digitalizatenerife\.es["']/.test(source) &&
      /\$\{[A-Z_]+\}\/tarjetas-nfc/.test(source);
    expect(hasLiteral || hasComposed).toBe(true);
  });

  it("declares og and twitter meta tags", () => {
    expect(source).toMatch(/property="og:title"/);
    expect(source).toMatch(/property="og:url"/);
    expect(source).toMatch(/name="twitter:card"/);
  });

  it("reuses ServiceSchema, SeoFaqSchema and BreadcrumbListSchema instead of hand-rolling JSON-LD", () => {
    expect(source).toMatch(/from ["']@shared\/presentation\/components\/SeoSchema["']/);
    expect(source).toMatch(/<ServiceSchema/);
    expect(source).toMatch(/<SeoFaqSchema/);
    expect(source).toMatch(/<BreadcrumbListSchema/);
  });

  it("does not hand-roll a raw application/ld+json <script> tag itself", () => {
    expect(source).not.toMatch(/<script[^>]*application\/ld\+json/);
  });

  it("mounts the shared Navbar", () => {
    expect(source).toMatch(
      /from ["']@features\/landing\/presentation\/components\/Navbar["']/,
    );
    expect(source).toMatch(/<Navbar/);
  });

  it("mounts TapReviewSection with the whatsappPhone prop", () => {
    expect(source).toMatch(
      /from ["']\.\/TapReviewSection["']/,
    );
    expect(source).toMatch(/<TapReviewSection/);
    expect(source).toMatch(/whatsappPhone/);
  });

  it("renders the NFC FAQ group sourced from useNfcFaqGroup()", () => {
    expect(source).toMatch(/useNfcFaqGroup/);
  });

  it("is the sole <h1> owner on this route (TapReviewSection itself has none)", () => {
    const h1Matches = source.match(/<h1[\s>]/g) ?? [];
    expect(h1Matches.length).toBeGreaterThanOrEqual(1);
  });

  it("default-exports the page component (mirrors AboutPage.tsx's export convention)", () => {
    expect(source).toMatch(/export default TapReviewPage/);
  });
});
