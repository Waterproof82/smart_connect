/**
 * Supabase Client - Real implementation
 *
 * Uses VITE_ prefixed env vars (safe to expose in the browser).
 * Edge Functions are called via supabase.functions.invoke().
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type { SupabaseClient } from "@supabase/supabase-js";
