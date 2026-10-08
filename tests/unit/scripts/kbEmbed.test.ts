import { execFileSync } from "node:child_process";
import path from "node:path";

import {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
} from "../../../supabase/functions/_shared/embedding";

// design.md (rag-knowledge-base-refresh) D5/D13 — scripts/kb/embed.mjs is
// plain ESM. ts-jest's CJS-oriented transform for .test.ts files cannot
// import() a .mjs directly (same constraint as scripts/kb/hash.mjs — see
// tests/unit/scripts/kbHash.test.ts), so these tests spawn a real
// `node --input-type=module` subprocess. Behavioral assertions (batching,
// spacing, retry/backoff) inject a fake `fetchFn`/`sleepFn` inline in the
// subprocess script — same injectable-core pattern as `_shared/generate.ts`.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runEmbedScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/embed.mjs — parity with _shared/embedding.ts (design.md D5)", () => {
  it("exports the same model name and dimensions as the query-side embedding contract", () => {
    const out = runEmbedScript(`
      import { EMBED_MODEL, EMBED_DIMENSIONS } from "./kb/embed.mjs";
      process.stdout.write(JSON.stringify({ EMBED_MODEL, EMBED_DIMENSIONS }));
    `);
    const result = JSON.parse(out);
    expect(result.EMBED_MODEL).toBe(EMBEDDING_MODEL);
    expect(result.EMBED_DIMENSIONS).toBe(EMBEDDING_DIMENSIONS);
  });
});

describe("scripts/kb/embed.mjs — buildBatchRequest (design.md D4/D13)", () => {
  it("legacy mode: byte-identical minimal payload per item, no taskType/outputDimensionality/title", () => {
    const out = runEmbedScript(`
      import { buildBatchRequest } from "./kb/embed.mjs";
      const result = buildBatchRequest([{ text: "Hola" }], { mode: "legacy", role: "document" });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.requests).toHaveLength(1);
    expect(result.requests[0]).toEqual({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text: "Hola" }] },
    });
  });

  it("v2 mode + document role: adds taskType RETRIEVAL_DOCUMENT, outputDimensionality 768, and title when provided", () => {
    const out = runEmbedScript(`
      import { buildBatchRequest } from "./kb/embed.mjs";
      const result = buildBatchRequest(
        [{ text: "Hola", title: "Carta Digital" }],
        { mode: "v2", role: "document" },
      );
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.requests[0]).toEqual({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text: "Hola" }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
      title: "Carta Digital",
    });
  });

  it("v2 mode + query role: uses RETRIEVAL_QUERY and never attaches a title", () => {
    const out = runEmbedScript(`
      import { buildBatchRequest } from "./kb/embed.mjs";
      const result = buildBatchRequest(
        [{ text: "¿Hacen carta digital?", title: "ignored" }],
        { mode: "v2", role: "query" },
      );
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.requests[0].taskType).toBe("RETRIEVAL_QUERY");
    expect(result.requests[0].title).toBeUndefined();
  });
});

describe("scripts/kb/embed.mjs — embedAll batching/spacing/backoff (design.md D13)", () => {
  it("splits more than 50 items into batches of 50 and sleeps spacingMs between batches (not after the last)", () => {
    const out = runEmbedScript(`
      import { embedAll } from "./kb/embed.mjs";
      const items = Array.from({ length: 60 }, (_, i) => ({ text: "chunk " + i }));
      const requestSizes = [];
      const sleeps = [];
      const fetchFn = async (url, opts) => {
        const body = JSON.parse(opts.body);
        requestSizes.push(body.requests.length);
        return { ok: true, status: 200, json: async () => ({ embeddings: body.requests.map(() => ({ values: [1, 2, 3] })) }) };
      };
      const sleepFn = async (ms) => { sleeps.push(ms); };
      const vectors = await embedAll({ items, mode: "legacy", role: "document", apiKey: "k", fetchFn, sleepFn });
      process.stdout.write(JSON.stringify({ vectorCount: vectors.length, requestSizes, sleeps }));
    `);
    const result = JSON.parse(out);
    expect(result.requestSizes).toEqual([50, 10]);
    expect(result.vectorCount).toBe(60);
    expect(result.sleeps).toEqual([1000]);
  });

  it("retries once on 429 honoring Retry-After, then succeeds", () => {
    const out = runEmbedScript(`
      import { embedAll } from "./kb/embed.mjs";
      let calls = 0;
      const sleeps = [];
      const fetchFn = async (url, opts) => {
        calls++;
        const body = JSON.parse(opts.body);
        if (calls === 1) {
          return { ok: false, status: 429, headers: { get: (h) => (h === "retry-after" ? "2" : null) }, text: async () => "rate limited" };
        }
        return { ok: true, status: 200, json: async () => ({ embeddings: body.requests.map(() => ({ values: [9] })) }) };
      };
      const sleepFn = async (ms) => { sleeps.push(ms); };
      const vectors = await embedAll({ items: [{ text: "a" }], mode: "legacy", role: "document", apiKey: "k", fetchFn, sleepFn });
      process.stdout.write(JSON.stringify({ calls, sleeps, vectors }));
    `);
    const result = JSON.parse(out);
    expect(result.calls).toBe(2);
    expect(result.sleeps).toEqual([2000]);
    expect(result.vectors).toEqual([[9]]);
  });

  it("gives up after 3 tries on repeated 503 and throws", () => {
    const out = () =>
      runEmbedScript(`
        import { embedAll } from "./kb/embed.mjs";
        let calls = 0;
        const fetchFn = async () => {
          calls++;
          return { ok: false, status: 503, headers: { get: () => null }, text: async () => "unavailable" };
        };
        const sleepFn = async () => {};
        try {
          await embedAll({ items: [{ text: "a" }], mode: "legacy", role: "document", apiKey: "k", fetchFn, sleepFn });
        } catch (err) {
          process.stdout.write(JSON.stringify({ calls, message: err.message }));
          process.exit(0);
        }
      `);
    const result = JSON.parse(out());
    expect(result.calls).toBe(3);
    expect(result.message).toContain("503");
  });

  it("does not retry on a non-retryable 400 and throws immediately", () => {
    const out = () =>
      runEmbedScript(`
        import { embedAll } from "./kb/embed.mjs";
        let calls = 0;
        const fetchFn = async () => {
          calls++;
          return { ok: false, status: 400, headers: { get: () => null }, text: async () => "bad request" };
        };
        const sleepFn = async () => {};
        try {
          await embedAll({ items: [{ text: "a" }], mode: "legacy", role: "document", apiKey: "k", fetchFn, sleepFn });
        } catch (err) {
          process.stdout.write(JSON.stringify({ calls, message: err.message }));
          process.exit(0);
        }
      `);
    const result = JSON.parse(out());
    expect(result.calls).toBe(1);
    expect(result.message).toContain("400");
  });

  it("slices each returned embedding to 768 dimensions defensively", () => {
    const out = runEmbedScript(`
      import { embedAll } from "./kb/embed.mjs";
      const longVector = Array.from({ length: 900 }, (_, i) => i);
      const fetchFn = async (url, opts) => {
        const body = JSON.parse(opts.body);
        return { ok: true, status: 200, json: async () => ({ embeddings: body.requests.map(() => ({ values: longVector })) }) };
      };
      const vectors = await embedAll({ items: [{ text: "a" }], mode: "legacy", role: "document", apiKey: "k", fetchFn, sleepFn: async () => {} });
      process.stdout.write(JSON.stringify(vectors[0].length));
    `);
    expect(JSON.parse(out)).toBe(768);
  });
});
