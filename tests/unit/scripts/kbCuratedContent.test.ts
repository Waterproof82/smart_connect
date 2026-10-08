import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

// design.md (rag-knowledge-base-refresh) Unit 8 — asserts every file under
// content/knowledge-base/*.md parses cleanly with scripts/kb/curated.mjs
// and never leaks a TODO(owner) section, the old brand, invented prices, or
// voseo/LatAm Spanish into the body that actually reaches ingestion.
//
// scripts/kb/curated.mjs is plain ESM; ts-jest's CJS-oriented transform for
// .test.ts files cannot import() a .mjs directly (same constraint as
// tests/unit/scripts/kbCurated.test.ts), so this spawns a real
// `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");
const CURATED_DIR = path.resolve(ROOT, "content", "knowledge-base");

const OLD_BRAND_RE = /smart[- ]?connect|qribar/i;
const VOSEO_RE = /\btenés\b|\bsos\b|\bvos\b|\bchévere\b|\bcelular\b|\bcomputadora\b/i;
const PRICE_DIGIT_EURO_RE = /\d+\s?€/g;
const FORBIDDEN_NUMBERS_RE = /\b39\b|\b1450\b|\b100\s?€/;

function runCuratedScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

function listCuratedFiles(): string[] {
  return fs
    .readdirSync(CURATED_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

function parseCurated(fileName: string) {
  const raw = fs.readFileSync(path.join(CURATED_DIR, fileName), "utf-8");
  const out = runCuratedScript(`
    import { parseCuratedFile } from "./kb/curated.mjs";
    const result = parseCuratedFile(${JSON.stringify(raw)}, { filePath: ${JSON.stringify(fileName)} });
    process.stdout.write(JSON.stringify(result));
  `);
  return { raw, parsed: JSON.parse(out) };
}

describe("content/knowledge-base/*.md — curated content integrity (Unit 8)", () => {
  it("has at least the 3 curated files the design calls for", () => {
    const files = listCuratedFiles();
    expect(files).toEqual(
      expect.arrayContaining(["servicios-web.md", "carta-digital.md", "preguntas-clave.md"]),
    );
  });

  it.each(["servicios-web.md", "carta-digital.md", "preguntas-clave.md"])(
    "%s parses with valid frontmatter (title/lang) and is not a draft",
    (fileName) => {
      const { parsed } = parseCurated(fileName);
      expect(parsed.skip).toBe(false);
      expect(typeof parsed.title).toBe("string");
      expect(parsed.title.length).toBeGreaterThan(0);
      expect(parsed.lang).toBe("es");
    },
  );

  it.each(["servicios-web.md", "carta-digital.md", "preguntas-clave.md"])(
    "%s never leaks the TODO(owner) token into the ingested body",
    (fileName) => {
      const { parsed } = parseCurated(fileName);
      expect(parsed.body).not.toContain("TODO(owner)");
      expect(parsed.body).not.toMatch(/TODO/);
    },
  );

  it.each(["servicios-web.md", "carta-digital.md", "preguntas-clave.md"])(
    "%s has zero old-brand (smartconnect/qribar) mentions, in raw text or ingested body",
    (fileName) => {
      const { raw, parsed } = parseCurated(fileName);
      expect(raw).not.toMatch(OLD_BRAND_RE);
      expect(parsed.body).not.toMatch(OLD_BRAND_RE);
    },
  );

  it.each(["servicios-web.md", "carta-digital.md", "preguntas-clave.md"])(
    "%s has zero voseo/LatAm Spanish markers",
    (fileName) => {
      const { raw } = parseCurated(fileName);
      expect(raw).not.toMatch(VOSEO_RE);
    },
  );

  it("servicios-web.md and carta-digital.md never quote a digit+€ price (pricing policy = 'depende' + contact CTA)", () => {
    for (const fileName of ["servicios-web.md", "carta-digital.md"]) {
      const { parsed } = parseCurated(fileName);
      const matches = parsed.body.match(PRICE_DIGIT_EURO_RE) ?? [];
      expect(matches).toEqual([]);
    }
  });

  it("preguntas-clave.md only quotes the confirmed NFC price range (15€-35€), never a forbidden number", () => {
    const { parsed } = parseCurated("preguntas-clave.md");
    expect(parsed.body).not.toMatch(FORBIDDEN_NUMBERS_RE);
    const matches = (parsed.body.match(PRICE_DIGIT_EURO_RE) ?? []).map((m: string) => m.replace(/\s/g, ""));
    for (const match of matches) {
      expect(["15€", "35€"]).toContain(match);
    }
    expect(parsed.body).toContain("15 €");
    expect(parsed.body).toContain("35 €");
  });

  it("preguntas-clave.md confirms custom websites exist and points to the contact CTA", () => {
    const { parsed } = parseCurated("preguntas-clave.md");
    expect(parsed.body.toLowerCase()).toContain("página web");
    expect(parsed.body).toContain("digitalizatenerife.es/#contacto");
  });

  it("preguntas-clave.md confirms digital menus are also available for shops", () => {
    const { parsed } = parseCurated("preguntas-clave.md");
    expect(parsed.body.toLowerCase()).toContain("tienda");
  });

  it("preguntas-clave.md redirects privacy questions to the footer legal links, never fabricating policy text", () => {
    const { parsed } = parseCurated("preguntas-clave.md");
    expect(parsed.body).toContain("digitalizatenerife.es/legal/privacidad");
  });
});
