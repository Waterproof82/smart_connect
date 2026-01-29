/**
 * Error Classes Tests
 * @module tests/unit/core
 */

import {
  DomainError,
  ValidationError,
  NotFoundError,
  NetworkError,
  ApiError,
  UnauthorizedError
} from '../../../src/core/domain/entities/Errors';

describe('Core Error Classes', () => {
  describe('DomainError', () => {
    it('should create error with message', () => {
      const error = new DomainError('Domain error message');
      expect(error.message).toBe('Domain error message');
      expect(error.name).toBe('DomainError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create error with message and field', () => {
      const error = new ValidationError('Invalid email', 'email');
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.name).toBe('ValidationError');
    });

    it('should create error without field', () => {
      const error = new ValidationError('Invalid data');
      expect(error.message).toBe('Invalid data');
      expect(error.field).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('should create error with resource and identifier', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe("User with identifier '123' not found");
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with only resource', () => {
      const error = new NotFoundError('Document');
      expect(error.message).toBe('Document not found');
    });
  });

  describe('NetworkError', () => {
    it('should create error with message and status code', () => {
      const error = new NetworkError('Connection timeout', 408);
      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(408);
      expect(error.name).toBe('NetworkError');
    });

    it('should create error without status code', () => {
      const error = new NetworkError('Network unavailable');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('ApiError', () => {
    it('should create error with all parameters', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ApiError('Validation failed', 400, details);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
      expect(error.name).toBe('ApiError');
    });

    it('should create error without optional parameters', () => {
      const error = new ApiError('Unknown API error');
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized access');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('Error inheritance', () => {
    it('should be caught as Error', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work with try-catch', () => {
      try {
        throw new ApiError('Test error', 500);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(500);
      }
    });
  });
});
