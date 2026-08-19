/**
 * Supabase Client — Synchronous Proxy (admin-only)
 *
 * Uses VITE_ prefixed env vars (safe to expose in the browser).
 * Edge Functions are called via supabase.functions.invoke().
 *
 * NOTE: The client is created lazily (first property access) to avoid crashing
 * during SSR prerender in CI/build environments where .env vars aren't available.
 *
 * SCOPE: this synchronous, statically-imported client is used ONLY by the
 * `/admin` panel repositories (`SupabaseSettingsRepository`,
 * `SupabaseDocumentRepository`, `SupabaseAuthRepository`) — all reached
 * exclusively via `React.lazy(() => import("@features/admin/presentation"))`
 * in `entry-client.tsx`, i.e. NEVER part of the landing page's initial
 * entry/modulepreload graph.
 *
 * The landing page's five Supabase-touching paths (settingsService,
 * NoOpSecurityLogger, EmailNotifyDataSource, the chatbot container, and
 * ExpertAssistantWithRAG) MUST use the async `getSupabase()` chokepoint in
 * `@shared/supabaseClient` instead — never this module. Keeping the two
 * files separate is deliberate: `supabaseClient.ts` has NO static,
 * top-level import of `@supabase/supabase-js`, so it carries no static
 * edge into the landing entry chunk. If this module's static import were
 * merged back into `supabaseClient.ts`, Rollup would place both in the
 * same shared chunk and the whole point of the async chokepoint (keeping
 * `vendor-supabase` out of the landing entry graph) would be silently
 * defeated the moment ANY consumer (even an admin-only one) statically
 * imports it.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.",
      );
    }

    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

/**
 * Proxy-based lazy supabase client.
 * Defers createClient() until the first property access (e.g. supabase.from()).
 * All callers keep using `supabase.from(...)` as before — no refactoring needed.
 */
export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient();
    if (prop === "then") return undefined; // not a promise
    const value = (client as unknown as Record<string, unknown>)[
      prop as string
    ];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});

export type { SupabaseClient } from "@supabase/supabase-js";
