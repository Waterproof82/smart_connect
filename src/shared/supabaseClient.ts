/**
 * Supabase Client - Real implementation
 *
 * Uses VITE_ prefixed env vars (safe to expose in the browser).
 * Edge Functions are called via supabase.functions.invoke().
 *
 * NOTE: The client is created lazily (first property access) to avoid crashing
 * during SSR prerender in CI/build environments where .env vars aren't available.
 * During prerender, `getAppSettings()` runs inside a useEffect — never at module
 * level — so the client is never actually accessed in SSR.
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
    return Reflect.get(getClient(), prop, prop);
  },
});

export type { SupabaseClient } from "@supabase/supabase-js";
