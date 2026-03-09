/**
 * No-Op Security Logger
 *
 * Provides a safe fallback when Supabase credentials are not available
 * (e.g., in tests or when env vars are missing).
 * Replaces duplicated inline mock objects in sanitizer.ts and rateLimiter.ts.
 */

import { SecurityLogger } from './SecurityLogger';
import { ENV } from '@shared/config/env.config';

/**
 * Returns a real SecurityLogger if Supabase is configured,
 * otherwise returns a no-op instance that silently discards all calls.
 */
export function createSecurityLogger(): SecurityLogger {
  if (ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY) {
    return new SecurityLogger();
  }
  // Return a proxy that silently ignores all method calls
  return new Proxy({} as SecurityLogger, {
    get: () => async () => {},
  });
}
