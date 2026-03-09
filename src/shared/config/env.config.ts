/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 *
 * IMPORTANT: Only VITE_ prefixed variables are exposed to the frontend.
 * Secret keys (GEMINI_API_KEY, SERVICE_ROLE_KEY) must ONLY be used in Edge Functions.
 */

import { getEnvMode } from '@shared/utils/envMode';

const getEnvVar = (key: string, defaultValue?: string): string => {
  // Browser/Vite environment - import.meta.env is injected by Vite
  const envValue = import.meta?.env?.[key];
  if (envValue) {
    return envValue;
  }

  // Node.js environment (scripts, tests)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }

  return defaultValue || '';
};

export const ENV = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  MODE: getEnvMode(),
  DEV: getEnvMode() === 'development',
  PROD: getEnvMode() === 'production',
} as const;
