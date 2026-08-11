import fs from "node:fs";
import path from "node:path";
import { TPV_MODULES } from "@shared/config/tpvModules";
import { tpvModuleEs, tpvModuleEn } from "@shared/i18n/modules";

// design.md D6/D8/D9 — TpvModuleFigure eager wrapper + per-module photo
// pattern. MODULES_WITH_FIGURES grows by one entry per module PR: PR1 ships
// only "tpv-cobro"; PR2-4 append the remaining 11 (never
// "tienda-carta-digital" — that module is accent-only, spec requirement
// "tienda-carta-digital Accent-Only").
const MODULES_WITH_FIGURES = ["tpv-cobro"];

const SECTION_FILE: Record<string, string> = {
  "tpv-cobro": "TpvCobroSection.tsx",
};

// module id -> camelCase i18n prefix used for the FigureAlt key, e.g.
// `tpvCobroFigureAlt`.
const I18N_PREFIX: Record<string, string> = {
  "tpv-cobro": "tpvCobro",
};

const SRC = path.resolve(__dirname, "../../src");
const TPV_COMPONENTS_DIR = path.join(SRC, "shared/components/tpv");
const FIGURE_COMPONENT_PATH = path.join(
  TPV_COMPONENTS_DIR,
  "TpvModuleFigure.tsx",
);
const ASSETS_DIR = path.resolve(__dirname, "../../public/assets/tpv");
const CREDITS_PATH = path.join(ASSETS_DIR, "CREDITS.md");
const FIRECRAWL_SMARTBAR_PATH = path.resolve(
  __dirname,
  "../../.firecrawl/smartbar-home.json",
);

// Basenames used by the smartbar.io competitor's own asset paths
// (.firecrawl/smartbar-home.json) — banned from public/assets/tpv/
// filenames (design.md D8, IP guard).
const BANNED_SMARTBAR_BASENAMES = [
  "phone",
  "pedidos-qr",
  "comanderohero",
  "cocina-kds",
  "inventario",
  "estadisticas-stats",
  "reservas",
  "control-horario",
  "verifactu",
  "delivery",
  "lara",
  "whatsapp",
  "smartbar-og",
];

function readSource(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function tokenFromIconColor(iconColor: string): string {
  const m = iconColor.match(/--color-icon-[a-z]+/);
  if (!m) throw new Error(`Could not parse token from ${iconColor}`);
  return m[0];
}

/** All `<tagName ...>` opening-tag substrings (attrs may span lines). */
function extractOpeningTags(source: string, tagName: string): string[] {
  const tags: string[] = [];
  const re = new RegExp(`<${tagName}[\\s>]`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const start = m.index;
    const end = source.indexOf(">", start);
    if (end !== -1) tags.push(source.slice(start, end + 1));
  }
  return tags;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

describe("TpvModuleFigure component (design.md D6)", () => {
  it("exists as a plain, eager default export (no React.lazy, no Suspense)", () => {
    expect(fs.existsSync(FIGURE_COMPONENT_PATH)).toBe(true);
    const source = readSource(FIGURE_COMPONENT_PATH);
    expect(source).toMatch(/export default TpvModuleFigure/);
    expect(source).not.toMatch(/React\.lazy\(/);
    expect(source).not.toMatch(/\blazy\(/);
    expect(source).not.toMatch(/Suspense/);
  });

  it("has both CLS defences: intrinsic width/height AND an aspect-ratio wrapper", () => {
    const source = readSource(FIGURE_COMPONENT_PATH);
    expect(source).toMatch(/width=\{/);
    expect(source).toMatch(/height=\{/);
    expect(source).toMatch(/aspectRatio/);
  });

  it("renders exactly one native <img> with loading=lazy and decoding=async", () => {
    const source = readSource(FIGURE_COMPONENT_PATH);
    const imgTags = extractOpeningTags(source, "img");
    expect(imgTags.length).toBe(1);
    expect(imgTags[0]).toMatch(/loading="lazy"/);
    expect(imgTags[0]).toMatch(/decoding="async"/);
  });
});

describe("Module figure pattern per section (design.md D6/D9)", () => {
  for (const moduleId of MODULES_WITH_FIGURES) {
    const module = TPV_MODULES.find((m) => m.id === moduleId);
    const sectionFile = SECTION_FILE[moduleId];
    const i18nPrefix = I18N_PREFIX[moduleId];

    if (!module || !sectionFile || !i18nPrefix) {
      throw new Error(
        `Missing test fixture wiring for module "${moduleId}" — update SECTION_FILE/I18N_PREFIX.`,
      );
    }

    const sectionPath = path.join(TPV_COMPONENTS_DIR, sectionFile);
    const expectedToken = tokenFromIconColor(module.iconColor);
    const figureAltKey = `${i18nPrefix}FigureAlt`;
    const webpPath = path.join(ASSETS_DIR, `${moduleId}.webp`);

    describe(`${moduleId} (${sectionFile})`, () => {
      it("section file exists", () => {
        expect(fs.existsSync(sectionPath)).toBe(true);
      });

      it("imports TpvModuleFigure eagerly (no React.lazy/Suspense in the file)", () => {
        const source = readSource(sectionPath);
        expect(source).toMatch(
          /^import TpvModuleFigure from ["']\.\/TpvModuleFigure["'];$/m,
        );
        expect(source).not.toMatch(/React\.lazy\(/);
        expect(source).not.toMatch(/\blazy\(/);
        expect(source).not.toMatch(/Suspense/);
      });

      it("renders exactly one <TpvModuleFigure> with a non-empty src/alt", () => {
        const source = readSource(sectionPath);
        const occurrences = source.match(/<TpvModuleFigure\b/g) ?? [];
        expect(occurrences.length).toBe(1);
        expect(source).toMatch(
          new RegExp(`src=["']/assets/tpv/${moduleId}\\.webp["']`),
        );
        expect(source).not.toMatch(/alt=""/);
        expect(source).not.toMatch(/alt=\{""\}/);
        expect(source).toMatch(new RegExp(`alt=\\{t\\.${figureAltKey}\\}`));
      });

      it("sets --tpv-accent via accentStyle() with this module's exact config token", () => {
        const source = readSource(sectionPath);
        expect(source).toMatch(
          new RegExp(`accentStyle\\(["']${expectedToken}["']\\)`),
        );
      });

      it("non-text contract: h2/h3 headings never reference --tpv-accent (D4)", () => {
        const source = readSource(sectionPath);
        for (const tag of [
          ...extractOpeningTags(source, "h2"),
          ...extractOpeningTags(source, "h3"),
        ]) {
          expect(tag).not.toMatch(/--tpv-accent/);
        }
      });

      it("non-text contract: eyebrow and CTA keep --color-primary, not the accent", () => {
        const source = readSource(sectionPath);
        const occurrences =
          source.match(/text-\[var\(--color-primary\)\]/g) ?? [];
        // eyebrow div + CTA anchor, at minimum.
        expect(occurrences.length).toBeGreaterThanOrEqual(2);
      });

      it("the FigureAlt i18n key exists, is non-empty, <=125 chars, and differs between es/en", () => {
        const es = (tpvModuleEs as Record<string, string>)[figureAltKey];
        const en = (tpvModuleEn as Record<string, string>)[figureAltKey];
        expect(typeof es).toBe("string");
        expect(typeof en).toBe("string");
        expect(es.length).toBeGreaterThan(0);
        expect(en.length).toBeGreaterThan(0);
        expect(es.length).toBeLessThanOrEqual(125);
        expect(en.length).toBeLessThanOrEqual(125);
        expect(es).not.toBe(en);
      });

      it("ships a WebP asset <=150KB with valid RIFF/WEBP magic bytes", () => {
        expect(fs.existsSync(webpPath)).toBe(true);
        const stat = fs.statSync(webpPath);
        expect(stat.size).toBeLessThanOrEqual(150 * 1024);

        const fd = fs.openSync(webpPath, "r");
        const buf = Buffer.alloc(12);
        fs.readSync(fd, buf, 0, 12, 0);
        fs.closeSync(fd);
        expect(buf.toString("ascii", 0, 4)).toBe("RIFF");
        expect(buf.toString("ascii", 8, 12)).toBe("WEBP");
      });
    });
  }

  it("no module file contains zero <img>/<TpvModuleFigure> elements (missing-photo gate)", () => {
    for (const moduleId of MODULES_WITH_FIGURES) {
      const sectionPath = path.join(
        TPV_COMPONENTS_DIR,
        SECTION_FILE[moduleId],
      );
      const source = readSource(sectionPath);
      expect(source).toMatch(/<TpvModuleFigure\b/);
    }
  });

  it("completion gate: once 12 modules are wired, the set equals TPV_MODULES minus tienda-carta-digital", () => {
    const expectedFull = TPV_MODULES.map((m) => m.id).filter(
      (id) => id !== "tienda-carta-digital",
    );
    if (MODULES_WITH_FIGURES.length === expectedFull.length) {
      expect(new Set(MODULES_WITH_FIGURES)).toEqual(new Set(expectedFull));
    } else {
      // Not yet complete (PR1-3) — gate is a no-op until PR4.
      expect(MODULES_WITH_FIGURES.length).toBeLessThan(expectedFull.length);
    }
  });
});

describe("public/assets/tpv/CREDITS.md provenance (design.md D8)", () => {
  const creditsExists = fs.existsSync(CREDITS_PATH);

  it("exists", () => {
    expect(creditsExists).toBe(true);
  });

  if (!creditsExists) return;

  const creditsSource = readSource(CREDITS_PATH);
  // Markdown table rows: | file.webp | photoId | photographer | url | date |
  const rows = [...creditsSource.matchAll(/^\|\s*([^|]+?\.webp)\s*\|/gm)].map(
    (m) => m[1].trim(),
  );

  it("every shipped .webp under public/assets/tpv has a CREDITS.md row (bidirectional completeness)", () => {
    const shippedWebps = fs
      .readdirSync(ASSETS_DIR)
      .filter((f) => f.endsWith(".webp"));
    for (const file of shippedWebps) {
      expect(rows).toContain(file);
    }
    for (const row of rows) {
      expect(fs.existsSync(path.join(ASSETS_DIR, row))).toBe(true);
    }
  });

  it("every CREDITS.md row has a non-empty Unsplash photo ID and photographer", () => {
    const dataRows = creditsSource
      .split("\n")
      .filter((l) => /^\|\s*[^|]+\.webp\s*\|/.test(l));
    expect(dataRows.length).toBeGreaterThan(0);
    for (const line of dataRows) {
      // split("|") on "| file | id | photographer | url | date |" yields
      // ["", " file ", " id ", " photographer ", " url ", " date ", ""].
      const cells = line.split("|").map((c) => c.trim());
      expect(cells[2]).toBeTruthy(); // Unsplash photo ID
      expect(cells[3]).toBeTruthy(); // photographer
      expect(cells[4]).toMatch(/^https:\/\/unsplash\.com\/photos\//); // source URL
    }
  });

  it("no photo ID appears twice across CREDITS.md rows (uniqueness)", () => {
    const dataRows = creditsSource
      .split("\n")
      .filter((l) => /^\|\s*[^|]+\.webp\s*\|/.test(l));
    const ids = dataRows.map((line) =>
      line
        .split("|")
        .map((c) => c.trim())[2],
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("zero literal 'smartbar.io' occurrences under src/ or public/assets/tpv/", () => {
    const targets = [
      ...walkFiles(SRC),
      ...walkFiles(ASSETS_DIR),
    ];
    for (const file of targets) {
      if (file.endsWith(".webp")) continue;
      const content = readSource(file);
      expect(content.toLowerCase()).not.toMatch(/smartbar\.io/);
    }
  });

  it("no shipped filename under public/assets/tpv matches a banned smartbar basename", () => {
    const shippedWebps = fs
      .readdirSync(ASSETS_DIR)
      .filter((f) => f.endsWith(".webp"));
    for (const file of shippedWebps) {
      const base = path.basename(file, ".webp").toLowerCase();
      expect(BANNED_SMARTBAR_BASENAMES).not.toContain(base);
    }
  });

  it("no CREDITS.md photo ID collides with any image URL captured in .firecrawl/smartbar-home.json", () => {
    if (!fs.existsSync(FIRECRAWL_SMARTBAR_PATH)) return;
    const firecrawlRaw = readSource(FIRECRAWL_SMARTBAR_PATH);
    const dataRows = creditsSource
      .split("\n")
      .filter((l) => /^\|\s*[^|]+\.webp\s*\|/.test(l));
    for (const line of dataRows) {
      const photoId = line.split("|").map((c) => c.trim())[2];
      if (photoId) {
        expect(firecrawlRaw).not.toContain(photoId);
      }
    }
  });
});
