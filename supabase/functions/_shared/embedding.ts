// ========================================
// chat-with-rag / gemini-embedding — embedding contract (Deno-free)
// ========================================
// This module MUST NOT import anything and MUST NOT reference `Deno.*`.
// Keeping it import-free lets `ts-jest` load and unit-test it directly, even
// though it runs on the Deno Edge runtime (see `_shared/generate.ts` and
// `_shared/prompt.ts` for the same pattern). Shared by BOTH `chat-with-rag`
// (query-side embedding of the user's question) and `gemini-embedding`
// (document-side embedding, called by the admin KB ingestion pipeline).
//
// See design `sdd/rag-knowledge-base-refresh/design` D4:
// - `EMBEDDING_MODE=legacy` (default) produces a byte-identical payload to
//   today's: `{content:{parts:[{text}]}}`, no `taskType`, no
//   `outputDimensionality`, no `title`. Existing vectors in the `documents`
//   table stay valid until re-embedding completes.
// - `EMBEDDING_MODE=v2` adds `taskType: RETRIEVAL_QUERY|RETRIEVAL_DOCUMENT`,
//   `outputDimensionality: 768`, and (document role only) an optional
//   `title`. Model stays `gemini-embedding-001` in both modes.
// - The response is always sliced to 768 dimensions defensively, regardless
//   of mode (the 768 pgvector column is a hard invariant).

export type EmbeddingMode = 'legacy' | 'v2';
export type EmbeddingRole = 'query' | 'document';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIMENSIONS = 768;
export const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

export interface BuildEmbedRequestParams {
  readonly mode: EmbeddingMode;
  readonly role: EmbeddingRole;
  /** Only ever attached in v2 mode, and only for the document role. */
  readonly title?: string;
}

export interface EmbedRequestBody {
  readonly content: { readonly parts: ReadonlyArray<{ readonly text: string }> };
  readonly taskType?: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT';
  readonly outputDimensionality?: number;
  readonly title?: string;
}

/**
 * Builds the Gemini `embedContent` request body. Legacy mode MUST stay
 * byte-identical to the pre-refactor payload (no extra keys at all) so
 * existing vectors remain valid until the mode flag is flipped post re-embed.
 */
export function buildEmbedRequest(text: string, params: BuildEmbedRequestParams): EmbedRequestBody {
  const { mode, role, title } = params;

  if (mode !== 'v2') {
    return { content: { parts: [{ text }] } };
  }

  const taskType = role === 'document' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY';
  return {
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: EMBEDDING_DIMENSIONS,
    ...(role === 'document' && title ? { title } : {}),
  };
}

export interface EmbedResponseBody {
  readonly embedding?: { readonly values?: ReadonlyArray<number> };
}

/** Extracts the embedding vector and defensively slices it to 768 dimensions. */
export function parseEmbedResponse(data: EmbedResponseBody): number[] {
  const values = data.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Invalid embedding response');
  }
  return values.slice(0, EMBEDDING_DIMENSIONS);
}

/** `EMBEDDING_MODE` env flag resolver — anything other than the exact string "v2" is legacy. */
export function resolveEmbeddingMode(envValue: string | undefined): EmbeddingMode {
  return envValue === 'v2' ? 'v2' : 'legacy';
}
