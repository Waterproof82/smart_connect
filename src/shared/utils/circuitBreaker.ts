/**
 * Circuit Breaker Pattern Implementation
 * @module shared/utils/circuitBreaker
 * 
 * Prevents cascading failures by detecting failing services and stopping requests
 * 
 * Security: OWASP A09:2021 - Security Logging and Monitoring
 * Pattern: Netflix Hystrix-inspired circuit breaker
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, reject requests immediately
 * - HALF_OPEN: Testing if service recovered, allow limited requests
 * 
 * Features:
 * - Automatic state transitions
 * - Configurable thresholds
 * - Time-based recovery
 * - Event callbacks for monitoring
 * - Type-safe with generics
 */

import { ConsoleLogger } from '@core/domain/usecases';
import { NetworkError } from '@core/domain/entities/Errors';

const logger = new ConsoleLogger('[CircuitBreaker]');

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',          // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Name for logging and monitoring
   */
  name?: string;

  /**
   * Number of failures before opening circuit (default: 5)
   */
  failureThreshold?: number;

  /**
   * Time window in ms to count failures (default: 60000 = 1 minute)
   */
  failureWindow?: number;

  /**
   * Time in ms before attempting to close circuit (default: 30000 = 30 seconds)
   */
  resetTimeout?: number;

  /**
   * Number of successful requests in HALF_OPEN before closing (default: 2)
   */
  successThreshold?: number;

  /**
   * Callback when circuit opens
   */
  onOpen?: () => void;

  /**
   * Callback when circuit closes
   */
  onClose?: () => void;

  /**
   * Callback when circuit enters half-open state
   */
  onHalfOpen?: () => void;

  /**
   * Callback on each failure
   */
  onFailure?: (error: unknown) => void;

  /**
   * Callback on each success
   */
  onSuccess?: () => void;
}

/**
 * Failure tracking entry
 */
interface FailureEntry {
  timestamp: number;
  error: unknown;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<CircuitBreakerConfig, 'name'>> = {
  failureThreshold: 5,
  failureWindow: 60000,
  resetTimeout: 30000,
  successThreshold: 2,
  onOpen: () => {},
  onClose: () => {},
  onHalfOpen: () => {},
  onFailure: () => {},
  onSuccess: () => {},
};

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker {
  private readonly config: Required<CircuitBreakerConfig>;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: FailureEntry[] = [];
  private successCount: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = {
      name: config.name || 'CircuitBreaker',
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Executes operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      logger.warn(`${this.config.name}: Circuit is OPEN, rejecting request`);
      throw new NetworkError(
        `Circuit breaker is OPEN for ${this.config.name}. Service temporarily unavailable.`
      );
    }

    try {
      // Execute operation
      const result = await operation();
      
      // Record success
      this.recordSuccess();
      
      return result;
    } catch (error) {
      // Record failure
      this.recordFailure(error);
      
      throw error;
    }
  }

  /**
   * Records a successful operation
   */
  private recordSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.config.onSuccess();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      logger.info(
        `${this.config.name}: Success in HALF_OPEN (${this.successCount}/${this.config.successThreshold})`
      );

      // Close circuit if success threshold reached
      if (this.successCount >= this.config.successThreshold) {
        this.closeCircuit();
      }
    }
  }

  /**
   * Records a failed operation
   */
  private recordFailure(error: unknown): void {
    this.lastFailureTime = Date.now();
    this.failures.push({
      timestamp: Date.now(),
      error,
    });

    this.config.onFailure(error);

    // Clean old failures outside window
    this.cleanOldFailures();

    // Check if we should open circuit
    if (this.state === CircuitState.CLOSED) {
      if (this.failures.length >= this.config.failureThreshold) {
        this.openCircuit();
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN reopens circuit
      logger.warn(`${this.config.name}: Failure in HALF_OPEN, reopening circuit`);
      this.openCircuit();
    }
  }

  /**
   * Opens the circuit (stops accepting requests)
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.successCount = 0;
    
    logger.error(
      `${this.config.name}: Circuit OPENED after ${this.failures.length} failures`
    );
    
    this.config.onOpen();

    // Schedule transition to HALF_OPEN
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      this.halfOpenCircuit();
    }, this.config.resetTimeout);
  }

  /**
   * Transitions circuit to half-open state
   */
  private halfOpenCircuit(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.failures = [];
    
    logger.info(`${this.config.name}: Circuit entered HALF_OPEN state`);
    
    this.config.onHalfOpen();
  }

  /**
   * Closes the circuit (normal operation)
   */
  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.successCount = 0;
    this.failures = [];
    
    logger.info(`${this.config.name}: Circuit CLOSED, service recovered`);
    
    this.config.onClose();

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Removes failures outside the time window
   */
  private cleanOldFailures(): void {
    const now = Date.now();
    const cutoff = now - this.config.failureWindow;
    
    this.failures = this.failures.filter(
      failure => failure.timestamp > cutoff
    );
  }

  /**
   * Gets current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failures.length,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    };
  }

  /**
   * Manually resets the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
    
    logger.info(`${this.config.name}: Circuit manually reset`);
  }

  /**
   * Gets current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Creates a circuit breaker wrapper for any async function
 * 
 * @example
 * ```typescript
 * const fetchWithCircuitBreaker = withCircuitBreaker(
 *   fetch,
 *   { name: 'ExternalAPI', failureThreshold: 5 }
 * );
 * 
 * const response = await fetchWithCircuitBreaker('https://api.example.com/data');
 * ```
 */
export function withCircuitBreaker<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: CircuitBreakerConfig = {}
): {
  execute: (...args: TArgs) => Promise<TResult>;
  breaker: CircuitBreaker;
} {
  const breaker = new CircuitBreaker(config);

  return {
    execute: async (...args: TArgs) => {
      return breaker.execute(() => fn(...args));
    },
    breaker,
  };
}
