import fs from "node:fs";
import path from "node:path";

// See CartaDigitalSection.structure.test.ts for why these are source-text
// checks instead of RTL renders (no jest-environment-jsdom in this repo).
//
// design.md §2-§3 (seo-geo-p0-fixes, PR#2): removes the dead /contacto
// client route + isContacto branching + Hero's variant prop, and removes
// the 3 invalid hreflang <link> tags from App.tsx's <Helmet>.
const ROOT = path.resolve(__dirname, "../../");
const SRC = path.resolve(ROOT, "src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

describe("App.tsx — hreflang removed, /contacto branching removed (design.md §3)", () => {
  it("emits zero hrefLang tags", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/hrefLang/);
  });

  it("keeps exactly one canonical link and one og:locale=es_ES", () => {
    const appSource = read("App.tsx");
    expect(appSource.match(/rel="canonical"/g) ?? []).toHaveLength(1);
    expect(appSource).toMatch(/og:locale.*es_ES/);
  });

  it("has no isContacto branching or useLocation import", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/isContacto/);
    expect(appSource).not.toMatch(/useLocation/);
  });

  it("pageTitle/pageDescription are module-level constants, not conditionals", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/pageTitle\s*=\s*isContacto/);
    expect(appSource).toMatch(/const\s+PAGE_TITLE\s*=/);
    expect(appSource).toMatch(/const\s+PAGE_DESCRIPTION\s*=/);
  });

  it("renders <Hero /> without a variant prop", () => {
    const appSource = read("App.tsx");
    expect(appSource).toMatch(/<Hero\s*\/>/);
    expect(appSource).not.toMatch(/<Hero\s+variant/);
  });

  it("SEO checklist comment documents hreflang as intentionally absent, with the exact condition for re-adding it", () => {
    const appSource = read("App.tsx");
    expect(appSource).toMatch(/Hreflang: intentionally absent/);
    expect(appSource).toMatch(/i18n-url-routing/);
    expect(appSource).not.toMatch(/Hreflang: skipped/);
  });
});

describe("Hero.tsx — variant prop removed (design.md §3.3)", () => {
  it("has no HeroProps interface or variant prop", () => {
    const heroSource = read(
      "features/landing/presentation/components/Hero.tsx",
    );
    expect(heroSource).not.toMatch(/HeroProps/);
    expect(heroSource).not.toMatch(/variant/);
  });

  it("is declared as React.FC with no props", () => {
    const heroSource = read(
      "features/landing/presentation/components/Hero.tsx",
    );
    expect(heroSource).toMatch(/export const Hero:\s*React\.FC\s*=\s*\(\)\s*=>/);
  });

  it("uses t.heroTitle / t.heroTitleAccent / t.heroTitleEnd directly", () => {
    const heroSource = read(
      "features/landing/presentation/components/Hero.tsx",
    );
    expect(heroSource).toMatch(/t\.heroTitle\b/);
    expect(heroSource).toMatch(/t\.heroTitleAccent\b/);
    expect(heroSource).toMatch(/t\.heroTitleEnd\b/);
  });

  it("no call site anywhere in src/ passes a variant prop to Hero", () => {
    const files = walkTsx(SRC);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf-8");
      expect(source).not.toMatch(/<Hero\s+variant/);
    }
  });
});

describe("entry-client.tsx — /contacto route removed (design.md §2.1)", () => {
  it("has no /contacto route", () => {
    const source = read("entry-client.tsx");
    expect(source).not.toMatch(/\/contacto/);
  });

  it("comment documents the real prerendered route set, not the stale (/, /contacto) claim", () => {
    const source = read("entry-client.tsx");
    expect(source).not.toMatch(/Prerendered pages \(\/, \/contacto\)/);
    expect(source).toMatch(/\/tarjetas-nfc/);
  });

  it("still renders <App /> for '/'", () => {
    const source = read("entry-client.tsx");
    expect(source).toMatch(/<Route path="\/" element=\{<App \/>\} \/>/);
  });
});

function walkTsx(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkTsx(fullPath));
    } else if (entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}
