/**
 * Logger Interface
 * @module core/domain/usecases
 * 
 * Abstraction for logging across the application
 * Updated: 2026-01-28
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: unknown, ...args: unknown[]): void;
}

export class ConsoleLogger implements ILogger {
  constructor(private readonly prefix: string = '[App]') {}

  debug(message: string, ...args: unknown[]): void {
    // Only log in development
    if (import.meta.env.MODE !== 'production') {
      console.debug(`${this.prefix} ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`${this.prefix} ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix} ⚠️ ${message}`, ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (error instanceof Error) {
      console.error(`${this.prefix} ❌ ${message}`, error.message, ...args);
      // Only show stack in development
      if (import.meta.env.MODE !== 'production') {
        console.error('Stack:', error.stack);
      }
    } else {
      console.error(`${this.prefix} ❌ ${message}`, error, ...args);
    }
  }
}
