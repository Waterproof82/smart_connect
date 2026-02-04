/**
 * Retry Logic Utility
 * @module shared/utils/retryLogic
 * 
 * Implements exponential backoff retry strategy for transient failures
 * 
 * Security: OWASP A09:2021 - Security Logging and Monitoring
 * Pattern: Resilience4j-inspired retry mechanism
 * 
 * Features:
 * - Exponential backoff (2^n * baseDelay)
 * - Configurable max attempts
 * - Jitter to prevent thundering herd
 * - Type-safe with generics
 * - Error logging integration
 */

import { ConsoleLogger } from '@core/domain/usecases';
import { NetworkError } from '@core/domain/entities/Errors';

const logger = new ConsoleLogger('[RetryLogic]');

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds (default: 1000)
   * Actual delay = baseDelay * 2^attemptNumber
   */
  baseDelay?: number;

  /**
   * Maximum delay cap in milliseconds (default: 30000)
   */
  maxDelay?: number;

  /**
   * Add random jitter to prevent thundering herd (default: true)
   */
  useJitter?: boolean;

  /**
   * Predicate to determine if error is retryable (default: all errors)
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Callback before each retry attempt
   */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  useJitter: true,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Calculates delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  useJitter: boolean
): number {
  // Exponential backoff: 2^attempt * baseDelay
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attempt),
    maxDelay
  );

  if (!useJitter) {
    return exponentialDelay;
  }

  // Add jitter (0-50% of delay) to prevent thundering herd
  const jitter = Math.random() * exponentialDelay * 0.5;
  return exponentialDelay + jitter;
}

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps an async operation with retry logic
 * 
 * @param operation Async function to retry
 * @param config Retry configuration
 * @returns Promise with operation result
 * 
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    maxAttempts,
    baseDelay,
    maxDelay,
    useJitter,
    shouldRetry,
    onRetry,
  } = mergedConfig;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Attempt operation
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        logger.warn(`Error not retryable, failing immediately`, error);
        throw error;
      }

      // Check if we've exhausted attempts
      if (attempt === maxAttempts - 1) {
        logger.error(
          `Max retry attempts (${maxAttempts}) exceeded`,
          error
        );
        throw new NetworkError(
          `Operation failed after ${maxAttempts} attempts`,
          error instanceof Error ? (error as { statusCode?: number }).statusCode : undefined
        );
      }

      // Calculate delay for next attempt
      const delayMs = calculateDelay(attempt, baseDelay, maxDelay, useJitter);

      logger.warn(
        `Attempt ${attempt + 1}/${maxAttempts} failed, retrying in ${Math.round(delayMs)}ms`,
        error
      );

      // Callback before retry
      onRetry(attempt + 1, error);

      // Wait before next attempt
      await delay(delayMs);
    }
  }

  // Should never reach here, but TypeScript requires it
  throw lastError;
}

/**
 * Predicate: Retry only on network errors (4xx/5xx status codes)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof Error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    // Retry on 5xx (server errors) and 429 (rate limit)
    // Don't retry on 4xx (client errors) except 408 (timeout) and 429
    if (statusCode) {
      return (
        statusCode >= 500 ||
        statusCode === 408 ||
        statusCode === 429
      );
    }
  }

  return false;
}

/**
 * Predicate: Retry on timeout errors
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'AbortError' ||
      error.message.toLowerCase().includes('timeout') ||
      (error as { statusCode?: number }).statusCode === 408
    );
  }
  return false;
}

/**
 * Predicate: Retry on any error (default behavior)
 */
export function alwaysRetry(): boolean {
  return true;
}

/**
 * Predicate: Never retry (fail fast)
 */
export function neverRetry(): boolean {
  return false;
}

/**
 * Higher-order function to create a retryable version of any async function
 * 
 * @example
 * ```typescript
 * const fetchWithRetry = makeRetryable(
 *   fetch,
 *   { maxAttempts: 3, shouldRetry: isNetworkError }
 * );
 * 
 * const response = await fetchWithRetry('https://api.example.com/data');
 * ```
 */
export function makeRetryable<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: RetryConfig = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    return withRetry(() => fn(...args), config);
  };
}
