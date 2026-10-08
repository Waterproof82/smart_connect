import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D12 — scripts/kb/hash.mjs is plain
// ESM. ts-jest's CJS-oriented transform for .test.ts files cannot import() a
// .mjs directly (same constraint as scripts/markdown-extract.mjs — see
// tests/unit/scripts/markdownExtract.test.ts), so these tests spawn a real
// `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runHashScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/hash.mjs — buildContractVersion (design.md D4/D12)", () => {
  it("formats '<model>:<mode>:<dims>' matching _shared/embedding.ts's constants", () => {
    const out = runHashScript(`
      import { buildContractVersion } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(buildContractVersion("legacy")));
    `);
    expect(JSON.parse(out)).toBe("gemini-embedding-001:legacy:768");
  });

  it("changes when the embedding mode changes, forcing re-embed on flag flip", () => {
    const out = runHashScript(`
      import { buildContractVersion } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(buildContractVersion("v2")));
    `);
    expect(JSON.parse(out)).toBe("gemini-embedding-001:v2:768");
  });
});

describe("scripts/kb/hash.mjs — computeContentHash (design.md D12)", () => {
  const baseInput = {
    contractVersion: "gemini-embedding-001:legacy:768",
    source: "site:/carta-digital",
    url: "/carta-digital",
    section: "Servicios",
    content: "Hacemos carta digital para tiendas y restaurantes.",
  };

  it("is deterministic for identical input", () => {
    const outA = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(baseInput)})));
    `);
    const outB = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(baseInput)})));
    `);
    expect(outA).toBe(outB);
    expect(JSON.parse(outA)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when contractVersion changes (mode flip forces re-embed)", () => {
    const outLegacy = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(baseInput)})));
    `);
    const v2Input = { ...baseInput, contractVersion: "gemini-embedding-001:v2:768" };
    const outV2 = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(v2Input)})));
    `);
    expect(outLegacy).not.toBe(outV2);
  });

  it("changes when content, section, source, or url change", () => {
    const outBase = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(baseInput)})));
    `);
    const variants = [
      { ...baseInput, content: "Texto distinto por completo." },
      { ...baseInput, section: "Precios" },
      { ...baseInput, source: "curated:carta-digital.md" },
      { ...baseInput, url: "/otra-pagina" },
    ];
    for (const variant of variants) {
      const outVariant = runHashScript(`
        import { computeContentHash } from "./kb/hash.mjs";
        process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(variant)})));
      `);
      expect(outVariant).not.toBe(outBase);
    }
  });

  it("normalizes surrounding whitespace in content without changing the hash", () => {
    const trimmed = baseInput;
    const padded = { ...baseInput, content: `\n\n  ${baseInput.content}  \n` };
    const outTrimmed = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(trimmed)})));
    `);
    const outPadded = runHashScript(`
      import { computeContentHash } from "./kb/hash.mjs";
      process.stdout.write(JSON.stringify(computeContentHash(${JSON.stringify(padded)})));
    `);
    expect(outTrimmed).toBe(outPadded);
  });
});
