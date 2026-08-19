/**
 * memoizeAsync Utility
 * @module shared/utils/memoizeAsync
 *
 * Wraps an async factory (`loader`) in a module-level cache: the first
 * call invokes `loader()` and caches the in-flight/resolved promise so
 * concurrent and subsequent calls await the SAME promise (no duplicate
 * work, single resolved value).
 *
 * Critically, a REJECTED loader call is NOT cached: the cache is cleared
 * before re-throwing, so the next call retries `loader()` from scratch.
 * Without this, a single transient failure (e.g. offline, a stale chunk
 * after deploy) would permanently poison every future call.
 *
 * Used by `@shared/supabaseClient`'s `getSupabase()` chokepoint to
 * memoize the dynamically-imported Supabase client. Kept as a plain,
 * dependency-free utility (no `import.meta`, no `@supabase/supabase-js`)
 * so it can be behaviorally unit-tested — see
 * `tests/unit/shared/utils/memoizeAsync.test.ts` and
 * `tests/unit/shared/supabaseClient.structure.test.ts` for why the real
 * `supabaseClient.ts` module cannot be loaded directly under this repo's
 * ts-jest config.
 */
export function memoizeAsync<T>(loader: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | null = null;

  return function getMemoized(): Promise<T> {
    if (!cached) {
      cached = Promise.resolve()
        .then(() => loader())
        .catch((error: unknown) => {
          cached = null;
          throw error;
        });
    }
    return cached;
  };
}
