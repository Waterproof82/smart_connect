/**
 * Mock for import.meta in Jest environment
 * Jest doesn't support import.meta natively
 */

export const importMetaMock = {
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key',
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || 'test-gemini-key',
    MODE: process.env.NODE_ENV || 'test',
    DEV: process.env.NODE_ENV !== 'production',
    PROD: process.env.NODE_ENV === 'production',
  },
};
