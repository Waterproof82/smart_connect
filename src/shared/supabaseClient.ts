import { createClient } from '@supabase/supabase-js';

// Mock para pruebas
let SUPABASE_URL = 'http://localhost:54321';
let SUPABASE_ANON_KEY = 'anon_key_for_testing';

// En producción, estos valores deberían ser cargados desde el entorno
if (process.env.NODE_ENV !== 'test') {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase env vars not set (SUPABASE_URL, SUPABASE_ANON_KEY)');
  }
  SUPABASE_URL = process.env.SUPABASE_URL;
  SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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