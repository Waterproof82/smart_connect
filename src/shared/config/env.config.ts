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
    return typeof window !== 'undefined' && typeof document !== 'undefined' && eval('typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined"');
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
  let value: string | undefined;
  // Browser (Vite)
  if (isViteEnv()) {
    value = getViteEnvVar(key);
    // Fallback: buscar sin prefijo VITE_ si no existe
    if ((key === 'VITE_SUPABASE_URL' || key === 'VITE_SUPABASE_ANON_KEY') && !value) {
      const altKey = key.replace('VITE_', '');
      value = getViteEnvVar(altKey);
    }
    if (key === 'VITE_GEMINI_API_KEY' && !value) {
      value = getViteEnvVar('GEMINI_API_KEY');
    }
    value = value || defaultValue;
    // Lanzar error explícito en frontend si falta SUPABASE_URL o ANON_KEY
    if ((key === 'VITE_SUPABASE_URL' || key === 'VITE_SUPABASE_ANON_KEY') && !value) {
      throw new Error(`Missing required environment variable in frontend: ${key}.\n\nSolución: Asegúrate de que existe VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.local y reinicia el servidor de desarrollo.`);
    }
    return value || '';
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key];
    // Fallback para SUPABASE y GEMINI
    if ((key === 'VITE_SUPABASE_URL' || key === 'VITE_SUPABASE_ANON_KEY') && !value) {
      const altKey = key.replace('VITE_', '');
      value = process.env[altKey];
    }
    if (key === 'VITE_GEMINI_API_KEY' && !value) {
      value = process.env['GEMINI_API_KEY'];
    }
    value = value || defaultValue;
    if (!value && getEnvMode() === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
  }
  // Fallback universal
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
