/**
 * ConsoleLogger Tests
 * @module tests/unit/core
 */

import { ConsoleLogger } from '../../../src/core/domain/usecases/Logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new ConsoleLogger('[Test]');
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('info()', () => {
    it('should log info message with prefix', () => {
      logger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[Test] Test message');
    });

    it('should log info with additional arguments', () => {
      logger.info('User created', { id: 1, name: 'John' });
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Test] User created',
        { id: 1, name: 'John' }
      );
    });
  });

  describe('warn()', () => {
    it('should log warning message with prefix and emoji', () => {
      logger.warn('Deprecated API');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Test] ⚠️ Deprecated API');
    });
  });

  describe('error()', () => {
    it('should log error message with Error instance', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Test] ❌ Operation failed',
        'Test error'
      );
    });

    it('should log error message without Error instance', () => {
      logger.error('Generic error', 'Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Test] ❌ Generic error',
        'Something went wrong'
      );
    });

    it('should log error without additional data', () => {
      logger.error('Simple error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Test] ❌ Simple error',
        undefined
      );
    });
  });

  describe('prefix', () => {
    it('should use default prefix when not provided', () => {
      const defaultLogger = new ConsoleLogger();
      defaultLogger.info('Test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[App] Test');
    });

    it('should use custom prefix', () => {
      const customLogger = new ConsoleLogger('[CustomModule]');
      customLogger.info('Test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[CustomModule] Test');
    });
  });
});
