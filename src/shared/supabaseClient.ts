import { createClient } from '@supabase/supabase-js';
import { ENV } from '@shared/config/env.config';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Supabase env vars not set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

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