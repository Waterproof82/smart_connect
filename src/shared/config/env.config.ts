/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 */


import { getEnvMode } from '@shared/utils/envMode';




// Helper: Detect if running in Vite/browser (never true in Node/Jest)
function isViteEnv() {
  try {
    // Use eval to avoid Node/Jest parsing import.meta
    // eslint-disable-next-line no-eval
    return globalThis.window !== undefined && globalThis.document !== undefined && eval('import.meta !== undefined && import.meta.env !== undefined');
  } catch {
    return false;
  }
}

// Helper: Get Vite env var safely (browser only)
function getViteEnvVar(key: string): string | undefined {
  try {
    // eslint-disable-next-line no-eval
    return eval('import.meta.env["' + key + '"]');
  } catch {
    return undefined;
  }
}

const getEnvVar = (key: string, defaultValue?: string, fallbackKey?: string): string => {
  const isSupabaseKey = key === 'VITE_SUPABASE_URL' || key === 'VITE_SUPABASE_ANON_KEY';
  const isGeminiKey = key === 'VITE_GEMINI_API_KEY';

  function resolveViteEnv() {
    let value = getViteEnvVar(key);
    if (isSupabaseKey && !value) value = getViteEnvVar(key.replace('VITE_', ''));
    if (isGeminiKey && !value) value = getViteEnvVar('GEMINI_API_KEY');
    value = value || defaultValue;
    if (isSupabaseKey && !value) {
      throw new Error(`Missing required environment variable in frontend: ${key}.\n\nSolución: Asegúrate de que existe VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.local y reinicia el servidor de desarrollo.`);
    }
    return value || '';
  }

  function resolveNodeEnv() {
    let value = process.env[key];
    if (isSupabaseKey && !value) value = process.env[key.replace('VITE_', '')];
    if (isGeminiKey && !value) value = process.env['GEMINI_API_KEY'];
    value = value || defaultValue;
    if (!value && getEnvMode() === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
  }

  if (isViteEnv()) return resolveViteEnv();
  if (typeof process !== 'undefined' && process.env) return resolveNodeEnv();
  return defaultValue || '';
};



// Universal getter for GEMINI_API_KEY (frontend: import.meta.env, backend: process.env)
function getGeminiApiKey(): string {
  // Frontend (Vite/browser)
  if (isViteEnv()) {
    const viteKey = getViteEnvVar('VITE_GEMINI_API_KEY');
    if (viteKey) return viteKey;
  }
  // Backend (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }
  return '';
}

export const ENV = {
  GEMINI_API_KEY: getGeminiApiKey(),
  N8N_WEBHOOK_URL: getEnvVar('VITE_N8N_WEBHOOK_URL', ''), // Default to empty string if not set
  GOOGLE_SHEETS_ID: getEnvVar('VITE_GOOGLE_SHEETS_ID', ''),
  CONTACT_EMAIL: getEnvVar('VITE_CONTACT_EMAIL', ''),
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  MODE: getEnvMode(),
  DEV: getEnvMode() === 'development',
  PROD: getEnvMode() === 'production',
} as const;
