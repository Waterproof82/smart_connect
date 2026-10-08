import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D11 — scripts/kb/chunk.mjs is plain
// ESM. ts-jest's CJS-oriented transform for .test.ts files cannot import() a
// .mjs directly (same constraint as scripts/markdown-extract.mjs — see
// tests/unit/scripts/markdownExtract.test.ts), so these tests spawn a real
// `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runChunkScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/chunk.mjs — chunkMarkdown (design.md D11)", () => {
  it("splits markdown by ## headings into one chunk per section, prefixed with 'Página: {title} › {section}'", () => {
    const serviciosBody =
      "Hacemos páginas web personalizadas para negocios locales que buscan " +
      "mejorar su presencia online y conseguir más clientes cada mes.";
    const contactoBody =
      "Podés escribirnos por el formulario de contacto y te respondemos en " +
      "menos de 24 horas en días laborables para coordinar una llamada.";
    const markdown = `## Servicios\n\n${serviciosBody}\n\n## Contacto\n\n${contactoBody}`;
    const out = runChunkScript(`
      import { chunkMarkdown } from "./kb/chunk.mjs";
      const result = chunkMarkdown(${JSON.stringify(markdown)}, { title: "Inicio" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toHaveLength(2);
    expect(result[0].section).toBe("Servicios");
    expect(result[0].content).toContain("Página: Inicio › Servicios");
    expect(result[0].content).toContain(serviciosBody);
    expect(result[1].section).toBe("Contacto");
    expect(result[1].content).toContain("Página: Inicio › Contacto");
    expect(result[1].content).toContain(contactoBody);
  });

  it("merges a section shorter than 80 chars into the following section", () => {
    const shortIntro = "Bienvenido.";
    const longBody =
      "Ofrecemos tarjetas NFC y QR para potenciar las reseñas de Google de " +
      "tu negocio local, con precios desde 15 a 35 euros por unidad según el volumen.";
    const markdown = `## Intro\n\n${shortIntro}\n\n## Servicios\n\n${longBody}`;
    const out = runChunkScript(`
      import { chunkMarkdown } from "./kb/chunk.mjs";
      const result = chunkMarkdown(${JSON.stringify(markdown)}, { title: "Inicio" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toHaveLength(1);
    expect(result[0].section).toBe("Servicios");
    expect(result[0].content).toContain(shortIntro);
    expect(result[0].content).toContain(longBody);
  });

  it("splits a section longer than 1200 chars into multiple chunks with ~150 char overlap", () => {
    const paragraph =
      "Cada frase de este parrafo describe un servicio distinto de digitalizacion para negocios locales. ";
    const longBody = Array.from({ length: 20 }, (_, i) => `${paragraph}Parrafo numero ${i}.`).join(
      "\n\n",
    );
    const markdown = `## Servicios\n\n${longBody}`;
    const out = runChunkScript(`
      import { chunkMarkdown } from "./kb/chunk.mjs";
      const result = chunkMarkdown(${JSON.stringify(markdown)}, { title: "Inicio" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.section).toBe("Servicios");
    }
    // Overlap: the tail of chunk N should reappear at the head of chunk N+1's body.
    const firstBody = result[0].content.split("\n\n").slice(1).join("\n\n");
    const secondBody = result[1].content.split("\n\n").slice(1).join("\n\n");
    const overlapCandidate = firstBody.slice(-100);
    expect(secondBody).toContain(overlapCandidate);
  });

  it("drops a chunk that stays under 80 chars after merging (single too-short section)", () => {
    const markdown = "## Intro\n\nHola.";
    const out = runChunkScript(`
      import { chunkMarkdown } from "./kb/chunk.mjs";
      const result = chunkMarkdown(${JSON.stringify(markdown)}, { title: "Inicio" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toEqual([]);
  });
});
