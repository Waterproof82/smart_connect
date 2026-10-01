import fs from "node:fs";
import path from "node:path";

// Internal-linking map (docs/SEO_PROTOCOL.md §3): every product page links
// the other product pages (RelatedServices) and every page carries the
// site-wide footer that links all product, company and legal pages.
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

const PRODUCT_PAGES: Array<[string, string]> = [
  ["features/landing/presentation/components/CartaDigitalPage.tsx", "carta-digital"],
  ["features/tap-review/presentation/TapReviewPage.tsx", "tarjetas-nfc"],
  ["features/landing/presentation/components/IaChatbotsPage.tsx", "ia-chatbots"],
  ["features/landing/presentation/components/TpvRestaurantesPage.tsx", "tpv-restaurantes"],
];

const ALL_PAGES = [
  "App.tsx",
  "features/landing/presentation/components/AboutPage.tsx",
  "features/legal/presentation/LegalPage.tsx",
  ...PRODUCT_PAGES.map(([file]) => file),
];

describe("internal linking", () => {
  it.each(PRODUCT_PAGES)("%s renders RelatedServices excluding itself", (file, id) => {
    expect(read(file)).toMatch(new RegExp(`<RelatedServices currentId="${id}" />`));
  });

  it.each(ALL_PAGES)("%s renders the shared PageShell (site-wide footer)", (file) => {
    const source = read(file);
    expect(source).toMatch(/<PageShell[\s>]/);
    expect(source).not.toMatch(/<footer[\s>]/);
  });

  it("PageShell renders the shared SiteFooter on every page", () => {
    const shell = read("features/landing/presentation/components/PageShell.tsx");
    expect(shell).toMatch(/<SiteFooter \/>/);
    expect(shell).not.toMatch(/<footer[\s>]/);
  });

  it("SiteFooter links every SOLUTIONS page, /about and the three legal pages", () => {
    const footer = read("shared/components/SiteFooter.tsx");
    expect(footer).toMatch(/SOLUTIONS\.map/);
    for (const href of ["/about", "/legal/aviso", "/legal/privacidad", "/legal/cookies"]) {
      expect(footer).toMatch(new RegExp(`to="${href}"`));
    }
  });
});

// Hreflang: intentionally absent site-wide until URLs are language-addressable
// (App.tsx SEO checklist, change `i18n-url-routing`). One page declaring it
// while the rest do not is the inconsistency this guards against.
describe("hreflang consistency", () => {
  it.each(ALL_PAGES)("%s declares no hrefLang alternate", (file) => {
    expect(read(file)).not.toMatch(/hrefLang/);
  });
});

describe("Open Graph consistency", () => {
  it.each(ALL_PAGES)("%s declares og:locale es_ES and og:site_name", (file) => {
    const source = read(file);
    expect(source).toMatch(/property="og:locale" content="es_ES"/);
    expect(source).toMatch(/property="og:site_name" content="Digitaliza Tenerife"/);
  });
});
