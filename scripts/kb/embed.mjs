/**
 * Document-side embedding for the knowledge-base ingestion pipeline
 * (design.md rag-knowledge-base-refresh D5/D13). No Deno/fs imports — the
 * orchestrator (Unit 7) injects `fetchFn`/`sleepFn` so this stays unit
 * testable without real network calls or real timers.
 *
 * `EMBED_MODEL`/`EMBED_DIMENSIONS` deliberately mirror (not import)
 * `supabase/functions/_shared/embedding.ts`'s `EMBEDDING_MODEL`/
 * `EMBEDDING_DIMENSIONS` — same duplication rationale as `kb/hash.mjs`: this
 * is a plain Node `.mjs`, that file is a Deno-free TS module meant for
 * ts-jest/Edge runtime, not a Node import target without a build step.
 * `tests/unit/scripts/kbEmbed.test.ts` asserts the two stay in sync.
 */

export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIMENSIONS = 768;
export const EMBED_BATCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents`;

export const MAX_BATCH_SIZE = 50;
export const BATCH_SPACING_MS = 1000;
export const MAX_RETRIES = 3;

/** @param {{text: string, title?: string}} item */
function buildSingleRequest(item, { mode, role }) {
  const base = { model: `models/${EMBED_MODEL}`, content: { parts: [{ text: item.text }] } };
  if (mode !== "v2") return base;

  const taskType = role === "document" ? "RETRIEVAL_DOCUMENT" : "RETRIEVAL_QUERY";
  return {
    ...base,
    taskType,
    outputDimensionality: EMBED_DIMENSIONS,
    ...(role === "document" && item.title ? { title: item.title } : {}),
  };
}

/**
 * @param {{text: string, title?: string}[]} items
 * @param {{mode: "legacy"|"v2", role: "document"|"query"}} params
 */
export function buildBatchRequest(items, { mode, role }) {
  return { requests: items.map((item) => buildSingleRequest(item, { mode, role })) };
}

function parseRetryAfterMs(response) {
  const header = response.headers?.get?.("retry-after");
  if (!header) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

async function embedBatchOnce({ items, mode, role, apiKey, fetchFn, sleepFn, attempt, maxRetries }) {
  const response = await fetchFn(EMBED_BATCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(buildBatchRequest(items, { mode, role })),
  });

  if (response.ok) {
    const data = await response.json();
    const embeddings = data.embeddings;
    if (!Array.isArray(embeddings) || embeddings.length !== items.length) {
      throw new Error(
        `embed.mjs: unexpected batchEmbedContents response shape (${embeddings?.length} embeddings for ${items.length} items)`,
      );
    }
    return embeddings.map((e) => (e.values ?? []).slice(0, EMBED_DIMENSIONS));
  }

  const retryable = response.status === 429 || response.status >= 500;
  if (!retryable || attempt >= maxRetries) {
    const bodyText = await response.text?.().catch(() => "");
    throw new Error(`embed.mjs: batchEmbedContents failed with ${response.status} ${bodyText ?? ""}`.trim());
  }

  const backoffMs = parseRetryAfterMs(response) ?? 2 ** attempt * 1000;
  await sleepFn(backoffMs);
  return embedBatchOnce({ items, mode, role, apiKey, fetchFn, sleepFn, attempt: attempt + 1, maxRetries });
}

/**
 * Embeds up to MAX_BATCH_SIZE items in a single `batchEmbedContents` call,
 * retrying on 429/5xx (honoring `Retry-After` when present) up to
 * `maxRetries` tries total.
 */
export async function embedBatch({ items, mode, role, apiKey, fetchFn, sleepFn, maxRetries = MAX_RETRIES }) {
  return embedBatchOnce({ items, mode, role, apiKey, fetchFn, sleepFn, attempt: 1, maxRetries });
}

/**
 * Embeds an arbitrary number of items, chunked into batches of
 * `batchSize` (default 50), sleeping `spacingMs` (default 1000ms) between
 * batches (never after the last) to stay within rate limits.
 *
 * @returns {Promise<number[][]>} embeddings in the same order as `items`.
 */
export async function embedAll({
  items,
  mode,
  role,
  apiKey,
  fetchFn,
  sleepFn,
  batchSize = MAX_BATCH_SIZE,
  spacingMs = BATCH_SPACING_MS,
  maxRetries = MAX_RETRIES,
}) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const vectors = await embedBatch({ items: batch, mode, role, apiKey, fetchFn, sleepFn, maxRetries });
    results.push(...vectors);
    if (i + batchSize < items.length) {
      await sleepFn(spacingMs);
    }
  }
  return results;
}
