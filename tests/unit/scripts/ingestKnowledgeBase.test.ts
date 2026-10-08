import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D8-D15 — scripts/ingest-knowledge-base.mjs
// is the Unit 7 orchestrator: a pure, injectable core (`runIngestion` +
// exported helpers) plus a thin CLI entry (not exercised here). Subprocess
// convention per tests/unit/scripts/kbHash.test.ts — ts-jest cannot
// import() a .mjs directly.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

function runIngestScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/ingest-knowledge-base.mjs — assertNoTodoLeak (design.md D10 hard invariant)", () => {
  it("throws when any record's content still contains the literal token TODO", () => {
    const out = () =>
      runIngestScript(`
        import { assertNoTodoLeak } from "./ingest-knowledge-base.mjs";
        try {
          assertNoTodoLeak([
            { source: "curated:x.md", content: "Precio TODO(owner) confirmar" },
          ]);
        } catch (err) {
          process.stdout.write(JSON.stringify(err.message));
          process.exit(0);
        }
      `);
    expect(JSON.parse(out())).toContain("curated:x.md");
  });

  it("does not throw for confirmed content with no TODO token, including the Spanish word 'todo'", () => {
    const out = runIngestScript(`
      import { assertNoTodoLeak } from "./ingest-knowledge-base.mjs";
      assertNoTodoLeak([{ source: "site:/", content: "Todo lo que necesitas para digitalizar tu negocio." }]);
      process.stdout.write(JSON.stringify("ok"));
    `);
    expect(JSON.parse(out)).toBe("ok");
  });
});

describe("scripts/ingest-knowledge-base.mjs — collectCuratedChunks (design.md D9/D11)", () => {
  it("skips draft files, strips TODO sections via parseCuratedFile, and chunks the remaining body", () => {
    const raw = [
      "---",
      "title: Servicios Web",
      "lang: es",
      "url: /servicios-web",
      "---",
      "## Servicios confirmados",
      "Hacemos páginas web personalizadas para negocios locales, con buen SEO y carga rápida.",
      "",
      "## Precios TODO(owner)",
      "Precio final a confirmar con el cliente.",
    ].join("\n");
    const out = runIngestScript(`
      import { collectCuratedChunks } from "./ingest-knowledge-base.mjs";
      const records = collectCuratedChunks({ files: [{ filePath: "servicios-web.md", raw: ${JSON.stringify(raw)} }] });
      process.stdout.write(JSON.stringify(records.map((r) => ({ source: r.source, url: r.url, section: r.section, hasTodo: r.content.includes("TODO") }))));
    `);
    const records = JSON.parse(out);
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r: { hasTodo: boolean }) => !r.hasTodo)).toBe(true);
    expect(records[0].source).toBe("curated:servicios-web.md");
    expect(records[0].url).toBe("/servicios-web");
  });

  it("skips a file entirely when frontmatter has draft: true", () => {
    const raw = ["---", "title: Borrador", "lang: es", "draft: true", "---", "## X", "Contenido largo suficiente para pasar el chunker de pruebas."].join("\n");
    const out = runIngestScript(`
      import { collectCuratedChunks } from "./ingest-knowledge-base.mjs";
      const records = collectCuratedChunks({ files: [{ filePath: "borrador.md", raw: ${JSON.stringify(raw)} }] });
      process.stdout.write(JSON.stringify(records));
    `);
    expect(JSON.parse(out)).toEqual([]);
  });
});

describe("scripts/ingest-knowledge-base.mjs — hashRecords / diffAgainstExisting (design.md D12)", () => {
  it("diff separates new vs unchanged records by content_hash and returns the full keep set", () => {
    const out = runIngestScript(`
      import { hashRecords, diffAgainstExisting } from "./ingest-knowledge-base.mjs";
      const records = [
        { source: "site:/a", url: "/a", section: "S1", content: "Contenido A suficientemente largo para no ser descartado." },
        { source: "site:/b", url: "/b", section: "S2", content: "Contenido B suficientemente largo para no ser descartado." },
      ];
      const hashed = hashRecords(records, { mode: "legacy" });
      const existing = [hashed[0].contentHash];
      const { newRecords, keepHashes, unchangedCount } = diffAgainstExisting(hashed, existing);
      process.stdout.write(JSON.stringify({
        newCount: newRecords.length,
        newSources: newRecords.map((r) => r.source),
        keepCount: keepHashes.length,
        unchangedCount,
      }));
    `);
    const result = JSON.parse(out);
    expect(result.newCount).toBe(1);
    expect(result.newSources).toEqual(["site:/b"]);
    expect(result.keepCount).toBe(2);
    expect(result.unchangedCount).toBe(1);
  });

  it("hashing the same record twice under the same mode is deterministic; changing mode changes the hash", () => {
    const out = runIngestScript(`
      import { hashRecords } from "./ingest-knowledge-base.mjs";
      const record = [{ source: "site:/a", url: "/a", section: "S1", content: "Mismo contenido para probar el hash." }];
      const legacy1 = hashRecords(record, { mode: "legacy" })[0].contentHash;
      const legacy2 = hashRecords(record, { mode: "legacy" })[0].contentHash;
      const v2 = hashRecords(record, { mode: "v2" })[0].contentHash;
      process.stdout.write(JSON.stringify({ sameLegacy: legacy1 === legacy2, differsOnModeFlip: legacy1 !== v2 }));
    `);
    expect(JSON.parse(out)).toEqual({ sameLegacy: true, differsOnModeFlip: true });
  });
});

/** Minimal in-memory fake supabase client shared across the integration tests below. */
const FAKE_SUPABASE_SOURCE = `
  function createFakeSupabase() {
    const rows = new Map();
    let nextId = 1;
    return {
      rows,
      from(table) {
        if (table !== "documents") throw new Error("unexpected table " + table);
        return {
          select() {
            return {
              not() {
                return Promise.resolve({
                  data: [...rows.values()]
                    .filter((r) => r.content_hash !== null)
                    .map((r) => ({ content_hash: r.content_hash, source: r.source })),
                  error: null,
                });
              },
              is() {
                return Promise.resolve({
                  data: [...rows.values()].filter((r) => r.content_hash === null),
                  error: null,
                });
              },
            };
          },
          delete() {
            return {
              in(col, ids) {
                for (const [k, r] of rows) if (ids.includes(r.id)) rows.delete(k);
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      },
      async rpc(name, args) {
        if (name === "upsert_document") {
          const key = args.p_content_hash;
          const existing = rows.get(key);
          const id = existing?.id ?? nextId++;
          rows.set(key, { id, content: args.p_content, source: args.p_source, content_hash: key });
          return { data: id, error: null };
        }
        if (name === "delete_stale_documents") {
          if (!args.p_keep_hashes || args.p_keep_hashes.length === 0) {
            return { data: null, error: { message: "p_keep_hashes must not be empty" } };
          }
          let deleted = 0;
          for (const [k, r] of rows) {
            if (/^(site|faq|curated):/.test(r.source) && !args.p_keep_hashes.includes(k)) {
              rows.delete(k);
              deleted++;
            }
          }
          return { data: deleted, error: null };
        }
        throw new Error("unexpected rpc " + name);
      },
    };
  }
  const fakeFetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    return { ok: true, status: 200, json: async () => ({ embeddings: body.requests.map(() => ({ values: new Array(768).fill(0.05) })) }) };
  };
`;

describe("scripts/ingest-knowledge-base.mjs — runIngestion dry-run (no network writes)", () => {
  it("computes chunks/hashes and reports counts without calling supabase or fetch", () => {
    const out = runIngestScript(`
      import { runIngestion } from "./ingest-knowledge-base.mjs";
      const html = '<html><head><title>Carta Digital</title></head><body><main><h2>Servicios</h2><p>' + 'Hacemos carta digital para restaurantes y tiendas. '.repeat(5) + '</p></main></body></html>';
      const readDistHtml = async (route) => (route === "/carta-digital" ? html : null);
      let supabaseCalled = false;
      let fetchCalled = false;
      const supabase = { rpc: async () => { supabaseCalled = true; }, from: () => { supabaseCalled = true; } };
      const fetchFn = async () => { fetchCalled = true; };
      const env = { GEMINI_API_KEY: "k", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "s" };
      const siteRoutesConfig = { origin: "https://digitalizatenerife.es", routes: [{ path: "/carta-digital" }] };
      const result = await runIngestion({ env, dryRun: true, siteRoutesConfig, readDistHtml, curatedFiles: [], supabase, fetchFn, sleepFn: async () => {} });
      process.stdout.write(JSON.stringify({ result, supabaseCalled, fetchCalled }));
    `);
    const { result, supabaseCalled, fetchCalled } = JSON.parse(out);
    expect(result.dryRun).toBe(true);
    expect(result.totalChunks).toBeGreaterThan(0);
    expect(supabaseCalled).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it("refuses to run when zero chunks are produced (empty keep-set guard)", () => {
    const out = () =>
      runIngestScript(`
        import { runIngestion } from "./ingest-knowledge-base.mjs";
        const readDistHtml = async () => null;
        const env = { GEMINI_API_KEY: "k", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "s" };
        const siteRoutesConfig = { origin: "https://digitalizatenerife.es", routes: [] };
        try {
          await runIngestion({ env, dryRun: true, siteRoutesConfig, readDistHtml, curatedFiles: [], supabase: {}, fetchFn: async () => {}, sleepFn: async () => {} });
        } catch (err) {
          process.stdout.write(JSON.stringify(err.message));
          process.exit(0);
        }
      `);
    expect(JSON.parse(out())).toContain("zero chunks");
  });
});

describe("scripts/ingest-knowledge-base.mjs — runIngestion integration: run twice (spec kb-ingestion, design D12)", () => {
  it("produces an identical final row count on a second run of unchanged content, embedding nothing new", () => {
    const out = runIngestScript(`
      import { runIngestion } from "./ingest-knowledge-base.mjs";
      ${FAKE_SUPABASE_SOURCE}
      const html = '<html><head><title>Carta Digital</title></head><body><main><h2>Servicios</h2><p>' + 'Hacemos carta digital para restaurantes y tiendas. '.repeat(5) + '</p></main></body></html>';
      const readDistHtml = async (route) => (route === "/carta-digital" ? html : null);
      const supabase = createFakeSupabase();
      const env = { GEMINI_API_KEY: "k", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "s" };
      const siteRoutesConfig = { origin: "https://digitalizatenerife.es", routes: [{ path: "/carta-digital" }] };
      const opts = { env, siteRoutesConfig, readDistHtml, curatedFiles: [], supabase, fetchFn: fakeFetch, sleepFn: async () => {} };

      const run1 = await runIngestion(opts);
      const countAfterRun1 = supabase.rows.size;
      const run2 = await runIngestion(opts);
      const countAfterRun2 = supabase.rows.size;

      process.stdout.write(JSON.stringify({
        run1New: run1.newCount, run2New: run2.newCount,
        countAfterRun1, countAfterRun2,
      }));
    `);
    const result = JSON.parse(out);
    expect(result.run1New).toBeGreaterThan(0);
    expect(result.run2New).toBe(0);
    expect(result.countAfterRun1).toBe(result.countAfterRun2);
  });

  it("deletes stale rows whose source/url no longer appears in the current extraction", () => {
    const out = runIngestScript(`
      import { runIngestion } from "./ingest-knowledge-base.mjs";
      ${FAKE_SUPABASE_SOURCE}
      const htmlA = '<html><head><title>Carta Digital</title></head><body><main><h2>Servicios</h2><p>' + 'Hacemos carta digital para restaurantes y tiendas. '.repeat(5) + '</p></main></body></html>';
      const supabase = createFakeSupabase();
      const env = { GEMINI_API_KEY: "k", SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "s" };

      const run1 = await runIngestion({
        env,
        siteRoutesConfig: { origin: "https://digitalizatenerife.es", routes: [{ path: "/carta-digital" }, { path: "/tarjetas-nfc" }] },
        readDistHtml: async (route) => (route === "/carta-digital" || route === "/tarjetas-nfc" ? htmlA : null),
        curatedFiles: [],
        supabase,
        fetchFn: fakeFetch,
        sleepFn: async () => {},
      });
      const countAfterRun1 = supabase.rows.size;

      const run2 = await runIngestion({
        env,
        siteRoutesConfig: { origin: "https://digitalizatenerife.es", routes: [{ path: "/carta-digital" }] },
        readDistHtml: async (route) => (route === "/carta-digital" ? htmlA : null),
        curatedFiles: [],
        supabase,
        fetchFn: fakeFetch,
        sleepFn: async () => {},
      });

      process.stdout.write(JSON.stringify({ countAfterRun1, run2Deleted: run2.deletedCount, countAfterRun2: supabase.rows.size }));
    `);
    const result = JSON.parse(out);
    expect(result.run2Deleted).toBeGreaterThan(0);
    expect(result.countAfterRun2).toBeLessThan(result.countAfterRun1);
  });
});
