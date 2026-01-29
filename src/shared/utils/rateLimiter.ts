/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse of API endpoints and chatbot by limiting request frequency.
 * 
 * Security: OWASP A04:2021 (Insecure Design)
 * Implementation: In-memory rate limiting with sliding window
 */


import { SecurityLogger } from '@core/domain/usecases/SecurityLogger';
import { ENV } from '@shared/config/env.config';

// Factory: Only instantiate SecurityLogger if envs are present
function getSecurityLogger(): SecurityLogger | ConsoleLogger {
  if (ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY) {
    return new SecurityLogger();
  }
  // Fallback: Only log to console, no Supabase
  return new (class extends SecurityLogger {
    constructor() { super(); }
    // Override methods that use Supabase
    async sendToDatabase() { /* noop */ }
    async sendAlert() { /* noop */ }
  })();
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

/**
 * Request tracking entry
 */
interface RequestEntry {
  timestamps: number[]; // Array of request timestamps
}

/**
 * In-memory rate limiter using sliding window algorithm
 * 
 * Implementation:
 * - Tracks requests per identifier (user ID, IP, session ID)
 * - Uses sliding window to count requests in time window
 * - Automatically cleans up expired entries
 * 
 * Limitations:
 * - In-memory storage (resets on server restart)
 * - Not suitable for multi-server deployments (use Redis instead)
 */
export class RateLimiter {
  private readonly requests: Map<string, RequestEntry> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Checks if request is within rate limit
   * 
   * @param identifier Unique identifier (user ID, IP address, session ID)
   * @param config Rate limit configuration
   * @returns true if allowed, false if rate limit exceeded
   * 
   * Example:
   * ```typescript
   * const isAllowed = await rateLimiter.checkLimit('user-123', {
   *   maxRequests: 10,
   *   windowMs: 60000, // 10 requests per minute
   * });
   * 
   * if (!isAllowed) {
   *   return { error: 'Rate limit exceeded' };
   * }
   * ```
   */
  async checkLimit(
    identifier: string,
    config?: RateLimitConfig
  ): Promise<boolean> {
    const finalConfig = config ?? { maxRequests: 10, windowMs: 60000 };
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;

    // Get or create entry for this identifier
    let entry = this.requests.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.requests.set(identifier, entry);
    }

    // Remove expired timestamps (outside current window)
    entry.timestamps = entry.timestamps.filter(
      timestamp => timestamp > windowStart
    );

    // Check if limit exceeded
    if (entry.timestamps.length >= finalConfig.maxRequests) {
      // Log security event
      void getSecurityLogger().logRateLimitExceeded({
        userId: identifier,
        endpoint: 'rate-limit',
        limit: finalConfig.maxRequests,
      });

      return false; // Rate limit exceeded
    }

    // Add current request timestamp
    entry.timestamps.push(now);
    return true; // Request allowed
  }

  /**
   * Gets remaining requests for an identifier
   * 
   * @param identifier Unique identifier
   * @param config Rate limit configuration
   * @returns Number of remaining requests in current window
   */
  getRemainingRequests(
    identifier: string,
    config?: RateLimitConfig
  ): number {
    const finalConfig = config ?? { maxRequests: 10, windowMs: 60000 };
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;

    const entry = this.requests.get(identifier);
    if (!entry) return finalConfig.maxRequests;

    // Count requests in current window
    const validRequests = entry.timestamps.filter(
      timestamp => timestamp > windowStart
    );

    return Math.max(0, finalConfig.maxRequests - validRequests.length);
  }

  /**
   * Clears rate limit for a user (useful for testing or admin override)
   * 
   * @param identifier Unique identifier to clear
   */
  clearLimit(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Cleans up expired entries to prevent memory leaks
   * 
   * Called automatically every 5 minutes
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [identifier, entry] of this.requests.entries()) {
      // Remove entries with no recent requests
      const hasRecentRequest = entry.timestamps.some(
        timestamp => now - timestamp < maxAge
      );

      if (!hasRecentRequest) {
        this.requests.delete(identifier);
      }
    }
  }

  /**
   * Destroys the rate limiter and cleans up resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

/**
 * Global rate limiter instance
 * 
 * Usage:
 * ```typescript
 * import { rateLimiter } from '@shared/utils/rateLimiter';
 * 
 * const isAllowed = await rateLimiter.checkLimit('user-123', {
 *   maxRequests: 10,
 *   windowMs: 60000,
 * });
 * ```
 */
export const rateLimiter = new RateLimiter();

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Chatbot: 10 messages per minute
  CHATBOT: {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Contact form: 3 submissions per hour
  CONTACT_FORM: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  },
  
  // API: 100 requests per minute
  API_STANDARD: {
    maxRequests: 100,
    windowMs: 60000,
  },
  
  // Strict: 5 requests per minute (for sensitive endpoints)
  API_STRICT: {
    maxRequests: 5,
    windowMs: 60000,
  },
};
