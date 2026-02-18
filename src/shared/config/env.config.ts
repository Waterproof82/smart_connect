/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 */

import { getEnvMode } from '@shared/utils/envMode';

// Direct access to Vite env vars (for browser/Vite builds)
const _viteEnv = import.meta?.env ?? {};

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

// Universal getter for GEMINI_API_KEY
function getGeminiApiKey(): string {
  return getEnvVar('GEMINI_API_KEY') || '';
}

export const ENV = {
  GEMINI_API_KEY: getGeminiApiKey(),
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  MODE: getEnvMode(),
  DEV: getEnvMode() === 'development',
  PROD: getEnvMode() === 'production',
} as const;
