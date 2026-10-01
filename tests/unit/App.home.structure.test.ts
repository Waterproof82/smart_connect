import fs from "node:fs";
import path from "node:path";

// See CartaDigitalSection.structure.test.ts for why these are source-text
// checks instead of RTL renders (no jest-environment-jsdom in this repo).
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

describe("Home page composition (App.tsx + merged sections)", () => {
  it("App.tsx renders no literal <h1> outside the ErrorBoundary fallback", () => {
    const appSource = read("App.tsx");
    // The only <h1> allowed in App.tsx belongs to ErrorBoundaryFallback,
    // which replaces the whole tree on error (never co-rendered with Hero).
    const h1Matches = appSource.match(/<h1[\s>]/g) ?? [];
    expect(h1Matches).toHaveLength(1);
    expect(appSource).toMatch(/errorBoundaryTitle/);
  });

  it("Hero.tsx is the sole page-level <h1> owner", () => {
    const heroSource = read("features/landing/presentation/components/Hero.tsx");
    const h1Matches = heroSource.match(/<h1[\s>]/g) ?? [];
    expect(h1Matches).toHaveLength(1);
  });

  it("HomeFaqSection.tsx, Contact.tsx, SuccessStats.tsx, Navbar.tsx declare no <h1>", () => {
    const files = [
      "features/landing/presentation/components/HomeFaqSection.tsx",
      "features/landing/presentation/components/Contact.tsx",
      "features/landing/presentation/components/SuccessStats.tsx",
      "features/landing/presentation/components/Navbar.tsx",
    ];
    for (const file of files) {
      expect(read(file)).not.toMatch(/<h1[\s>]/);
    }
  });

  it("mounts HomeSolutionsSection (hub cards) between #soluciones and #por-que", () => {
    const appSource = read("App.tsx");
    const solucionesIdx = appSource.indexOf('id="soluciones"');
    const hubIdx = appSource.indexOf("<HomeSolutionsSection");
    const porQueIdx = appSource.indexOf('id="por-que"');

    expect(solucionesIdx).toBeGreaterThan(-1);
    expect(hubIdx).toBeGreaterThan(solucionesIdx);
    expect(porQueIdx).toBeGreaterThan(hubIdx);
    // Product content lives on its own URL — never duplicated on home.
    expect(appSource).not.toMatch(/<CartaDigitalSection/);
    expect(appSource).not.toMatch(/TpvModulesSection/);
  });

  it("no longer mounts TapReviewSection on home (PR3: un-merged to /tarjetas-nfc)", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/<TapReviewSection/);
    expect(appSource).not.toMatch(
      /from ["']@features\/tap-review\/presentation\/TapReviewSection["']/,
    );
  });

  it("CartaDigitalSection's wrapper id is prop-ised (PR4: mounted as tienda-carta-digital)", () => {
    const cartaSource = read(
      "features/landing/presentation/components/CartaDigitalSection.tsx",
    );
    expect(cartaSource).toMatch(/id: string/);
    expect(cartaSource).toMatch(/<div id=\{id\}/);
    expect(cartaSource).not.toMatch(/id="carta-digital"/);
  });

  it("App.tsx no longer references /servicios routing", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/isServicios/);
    expect(appSource).not.toMatch(/"\/servicios"/);
  });

  it("App.tsx hardcodes the canonical URL instead of deriving it from location.pathname", () => {
    const appSource = read("App.tsx");
    expect(appSource).toMatch(/CANONICAL_URL\s*=\s*"https:\/\/digitalizatenerife\.es\/"/);
    expect(appSource).not.toMatch(/href=\{`https:\/\/digitalizatenerife\.es\$\{location\.pathname\}`\}/);
  });

  it("drops the long 'Pilares Tecnológicos' block (home simplified, 2026-10)", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/Pilares Tecnológicos/);
    expect(appSource).not.toMatch(/from ["']lucide-react["']/);
  });
});
