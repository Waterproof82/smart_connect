/**
 * Core Domain Use Cases - Barrel Export
 * @module core/domain/usecases
 * 
 * IMPORTANT: Export order matters to avoid circular dependencies
 * Logger must be exported before SecurityLogger (which extends ConsoleLogger)
 */

// Export Logger types and classes first
export type { ILogger } from './Logger';
export { ConsoleLogger, LogLevel } from './Logger';

// Export SecurityLogger after Logger is resolved
export { SecurityLogger } from './SecurityLogger';
export type { SecurityEvent, SecurityEventType } from './SecurityLogger';
