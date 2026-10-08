import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) Unit 8 — scripts/eval-knowledge-base.mjs
// is plain ESM. ts-jest's CJS-oriented transform for .test.ts files cannot
// import() a .mjs directly (same constraint as scripts/ingest-knowledge-base.mjs
// — see tests/unit/scripts/ingestKnowledgeBase.test.ts), so these tests spawn
// a real `node --input-type=module` subprocess with an injected `askFn`/`now`.
// The CLI's real Supabase/fetch wiring lives inside `main()`, guarded by the
// `process.argv[1] === fileURLToPath(import.meta.url)` entry check, so
// importing the module for `runEval` never touches the network.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

function runScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/eval-knowledge-base.mjs — runEval (pure injectable core)", () => {
  it("asks every question, checks criteria, and returns per-question results + summary + latencyP95", () => {
    const out = runScript(`
      import { runEval } from "./eval-knowledge-base.mjs";
      const questions = [
        { id: "web-si", lang: "es", question: "¿Hacen páginas web?", mustInclude: ["páginas web"], mustNotInclude: ["39"] },
        { id: "precio-nfc", lang: "es", question: "¿Cuánto cuestan las tarjetas NFC?", mustInclude: [["15", "35"]], mustNotInclude: ["39"] },
      ];
      const answers = {
        "¿Hacen páginas web?": "Sí, hacemos páginas web a medida.",
        "¿Cuánto cuestan las tarjetas NFC?": "Cuestan entre 15 € y 35 € por unidad.",
      };
      let tick = 0;
      const now = () => { tick += 10; return tick; };
      const askFn = async (q) => answers[q];
      const result = await runEval({ questions, askFn, now });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].id).toBe("web-si");
    expect(result.results[0].pass).toBe(true);
    expect(result.results[1].pass).toBe(true);
    expect(result.summary).toEqual({
      total: 2,
      passed: 2,
      failed: 0,
      passRate: 1,
      failingIds: [],
      forbiddenHits: [],
    });
    expect(typeof result.latencyP95).toBe("number");
    expect(result.latencyP95).toBeGreaterThan(0);
  });

  it("marks a question failed and records the forbidden term when the answer leaks it", () => {
    const out = runScript(`
      import { runEval } from "./eval-knowledge-base.mjs";
      const questions = [
        { id: "precio-nfc", lang: "es", question: "¿Cuánto cuestan las tarjetas NFC?", mustInclude: [["15", "35"]], mustNotInclude: ["39"] },
      ];
      const askFn = async () => "Las tarjetas NFC cuestan 39 € por unidad.";
      const result = await runEval({ questions, askFn, now: () => 0 });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.results[0].pass).toBe(false);
    expect(result.results[0].foundForbidden).toEqual(["39"]);
    expect(result.summary.forbiddenHits).toEqual(["precio-nfc"]);
    expect(result.summary.passRate).toBe(0);
  });
});
