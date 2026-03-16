/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 *
 * IMPORTANT: Only VITE_ prefixed variables are exposed to the frontend.
 * Secret keys (GEMINI_API_KEY, SERVICE_ROLE_KEY) must ONLY be used in Edge Functions.
 */

import { getEnvMode } from '@shared/utils/envMode';

// Vite requires static property access on import.meta.env (no dynamic keys)
export const ENV = {
  SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '',
  MODE: getEnvMode(),
  DEV: getEnvMode() === 'development',
  PROD: getEnvMode() === 'production',
} as const;
