/**
 * No-Op Security Logger Factory
 *
 * Provides a safe fallback when Supabase credentials are not available
 * (e.g., in tests or when env vars are missing).
 * When available, creates a SecurityLogger with Supabase persistence.
 */

import { SecurityLogger } from "./SecurityLogger";
import type { ISecurityLogPersistence } from "./SecurityLogger";
import { ENV } from "@shared/config/env.config";
import { supabase } from "../../../shared/supabaseClient";

/**
 * Creates a Supabase-backed persistence adapter for security logs.
 * This adapter lives in the factory (infrastructure boundary),
 * keeping the SecurityLogger domain class free of Supabase imports.
 */
function createSupabasePersistence(): ISecurityLogPersistence {
  return {
    async insert(log: Record<string, unknown>) {
      try {
        const result = await supabase.from("security_logs").insert(log);
        const { error } = result as { error: unknown };

        let errorMessage: string | null = null;
        if (error && typeof error === "object" && "message" in error) {
          const errorObj = error as { message?: unknown };
          if (typeof errorObj.message === "string") {
            errorMessage = errorObj.message;
          }
        }

        return { error: errorMessage ? { message: errorMessage } : null };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return { error: { message } };
      }
    },
  };
}

/**
 * Returns a real SecurityLogger if Supabase is configured,
 * otherwise returns a no-op instance that silently discards all calls.
 */
export function createSecurityLogger(): SecurityLogger {
  if (ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY) {
    const persistence = createSupabasePersistence();
    return new SecurityLogger(persistence);
  }
  // Return a proxy that silently ignores all method calls
  return new Proxy({} as SecurityLogger, {
    get: () => async () => {},
  });
}
