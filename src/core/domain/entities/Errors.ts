/**
 * Custom Error Classes
 * @module core/domain/entities
 * 
 * Domain-level error abstractions for better error handling
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier 
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`
    );
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends DomainError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends DomainError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
