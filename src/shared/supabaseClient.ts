import { createClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string | undefined {
  // Vite/Frontend
  if (typeof import.meta === 'object' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  // Node/Jest
  if (typeof process === 'object' && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clear stale sessions that cause "Refresh Token Not Found" errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    // Token refresh failed - clear the corrupted session
    supabase.auth.signOut();
  }
});

// Handle initial session recovery failure
supabase.auth.getSession().then(({ error }) => {
  if (error?.message?.includes('Refresh Token')) {
    supabase.auth.signOut();
  }
});