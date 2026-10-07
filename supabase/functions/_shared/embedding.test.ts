/**
 * _shared/embedding Tests
 *
 * `buildEmbedRequest`/`parseEmbedResponse` are the pure (Deno-free)
 * embedding-contract modules shared by `chat-with-rag` (query side) and
 * `gemini-embedding` (document side). Same pattern as `_shared/generate.ts`
 * and `_shared/prompt.ts`: no imports, no `Deno.*`, so ts-jest can exercise
 * them directly.
 *
 * See design `sdd/rag-knowledge-base-refresh/design` D4:
 * - `EMBEDDING_MODE=legacy` (default) MUST produce a byte-identical request
 *   payload to today's: no `taskType`, no `outputDimensionality`, no `title`.
 *   Existing vectors in the `documents` table stay valid until re-embedding.
 * - `EMBEDDING_MODE=v2` adds `taskType: RETRIEVAL_QUERY|RETRIEVAL_DOCUMENT`,
 *   `outputDimensionality: 768`, and `title` (document role only, optional).
 * - `parseEmbedResponse` always returns a 768-length vector (defensive slice
 *   regardless of mode).
 */

import {
  buildEmbedRequest,
  parseEmbedResponse,
  resolveEmbeddingMode,
  EMBED_URL,
  EMBEDDING_DIMENSIONS,
  type EmbeddingMode,
} from './embedding';

describe('buildEmbedRequest — legacy mode (default)', () => {
  it('produces a byte-identical payload to the current request shape: only {content}', () => {
    const request = buildEmbedRequest('hola', { mode: 'legacy', role: 'query' });
    expect(request).toEqual({ content: { parts: [{ text: 'hola' }] } });
    expect(JSON.stringify(request)).toBe('{"content":{"parts":[{"text":"hola"}]}}');
  });

  it('never adds taskType, outputDimensionality or title, even for the document role with a title', () => {
    const request = buildEmbedRequest('contenido', {
      mode: 'legacy',
      role: 'document',
      title: 'Página de servicios',
    });
    expect(request).toEqual({ content: { parts: [{ text: 'contenido' }] } });
    expect(request).not.toHaveProperty('taskType');
    expect(request).not.toHaveProperty('outputDimensionality');
    expect(request).not.toHaveProperty('title');
  });
});

describe('buildEmbedRequest — v2 mode', () => {
  it('adds taskType RETRIEVAL_QUERY and outputDimensionality for the query role', () => {
    const request = buildEmbedRequest('hola', { mode: 'v2', role: 'query' });
    expect(request).toEqual({
      content: { parts: [{ text: 'hola' }] },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: EMBEDDING_DIMENSIONS,
    });
  });

  it('adds taskType RETRIEVAL_DOCUMENT and the title for the document role', () => {
    const request = buildEmbedRequest('contenido', {
      mode: 'v2',
      role: 'document',
      title: 'Página de servicios',
    });
    expect(request).toEqual({
      content: { parts: [{ text: 'contenido' }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: EMBEDDING_DIMENSIONS,
      title: 'Página de servicios',
    });
  });

  it('omits title for the document role when none is given', () => {
    const request = buildEmbedRequest('contenido', { mode: 'v2', role: 'document' });
    expect(request).not.toHaveProperty('title');
  });

  it('never attaches a title to the query role, even if one is passed', () => {
    const request = buildEmbedRequest('hola', {
      mode: 'v2',
      role: 'query',
      title: 'should be ignored',
    });
    expect(request).not.toHaveProperty('title');
  });
});

describe('parseEmbedResponse', () => {
  it('extracts and slices the embedding to 768 dimensions', () => {
    const values = Array.from({ length: 3072 }, (_, i) => i);
    const result = parseEmbedResponse({ embedding: { values } });
    expect(result).toHaveLength(768);
    expect(result[0]).toBe(0);
    expect(result[767]).toBe(767);
  });

  it('throws on a missing or empty embedding', () => {
    expect(() => parseEmbedResponse({})).toThrow('Invalid embedding response');
    expect(() => parseEmbedResponse({ embedding: { values: [] } })).toThrow(
      'Invalid embedding response',
    );
  });
});

describe('resolveEmbeddingMode', () => {
  it('defaults to legacy when the env var is unset or anything other than "v2"', () => {
    const cases: Array<string | undefined> = [undefined, '', 'legacy', 'V2', 'garbage'];
    for (const value of cases) {
      expect(resolveEmbeddingMode(value)).toBe('legacy');
    }
  });

  it('resolves to v2 only for the exact lowercase value "v2"', () => {
    expect(resolveEmbeddingMode('v2')).toBe('v2');
  });

  it('is assignable to the EmbeddingMode type', () => {
    const mode: EmbeddingMode = resolveEmbeddingMode('v2');
    expect(mode).toBe('v2');
  });
});

describe('EMBED_URL', () => {
  it('points at the gemini-embedding-001 model, unchanged from today', () => {
    expect(EMBED_URL).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
    );
  });
});
