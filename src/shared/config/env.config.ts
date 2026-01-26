/**
 * Environment Configuration
 * @module shared/config/env
 * @description Security by Design - Environment variables validation
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value && import.meta.env.MODE === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
};

export const ENV = {
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY', ''),
  N8N_WEBHOOK_URL: getEnvVar('VITE_N8N_WEBHOOK_URL', ''),
  GOOGLE_SHEETS_ID: getEnvVar('VITE_GOOGLE_SHEETS_ID', ''),
  CONTACT_EMAIL: getEnvVar('VITE_CONTACT_EMAIL', ''),
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
