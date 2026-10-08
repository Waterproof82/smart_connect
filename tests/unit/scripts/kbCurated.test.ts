import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D9/D10 — scripts/kb/curated.mjs is
// plain ESM. ts-jest's CJS-oriented transform for .test.ts files cannot
// import() a .mjs directly (same constraint as scripts/markdown-extract.mjs
// — see tests/unit/scripts/markdownExtract.test.ts), so these tests spawn a
// real `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runCuratedScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/curated.mjs — parseCuratedFile (design.md D9/D10)", () => {
  it("parses frontmatter (title/lang/url) and returns the body without the frontmatter block", () => {
    const raw =
      "---\ntitle: Servicios Web\nlang: es\nurl: /servicios-web\n---\n" +
      "## Servicios\n\nHacemos páginas web personalizadas para negocios locales.\n";
    const out = runCuratedScript(`
      import { parseCuratedFile } from "./kb/curated.mjs";
      const result = parseCuratedFile(${JSON.stringify(raw)}, { filePath: "servicios-web.md" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.skip).toBe(false);
    expect(result.title).toBe("Servicios Web");
    expect(result.lang).toBe("es");
    expect(result.url).toBe("/servicios-web");
    expect(result.body).not.toContain("---");
    expect(result.body).toContain("Hacemos páginas web personalizadas");
  });

  it("skips the whole file when frontmatter has draft: true", () => {
    const raw = "---\ntitle: Borrador\nlang: es\ndraft: true\n---\n## Pendiente\n\nTexto a confirmar.\n";
    const out = runCuratedScript(`
      import { parseCuratedFile } from "./kb/curated.mjs";
      const result = parseCuratedFile(${JSON.stringify(raw)}, { filePath: "borrador.md" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("draft");
    expect(result.body).toBe("");
  });

  it("excludes a section containing TODO(owner) from the body and reports it, keeping confirmed sections", () => {
    const raw =
      "---\ntitle: Carta Digital\nlang: es\n---\n" +
      "## Confirmado\n\nHacemos carta digital para tiendas, esto está confirmado por el dueño.\n\n" +
      "## Precios TODO(owner)\n\nFalta confirmar el precio exacto con el cliente antes de publicar.\n";
    const out = runCuratedScript(`
      import { parseCuratedFile } from "./kb/curated.mjs";
      const result = parseCuratedFile(${JSON.stringify(raw)}, { filePath: "carta-digital.md" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.skip).toBe(false);
    expect(result.body).toContain("Hacemos carta digital para tiendas");
    expect(result.body).not.toContain("TODO(owner)");
    expect(result.body).not.toContain("Falta confirmar el precio");
    expect(result.excludedSections).toEqual(["Precios TODO(owner)"]);
  });

  it("returns an empty excludedSections list when no section contains TODO(owner)", () => {
    const raw = "---\ntitle: Preguntas\nlang: es\n---\n## Todo lo que hacemos\n\nEsto es un texto confirmado sin marcadores pendientes.\n";
    const out = runCuratedScript(`
      import { parseCuratedFile } from "./kb/curated.mjs";
      const result = parseCuratedFile(${JSON.stringify(raw)}, { filePath: "preguntas.md" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.excludedSections).toEqual([]);
    expect(result.body).toContain("Esto es un texto confirmado");
  });
});

describe("scripts/kb/curated.mjs — containsTodoToken (design.md D10 hard invariant)", () => {
  it("detects the literal TODO(owner) token", () => {
    const out = runCuratedScript(`
      import { containsTodoToken } from "./kb/curated.mjs";
      process.stdout.write(JSON.stringify(containsTodoToken("Precio TODO(owner) por confirmar")));
    `);
    expect(JSON.parse(out)).toBe(true);
  });

  it("does not false-positive on the common Spanish word 'todo'", () => {
    const out = runCuratedScript(`
      import { containsTodoToken } from "./kb/curated.mjs";
      process.stdout.write(JSON.stringify(containsTodoToken("Todo lo que necesitas para digitalizar tu negocio")));
    `);
    expect(JSON.parse(out)).toBe(false);
  });
});
