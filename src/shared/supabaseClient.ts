/**
 * Supabase Client — Async Chokepoint (U3: deferred load)
 *
 * Uses VITE_ prefixed env vars (safe to expose in the browser).
 * Edge Functions are called via supabase.functions.invoke().
 *
 * This module deliberately has NO static, top-level import of
 * `@supabase/supabase-js` — only a type-only import (erased at compile
 * time, zero runtime edge). The SDK is fetched exclusively via the
 * dynamic `import()` inside `loadClient()`, which only ever runs once a
 * consumer actually calls `getSupabase()` (e.g. on first chat-widget
 * open). This keeps `vendor-supabase` out of the landing page's initial
 * entry/modulepreload graph.
 *
 * All 5 landing-reachable consumers (settingsService, NoOpSecurityLogger,
 * EmailNotifyDataSource, the chatbot container, ExpertAssistantWithRAG)
 * MUST use `getSupabase()`. Do NOT add a static `import { createClient }`
 * here, and do NOT re-export a synchronous client from this file — that
 * would pull `@supabase/supabase-js` back into the landing entry chunk.
 * The `/admin`-only synchronous Proxy client lives in a SEPARATE module,
 * `@shared/supabaseClientSync`, precisely to avoid that (admin is already
 * its own `React.lazy()` chunk, so its static import stays isolated
 * there — see that file's module doc for the full rationale).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { memoizeAsync } from "@shared/utils/memoizeAsync";

async function loadClient(): Promise<SupabaseClient> {
  const { createClient } = await import("@supabase/supabase-js");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Returns a memoized Supabase client, resolving the dynamic import of
 * `@supabase/supabase-js` on first call. A rejected import (offline, a
 * stale chunk after deploy) is NOT cached — the next call retries the
 * import from scratch instead of permanently bricking every consumer.
 * See `@shared/utils/memoizeAsync` for the underlying, fully-tested
 * memoize/retry mechanics.
 */
export const getSupabase = memoizeAsync(loadClient);

export type { SupabaseClient } from "@supabase/supabase-js";
