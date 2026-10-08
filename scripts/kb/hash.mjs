import { createHash } from "node:crypto";

/**
 * Content hashing for idempotent upsert/stale-cleanup (design.md
 * rag-knowledge-base-refresh D12). No fs/Deno/network imports.
 *
 * `contractVersion` ties the hash to the embedding model + mode + output
 * dimensions used in `supabase/functions/_shared/embedding.ts`, so flipping
 * `EMBEDDING_MODE` (legacy→v2) changes every hash and forces a full re-embed
 * instead of silently reusing stale vectors under the same content_hash.
 */

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

/** @param {"legacy" | "v2"} mode */
export function buildContractVersion(mode) {
  return `${EMBEDDING_MODEL}:${mode}:${EMBEDDING_DIMENSIONS}`;
}

/**
 * `content_hash = sha256(contractVersion\nsource\nurl\nsection\nnormalizedContent)`.
 * @param {{ contractVersion: string, source: string, url?: string, section: string, content: string }} input
 * @returns {string} lowercase hex sha256 digest
 */
export function computeContentHash({ contractVersion, source, url = "", section, content }) {
  const normalizedContent = content.trim();
  const payload = [contractVersion, source, url, section, normalizedContent].join("\n");
  return createHash("sha256").update(payload, "utf-8").digest("hex");
}
