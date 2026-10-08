import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D12/D14 — scripts/kb/store.mjs is
// plain ESM wrapping the Unit 6 RPCs (`upsert_document`,
// `delete_stale_documents`) via an injected supabase-js-shaped client — no
// real Supabase connection in these tests, same injectable-core pattern as
// scripts/kb/embed.mjs. Subprocess convention per tests/unit/scripts/kbHash.test.ts.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

function runStoreScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/store.mjs — buildVectorLiteral", () => {
  it("formats a number array as a pgvector literal string", () => {
    const out = runStoreScript(`
      import { buildVectorLiteral } from "./kb/store.mjs";
      process.stdout.write(JSON.stringify(buildVectorLiteral([0.1, 0.2, 0.3])));
    `);
    expect(JSON.parse(out)).toBe("[0.1,0.2,0.3]");
  });
});

describe("scripts/kb/store.mjs — upsertDocument (design.md D14, RPC upsert_document)", () => {
  it("calls supabase.rpc('upsert_document', ...) with p_-prefixed args and a vector-literal embedding", () => {
    const out = runStoreScript(`
      import { upsertDocument } from "./kb/store.mjs";
      let captured;
      const supabase = { rpc: async (name, args) => { captured = { name, args }; return { data: "new-id", error: null }; } };
      const id = await upsertDocument({
        supabase,
        content: "Hacemos páginas web",
        embedding: [0.1, 0.2],
        metadata: { url: "/x", title: "T", section: "S", lang: "es", source: "site:/x" },
        source: "site:/x",
        contentHash: "abc123",
      });
      process.stdout.write(JSON.stringify({ id, captured }));
    `);
    const { id, captured } = JSON.parse(out);
    expect(id).toBe("new-id");
    expect(captured.name).toBe("upsert_document");
    expect(captured.args).toEqual({
      p_content: "Hacemos páginas web",
      p_embedding: "[0.1,0.2]",
      p_metadata: { url: "/x", title: "T", section: "S", lang: "es", source: "site:/x" },
      p_source: "site:/x",
      p_content_hash: "abc123",
    });
  });

  it("throws a descriptive error (including the source) when the RPC returns an error", () => {
    const out = () =>
      runStoreScript(`
        import { upsertDocument } from "./kb/store.mjs";
        const supabase = { rpc: async () => ({ data: null, error: { message: "boom" } }) };
        try {
          await upsertDocument({ supabase, content: "c", embedding: [1], metadata: {}, source: "site:/x", contentHash: "h" });
        } catch (err) {
          process.stdout.write(JSON.stringify(err.message));
          process.exit(0);
        }
      `);
    const message = JSON.parse(out());
    expect(message).toContain("site:/x");
    expect(message).toContain("boom");
  });
});

describe("scripts/kb/store.mjs — deleteStaleDocuments (design.md D14, RPC delete_stale_documents)", () => {
  it("calls supabase.rpc('delete_stale_documents', { p_keep_hashes }) and returns the deleted count", () => {
    const out = runStoreScript(`
      import { deleteStaleDocuments } from "./kb/store.mjs";
      let captured;
      const supabase = { rpc: async (name, args) => { captured = { name, args }; return { data: 3, error: null }; } };
      const deletedCount = await deleteStaleDocuments({ supabase, keepHashes: ["h1", "h2"] });
      process.stdout.write(JSON.stringify({ deletedCount, captured }));
    `);
    const { deletedCount, captured } = JSON.parse(out);
    expect(deletedCount).toBe(3);
    expect(captured).toEqual({ name: "delete_stale_documents", args: { p_keep_hashes: ["h1", "h2"] } });
  });

  it("propagates the RPC's fail-closed error when keepHashes is empty", () => {
    const out = () =>
      runStoreScript(`
        import { deleteStaleDocuments } from "./kb/store.mjs";
        const supabase = { rpc: async () => ({ data: null, error: { message: "p_keep_hashes must not be empty" } }) };
        try {
          await deleteStaleDocuments({ supabase, keepHashes: [] });
        } catch (err) {
          process.stdout.write(JSON.stringify(err.message));
          process.exit(0);
        }
      `);
    expect(JSON.parse(out())).toContain("must not be empty");
  });
});

describe("scripts/kb/store.mjs — fetchExistingHashes", () => {
  it("returns only content_hash values whose source is site:/faq:/curated:-tagged, excluding admin rows", () => {
    const out = runStoreScript(`
      import { fetchExistingHashes } from "./kb/store.mjs";
      const rows = [
        { content_hash: "h1", source: "site:/carta-digital" },
        { content_hash: "h2", source: "faq:/" },
        { content_hash: "h3", source: "curated:servicios-web.md" },
        { content_hash: null, source: "Carta Digital" },
        { content_hash: null, source: "nfc" },
      ];
      const supabase = { from: () => ({ select: () => ({ not: () => Promise.resolve({ data: rows, error: null }) }) }) };
      const hashes = await fetchExistingHashes({ supabase });
      process.stdout.write(JSON.stringify(hashes.sort()));
    `);
    expect(JSON.parse(out)).toEqual(["h1", "h2", "h3"]);
  });

  it("throws when the select fails", () => {
    const out = () =>
      runStoreScript(`
        import { fetchExistingHashes } from "./kb/store.mjs";
        const supabase = { from: () => ({ select: () => ({ not: () => Promise.resolve({ data: null, error: { message: "db down" } }) }) }) };
        try {
          await fetchExistingHashes({ supabase });
        } catch (err) {
          process.stdout.write(JSON.stringify(err.message));
          process.exit(0);
        }
      `);
    expect(JSON.parse(out())).toContain("db down");
  });
});

describe("scripts/kb/store.mjs — listLegacyRows / purgeLegacyRows (owner-gated, content_hash IS NULL)", () => {
  it("listLegacyRows lists content_hash IS NULL rows without deleting anything", () => {
    const out = runStoreScript(`
      import { listLegacyRows } from "./kb/store.mjs";
      const rows = [{ id: 1, source: "Carta Digital", content: "..." }, { id: 2, source: "nfc", content: "..." }];
      const supabase = { from: () => ({ select: () => ({ is: () => Promise.resolve({ data: rows, error: null }) }) }) };
      const result = await listLegacyRows({ supabase });
      process.stdout.write(JSON.stringify(result));
    `);
    expect(JSON.parse(out)).toHaveLength(2);
  });

  it("purgeLegacyRows defaults to dry-run (confirm=false): lists rows, deletes nothing", () => {
    const out = runStoreScript(`
      import { purgeLegacyRows } from "./kb/store.mjs";
      let deleteCalled = false;
      const rows = [{ id: 1, source: "Carta Digital", content: "..." }];
      const supabase = {
        from: () => ({
          select: () => ({ is: () => Promise.resolve({ data: rows, error: null }) }),
          delete: () => { deleteCalled = true; return { in: () => Promise.resolve({ error: null }) }; },
        }),
      };
      const result = await purgeLegacyRows({ supabase });
      process.stdout.write(JSON.stringify({ result, deleteCalled }));
    `);
    const { result, deleteCalled } = JSON.parse(out);
    expect(result.deleted).toBe(false);
    expect(result.deletedCount).toBe(0);
    expect(result.rows).toHaveLength(1);
    expect(deleteCalled).toBe(false);
  });

  it("purgeLegacyRows only deletes when confirm=true is explicitly passed", () => {
    const out = runStoreScript(`
      import { purgeLegacyRows } from "./kb/store.mjs";
      let deletedIds;
      const rows = [{ id: 1, source: "Carta Digital", content: "..." }, { id: 2, source: "nfc", content: "..." }];
      const supabase = {
        from: () => ({
          select: () => ({ is: () => Promise.resolve({ data: rows, error: null }) }),
          delete: () => ({ in: (col, ids) => { deletedIds = ids; return Promise.resolve({ error: null }); } }),
        }),
      };
      const result = await purgeLegacyRows({ supabase, confirm: true });
      process.stdout.write(JSON.stringify({ result, deletedIds }));
    `);
    const { result, deletedIds } = JSON.parse(out);
    expect(result.deleted).toBe(true);
    expect(result.deletedCount).toBe(2);
    expect(deletedIds).toEqual([1, 2]);
  });
});
