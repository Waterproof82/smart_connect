/**
 * ChatRepositoryImpl Tests (U3 — Grounded Failure UX, design D7)
 *
 * The ungrounded fallback to `gemini-generate` is removed: when
 * `chat-with-rag` fails (e.g. a 503 `generation_unavailable` after both
 * primary and backup models fail — see `_shared/generate.ts`), the
 * repository MUST throw, NOT silently retry against an ungrounded model.
 * `gemini-generate` MUST never be invoked from this repository at all.
 */

import { ChatRepositoryImpl } from '@features/chatbot/data/repositories/ChatRepositoryImpl';

function makeSupabase(invokeImpl: jest.Mock): ConstructorParameters<typeof ChatRepositoryImpl>[0] {
  return { functions: { invoke: invokeImpl } } as unknown as ConstructorParameters<
    typeof ChatRepositoryImpl
  >[0];
}

describe('ChatRepositoryImpl.generateResponse', () => {
  it('calls chat-with-rag with the query, history and ragOptions', async () => {
    const invoke = jest.fn().mockResolvedValue({
      data: { response: 'Hola!', metadata: { sources: [] } },
      error: null,
    });
    const repo = new ChatRepositoryImpl(makeSupabase(invoke));

    const result = await repo.generateResponse({
      userQuery: '¿Hacen páginas web?',
      conversationHistory: [{ role: 'user', content: 'hola' }],
      ragOptions: { topK: 3, threshold: 0.5, source: 'site:/servicios' },
    });

    expect(result).toBe('Hola!');
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith('chat-with-rag', {
      body: {
        query: '¿Hacen páginas web?',
        conversationHistory: [{ role: 'user', parts: [{ text: 'hola' }] }],
        topK: 3,
        threshold: 0.5,
        source: 'site:/servicios',
      },
    });
  });

  it('applies default ragOptions (topK 5, threshold 0.4, source null) when none are given', async () => {
    const invoke = jest.fn().mockResolvedValue({
      data: { response: 'Hola!' },
      error: null,
    });
    const repo = new ChatRepositoryImpl(makeSupabase(invoke));

    await repo.generateResponse({ userQuery: 'hola' });

    expect(invoke).toHaveBeenCalledWith('chat-with-rag', {
      body: expect.objectContaining({ topK: 5, threshold: 0.4, source: null }),
    });
  });

  it('throws when chat-with-rag returns a 503 generation_unavailable error, and NEVER calls gemini-generate', async () => {
    const invoke = jest.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Edge Function returned a non-2xx status code',
        context: { status: 503 },
      },
    });
    const repo = new ChatRepositoryImpl(makeSupabase(invoke));

    await expect(repo.generateResponse({ userQuery: 'hola' })).rejects.toThrow(
      /RAG failed/,
    );

    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).not.toHaveBeenCalledWith('gemini-generate', expect.anything());
  });

  it('never references gemini-generate in its source (no ungrounded fallback path left)', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const source = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../../src/features/chatbot/data/repositories/ChatRepositoryImpl.ts',
      ),
      'utf-8',
    );
    expect(source).not.toMatch(/invoke\(\s*['"]gemini-generate['"]/);
    expect(source).not.toMatch(/_generateWithoutRAG/);
    expect(source).not.toMatch(/useRAG/);
  });
});
