/**
 * _shared/generate Tests
 *
 * `generateWithFailover` is the pure (Deno-free) generation module used by
 * `chat-with-rag`: it calls the primary Gemini model, aborts on timeout, and
 * retries exactly once against a backup model — never exceeding the caller's
 * `deadlineMs` budget. Same pattern as `notify-lead/_lib.ts`: no imports, no
 * `Deno.*`, fetch/clock injected so ts-jest can exercise it directly.
 *
 * See design `sdd/rag-knowledge-base-refresh/design` D1-D3.
 */

import { generateWithFailover, MODEL_NAME_REGEX, type GenerateRequestConfig } from './generate';

const PRIMARY = 'gemini-3.1-flash-lite';
const BACKUP = 'gemini-3.5-flash-lite';

const REQUEST: GenerateRequestConfig = {
  contents: [{ role: 'user', parts: [{ text: 'hola' }] }],
};

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function successBody(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

describe('MODEL_NAME_REGEX', () => {
  it('accepts well-formed Gemini model names', () => {
    expect(MODEL_NAME_REGEX.test('gemini-3.1-flash-lite')).toBe(true);
    expect(MODEL_NAME_REGEX.test('gemini-embedding-001')).toBe(true);
  });

  it('rejects anything that is not a plain model slug', () => {
    expect(MODEL_NAME_REGEX.test('gemini-3.1-flash-lite/../../secrets')).toBe(false);
    expect(MODEL_NAME_REGEX.test('GEMINI-3.1')).toBe(false);
    expect(MODEL_NAME_REGEX.test('')).toBe(false);
    expect(MODEL_NAME_REGEX.test('not-gemini')).toBe(false);
  });
});

describe('generateWithFailover', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the primary answer on the first try, without calling the backup', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, successBody('hola!')));
    const now = jest.fn().mockReturnValue(0);

    const result = await generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn,
      now,
      deadlineMs: 20_000,
    });

    expect(result).toEqual({
      ok: true,
      text: 'hola!',
      modelUsed: PRIMARY,
      attempts: [{ model: PRIMARY, outcome: 'success' }],
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toContain(PRIMARY);
    expect(init.headers['x-goog-api-key']).toBe('test-key');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('aborts the primary call on timeout and retries once on the backup model', async () => {
    jest.useFakeTimers();
    const now = jest.fn().mockReturnValue(0);
    const fetchFn = jest.fn((url: string, init: RequestInit) => {
      if (url.includes(PRIMARY)) {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      }
      return Promise.resolve(jsonResponse(200, successBody('respuesta de backup')));
    });

    const resultPromise = generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn: fetchFn as unknown as typeof fetch,
      now,
      deadlineMs: 20_000,
    });

    await jest.advanceTimersByTimeAsync(10_000);
    const result = await resultPromise;

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.modelUsed).toBe(BACKUP);
      expect(result.text).toBe('respuesta de backup');
    }
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn.mock.calls[1][0]).toContain(BACKUP);
  });

  it.each([429, 404, 503])(
    'fails over to the backup model on a %d response from the primary',
    async (status) => {
      const now = jest.fn().mockReturnValue(0);
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce(jsonResponse(status, { error: { message: 'boom' } }))
        .mockResolvedValueOnce(jsonResponse(200, successBody('ok backup')));

      const result = await generateWithFailover({
        models: [PRIMARY, BACKUP],
        apiKey: 'test-key',
        request: REQUEST,
        fetchFn,
        now,
        deadlineMs: 20_000,
      });

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.modelUsed).toBe(BACKUP);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    }
  );

  it.each([400, 401, 403])(
    'does NOT retry on a %d response — same fault on both models',
    async (status) => {
      const now = jest.fn().mockReturnValue(0);
      const fetchFn = jest.fn().mockResolvedValue(jsonResponse(status, { error: { message: 'bad request' } }));

      const result = await generateWithFailover({
        models: [PRIMARY, BACKUP],
        apiKey: 'test-key',
        request: REQUEST,
        fetchFn,
        now,
        deadlineMs: 20_000,
      });

      expect(result.ok).toBe(false);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    }
  );

  it('treats a 200 with no candidates and no blockReason as retryable (empty answer)', async () => {
    const now = jest.fn().mockReturnValue(0);
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, {}))
      .mockResolvedValueOnce(jsonResponse(200, successBody('backup saved the day')));

    const result = await generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn,
      now,
      deadlineMs: 20_000,
    });

    expect(result.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry a 200 with no candidates when promptFeedback.blockReason is set (safety block)', async () => {
    const now = jest.fn().mockReturnValue(0);
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { promptFeedback: { blockReason: 'SAFETY' } }));

    const result = await generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn,
      now,
      deadlineMs: 20_000,
    });

    expect(result.ok).toBe(false);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('skips the backup call when less than minRemainingForBackupMs remains of the 20s ceiling', async () => {
    const now = jest.fn().mockReturnValueOnce(0).mockReturnValue(18_500); // remaining = 1500ms < 3000ms
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(503, {}));

    const result = await generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn,
      now,
      deadlineMs: 20_000,
    });

    expect(result.ok).toBe(false);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('returns a failure without calling fetch when the budget is already exhausted', async () => {
    const now = jest.fn().mockReturnValue(0);
    const fetchFn = jest.fn();

    const result = await generateWithFailover({
      models: [PRIMARY, BACKUP],
      apiKey: 'test-key',
      request: REQUEST,
      fetchFn,
      now,
      deadlineMs: 0,
    });

    expect(result).toEqual({ ok: false, attempts: [] });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('throws synchronously on an invalid model name instead of building an unsafe URL', async () => {
    const fetchFn = jest.fn();
    await expect(
      generateWithFailover({
        models: ['gemini-ok', '../../etc/passwd'],
        apiKey: 'test-key',
        request: REQUEST,
        fetchFn,
        now: () => 0,
        deadlineMs: 20_000,
      })
    ).rejects.toThrow(/invalid.*model/i);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
