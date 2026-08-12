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

  it("mounts TpvModulesSection (the TPV_MODULES registry seam, PR4) between #soluciones and #por-que", () => {
    const appSource = read("App.tsx");
    const solucionesIdx = appSource.indexOf('id="soluciones"');
    const tpvModulesIdx = appSource.indexOf("<TpvModulesSection");
    const porQueIdx = appSource.indexOf('id="por-que"');

    expect(solucionesIdx).toBeGreaterThan(-1);
    expect(tpvModulesIdx).toBeGreaterThan(solucionesIdx);
    expect(porQueIdx).toBeGreaterThan(tpvModulesIdx);
    // PR4: CartaDigitalSection is no longer mounted directly by App.tsx —
    // it's looked up via TPV_MODULE_SECTIONS["tienda-carta-digital"].
    expect(appSource).not.toMatch(/<CartaDigitalSection/);
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

  it("Pilares Tecnológicos: 4 distinct lucide icons + 4 distinct accent tokens, zero <img> (PR5: accent-only, no photos)", () => {
    const appSource = read("App.tsx");
    const pilaresStart = appSource.indexOf("Pilares Tecnológicos");
    const pilaresEnd = appSource.indexOf("Closing statement");

    expect(pilaresStart).toBeGreaterThan(-1);
    expect(pilaresEnd).toBeGreaterThan(pilaresStart);

    const pilaresBlock = appSource.slice(pilaresStart, pilaresEnd);

    // Accent-only per spec (Pilares Tecnológicos Accent-Only requirement):
    // MUST NOT gain any <img>.
    expect(pilaresBlock).not.toMatch(/<img[\s>]/);

    // 4 distinct lucide icons, imported eagerly from "lucide-react".
    const importLine =
      appSource.match(/import\s*\{[^}]*\}\s*from\s*["']lucide-react["'];?/)?.[0] ?? "";
    expect(importLine).not.toBe("");

    const icons = ["Workflow", "Utensils", "Monitor", "Bot"];
    for (const icon of icons) {
      expect(importLine).toMatch(new RegExp(`\\b${icon}\\b`));
      expect(pilaresBlock).toMatch(new RegExp(`\\b${icon}\\b`));
    }

    // 4 distinct accent tokens (D5-consistent: n8n->indigo, Carta Digital->emerald,
    // TPV->coral, IA->magenta), each rendered via accentStyle() + .tpv-accent-chip.
    const accents = [
      "--color-icon-indigo",
      "--color-icon-emerald",
      "--color-icon-coral",
      "--color-icon-magenta",
    ];
    for (const accent of accents) {
      const escaped = accent.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      expect(pilaresBlock).toMatch(new RegExp(escaped));
    }
    expect(new Set(accents).size).toBe(4);

    expect(pilaresBlock).toMatch(/accentStyle\(/);
    expect(pilaresBlock).toMatch(/tpv-accent-chip/);
  });
});
