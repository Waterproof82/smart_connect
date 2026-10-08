/**
 * Persistence layer for the knowledge-base ingestion pipeline (design.md
 * rag-knowledge-base-refresh D14). Wraps the Unit 6 service-role RPCs
 * (`upsert_document`, `delete_stale_documents`) via an injected
 * supabase-js-shaped client — no real Supabase connection here, no network
 * imports. The orchestrator (Unit 7) injects the real client; tests inject
 * a minimal fake implementing the same `.from()/.rpc()` chain shape.
 *
 * `listLegacyRows`/`purgeLegacyRows` are the owner-gated `--purge-legacy`
 * mechanics (design D15, hardened per the 2026-10-08 production note:
 * `content_hash IS NULL` currently matches the 3 real admin-authored rows
 * — 'Carta Digital', 'Páginas web', 'nfc' — so this MUST default to a
 * dry-run listing and only delete when the caller explicitly passes
 * `confirm: true`).
 */

const SOURCE_PREFIX_RE = /^(site|faq|curated):/;

/** @param {number[]} embedding */
export function buildVectorLiteral(embedding) {
  return `[${embedding.join(",")}]`;
}

/**
 * @param {{ supabase: object, content: string, embedding: number[], metadata: object, source: string, contentHash: string }} params
 * @returns {Promise<string>} the upserted row id
 */
export async function upsertDocument({ supabase, content, embedding, metadata, source, contentHash }) {
  const { data, error } = await supabase.rpc("upsert_document", {
    p_content: content,
    p_embedding: buildVectorLiteral(embedding),
    p_metadata: metadata ?? {},
    p_source: source,
    p_content_hash: contentHash,
  });
  if (error) {
    throw new Error(`store.mjs: upsert_document failed for source=${source}: ${error.message}`);
  }
  return data;
}

/**
 * @param {{ supabase: object, keepHashes: string[] }} params
 * @returns {Promise<number>} deleted row count
 */
export async function deleteStaleDocuments({ supabase, keepHashes }) {
  const { data, error } = await supabase.rpc("delete_stale_documents", { p_keep_hashes: keepHashes });
  if (error) {
    throw new Error(`store.mjs: delete_stale_documents failed: ${error.message}`);
  }
  return data;
}

/**
 * All ingestion-managed (site:/faq:/curated:-tagged) content hashes
 * currently in `documents`, used to diff against freshly extracted chunks.
 * @param {{ supabase: object }} params
 * @returns {Promise<string[]>}
 */
export async function fetchExistingHashes({ supabase }) {
  const { data, error } = await supabase.from("documents").select("content_hash, source").not("content_hash", "is", null);
  if (error) {
    throw new Error(`store.mjs: fetchExistingHashes failed: ${error.message}`);
  }
  return (data ?? []).filter((row) => SOURCE_PREFIX_RE.test(row.source ?? "")).map((row) => row.content_hash);
}

/**
 * Lists every row with `content_hash IS NULL` (never deletes). On
 * production today this is exactly the 3 manual admin rows — list-only by
 * design so the owner can review before ever confirming a delete.
 * @param {{ supabase: object }} params
 */
export async function listLegacyRows({ supabase }) {
  const { data, error } = await supabase.from("documents").select("id, source, content").is("content_hash", null);
  if (error) {
    throw new Error(`store.mjs: listLegacyRows failed: ${error.message}`);
  }
  return data ?? [];
}

/**
 * `--purge-legacy`: defaults to a dry-run listing. Only deletes when the
 * caller explicitly passes `confirm: true` — owner must review the listed
 * rows first (see module doc: these are real admin-authored rows today).
 * @param {{ supabase: object, confirm?: boolean }} params
 */
export async function purgeLegacyRows({ supabase, confirm = false }) {
  const rows = await listLegacyRows({ supabase });
  if (!confirm || rows.length === 0) {
    return { rows, deleted: false, deletedCount: 0 };
  }

  const ids = rows.map((row) => row.id);
  const { error } = await supabase.from("documents").delete().in("id", ids);
  if (error) {
    throw new Error(`store.mjs: purgeLegacyRows delete failed: ${error.message}`);
  }
  return { rows, deleted: true, deletedCount: ids.length };
}
