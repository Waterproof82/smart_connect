import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) Unit 8 — scripts/kb/evalCriteria.mjs
// is plain ESM. ts-jest's CJS-oriented transform for .test.ts files cannot
// import() a .mjs directly (same constraint as scripts/kb/curated.mjs — see
// tests/unit/scripts/kbCurated.test.ts), so these tests spawn a real
// `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

function runScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/evalCriteria.mjs — checkCriteria", () => {
  it("passes when a plain mustInclude string is present (case-insensitive)", () => {
    const out = runScript(`
      import { checkCriteria } from "./kb/evalCriteria.mjs";
      const result = checkCriteria("Sí, hacemos páginas web a medida.", { mustInclude: ["páginas web"] });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.pass).toBe(true);
    expect(result.missingInclude).toEqual([]);
  });

  it("passes an OR-group mustInclude entry when at least one option is present", () => {
    const out = runScript(`
      import { checkCriteria } from "./kb/evalCriteria.mjs";
      const result = checkCriteria("Yes, we build custom websites.", { mustInclude: [["yes", "sure"]] });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.pass).toBe(true);
  });

  it("fails and reports missingInclude when a required string is absent", () => {
    const out = runScript(`
      import { checkCriteria } from "./kb/evalCriteria.mjs";
      const result = checkCriteria("Hola, ¿en qué puedo ayudarte?", { mustInclude: ["contacto"] });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.pass).toBe(false);
    expect(result.missingInclude).toEqual(["contacto"]);
  });

  it("fails and reports foundForbidden when a mustNotInclude term is present", () => {
    const out = runScript(`
      import { checkCriteria } from "./kb/evalCriteria.mjs";
      const result = checkCriteria("Las tarjetas NFC cuestan 39 €.", { mustNotInclude: ["39"] });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.pass).toBe(false);
    expect(result.foundForbidden).toEqual(["39"]);
  });

  it("passes when there is nothing to check (empty criteria)", () => {
    const out = runScript(`
      import { checkCriteria } from "./kb/evalCriteria.mjs";
      const result = checkCriteria("Hola!", {});
      process.stdout.write(JSON.stringify(result));
    `);
    expect(JSON.parse(out).pass).toBe(true);
  });
});

describe("scripts/kb/evalCriteria.mjs — summarizeResults", () => {
  it("computes total/passed/failed/passRate and collects failingIds + forbiddenHits", () => {
    const out = runScript(`
      import { summarizeResults } from "./kb/evalCriteria.mjs";
      const result = summarizeResults([
        { id: "a", pass: true, foundForbidden: [] },
        { id: "b", pass: false, foundForbidden: [] },
        { id: "c", pass: false, foundForbidden: ["39"] },
      ]);
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toEqual({
      total: 3,
      passed: 1,
      failed: 2,
      passRate: 1 / 3,
      failingIds: ["b", "c"],
      forbiddenHits: ["c"],
    });
  });
});

describe("scripts/kb/evalCriteria.mjs — percentile", () => {
  it("computes p95 via nearest-rank method", () => {
    const out = runScript(`
      import { percentile } from "./kb/evalCriteria.mjs";
      const values = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
      process.stdout.write(JSON.stringify(percentile(values, 95)));
    `);
    expect(JSON.parse(out)).toBe(19);
  });

  it("returns 0 for an empty array", () => {
    const out = runScript(`
      import { percentile } from "./kb/evalCriteria.mjs";
      process.stdout.write(JSON.stringify(percentile([], 95)));
    `);
    expect(JSON.parse(out)).toBe(0);
  });
});
