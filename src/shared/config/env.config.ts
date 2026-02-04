/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 */

import { getEnvMode } from '@shared/utils/envMode';

// Direct access to Vite env vars (for browser/Vite builds)
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const getEnvVar = (key: string, defaultValue?: string): string => {
  // Browser/Vite environment - import.meta.env is injected by Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue || '';
  }
  
  // Node.js environment (scripts, tests)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  
  return defaultValue || '';
};

// Universal getter for GEMINI_API_KEY
function getGeminiApiKey(): string {
  return getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY') || '';
}

export const ENV = {
  GEMINI_API_KEY: getGeminiApiKey(),
  N8N_WEBHOOK_URL: getEnvVar('VITE_N8N_WEBHOOK_URL', getEnvMode() === 'development' ? 'http://localhost:5678/webhook-test/hot-lead-intake' : ''),
  GOOGLE_SHEETS_ID: getEnvVar('VITE_GOOGLE_SHEETS_ID', ''),
  CONTACT_EMAIL: getEnvVar('VITE_CONTACT_EMAIL', ''),
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  MODE: getEnvMode(),
  DEV: getEnvMode() === 'development',
  PROD: getEnvMode() === 'production',
} as const;
