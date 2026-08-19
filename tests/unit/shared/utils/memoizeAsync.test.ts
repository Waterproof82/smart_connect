/**
 * memoizeAsync Tests
 *
 * Generic async memoization used by the U3 Supabase chokepoint
 * (`getSupabase()`), extracted into a plain utility with NO `import.meta`
 * or `@supabase/supabase-js` dependency so it can be behaviorally tested
 * under this repo's ts-jest config (see supabaseClient.structure.test.ts
 * for why the real `supabaseClient.ts` module cannot be loaded directly
 * in Jest — combining `import.meta.env` with an `@supabase/supabase-js`
 * import in the same file breaks ts-jest's transform).
 */

import { memoizeAsync } from '@shared/utils/memoizeAsync';

describe('memoizeAsync', () => {
  it('calls the loader once and returns the same resolved value on repeat calls', async () => {
    const loader = jest.fn().mockResolvedValue({ __kind: 'value' });
    const getValue = memoizeAsync(loader);

    const first = await getValue();
    const second = await getValue();

    expect(first).toBe(second);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('does NOT cache a rejected loader call — a subsequent call retries', async () => {
    const loader = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ __kind: 'retry-value' });
    const getValue = memoizeAsync(loader);

    await expect(getValue()).rejects.toThrow('boom');

    const value = await getValue();

    expect(value).toEqual({ __kind: 'retry-value' });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('memoizes the value obtained after a retry — no further loader calls', async () => {
    const loader = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ __kind: 'retry-value' });
    const getValue = memoizeAsync(loader);

    await expect(getValue()).rejects.toThrow('boom');
    await getValue();
    const again = await getValue();

    expect(again).toEqual({ __kind: 'retry-value' });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('dedupes concurrent in-flight calls — loader invoked exactly once', async () => {
    let resolveLoader: (value: { __kind: string }) => void = () => {};
    const loader = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoader = resolve;
        }),
    );
    const getValue = memoizeAsync(loader);

    const p1 = getValue();
    const p2 = getValue();
    // Let the memoize wrapper's internal microtask hop invoke loader()
    // before we grab the resolve function it captured.
    await Promise.resolve();
    resolveLoader({ __kind: 'concurrent-value' });

    const [a, b] = await Promise.all([p1, p2]);

    expect(a).toBe(b);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('each independent loader that throws synchronously still surfaces as a rejected promise (no crash)', async () => {
    const loader = jest.fn().mockImplementation(() => {
      throw new Error('sync boom');
    });
    const getValue = memoizeAsync(loader);

    await expect(getValue()).rejects.toThrow('sync boom');
  });
});
