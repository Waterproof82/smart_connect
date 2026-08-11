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

  it("Features.tsx, HomeFaqSection.tsx, Contact.tsx, SuccessStats.tsx, Navbar.tsx declare no <h1>", () => {
    const files = [
      "features/landing/presentation/components/Features.tsx",
      "features/landing/presentation/components/HomeFaqSection.tsx",
      "features/landing/presentation/components/Contact.tsx",
      "features/landing/presentation/components/SuccessStats.tsx",
      "features/landing/presentation/components/Navbar.tsx",
    ];
    for (const file of files) {
      expect(read(file)).not.toMatch(/<h1[\s>]/);
    }
  });

  it("mounts CartaDigitalSection and TapReviewSection between #soluciones and #por-que", () => {
    const appSource = read("App.tsx");
    const solucionesIdx = appSource.indexOf('id="soluciones"');
    const cartaIdx = appSource.indexOf("<CartaDigitalSection");
    const tapReviewIdx = appSource.indexOf("<TapReviewSection");
    const porQueIdx = appSource.indexOf('id="por-que"');

    expect(solucionesIdx).toBeGreaterThan(-1);
    expect(cartaIdx).toBeGreaterThan(solucionesIdx);
    expect(tapReviewIdx).toBeGreaterThan(cartaIdx);
    expect(porQueIdx).toBeGreaterThan(tapReviewIdx);
  });

  it("the merged sections declare the #carta-digital and #tarjetas-nfc anchors", () => {
    const cartaSource = read(
      "features/landing/presentation/components/CartaDigitalSection.tsx",
    );
    const tapSource = read("features/tap-review/presentation/TapReviewSection.tsx");
    expect(cartaSource).toMatch(/id="carta-digital"/);
    expect(tapSource).toMatch(/id="tarjetas-nfc"/);
  });

  it("Features.tsx derives its grid from the 2-entry SOLUTIONS catalog", () => {
    const featuresSource = read(
      "features/landing/presentation/components/Features.tsx",
    );
    expect(featuresSource).toMatch(/from ["']@shared\/config\/solutions["']/);
    expect(featuresSource).not.toMatch(/software-ia/);
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
});
