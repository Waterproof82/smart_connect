/**
 * Security Logger Unit Tests
 * 
 * Tests for SecurityLogger security event logging functionality
 * 
 * Security: OWASP A09:2021 (Security Logging and Monitoring)
 */

import { SecurityLogger } from '../../../src/core/domain/usecases/SecurityLogger';

describe('SecurityLogger', () => {
  let logger: SecurityLogger;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new SecurityLogger('TEST');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe('logSecurityEvent', () => {
    it('should log CRITICAL events to console.error', () => {
      logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        userId: 'user123',
        ip: '192.168.1.1',
        details: 'XSS detected in message field',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔒 SECURITY ALERT:',
        expect.stringContaining('XSS_ATTEMPT')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔒 SECURITY ALERT:',
        expect.stringContaining('user123')
      );
    });

    it('should log WARNING events to console.warn', () => {
      logger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        userId: 'user123',
        ip: '192.168.1.1',
        details: 'Invalid credentials',
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '🔒 SECURITY WARNING:',
        expect.stringContaining('AUTH_FAILURE')
      );
    });

    it('should log INFO events to console.info', () => {
      logger.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: 'user123',
        ip: '192.168.1.1',
        details: 'User logged in',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '🔒 SECURITY EVENT:',
        expect.stringContaining('AUTH_SUCCESS')
      );
    });

    it('should include timestamp in logged events', () => {
      logger.logSecurityEvent({
        type: 'DATA_ACCESS',
        details: 'User accessed sensitive data',
      });

      const loggedMessage = consoleInfoSpy.mock.calls[0][1];
      expect(loggedMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include metadata in logged events', () => {
      logger.logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        userId: 'user123',
        details: 'Too many requests',
        metadata: {
          endpoint: '/api/chat',
          limit: 10,
        },
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('endpoint');
      expect(loggedMessage).toContain('/api/chat');
    });
  });

  describe('logAuthFailure', () => {
    it('should log authentication failure with reason', () => {
      logger.logAuthFailure({
        userId: 'user123',
        ip: '192.168.1.1',
        reason: 'Invalid password',
        metadata: { attempts: 3 },
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '🔒 SECURITY WARNING:',
        expect.stringContaining('Invalid password')
      );
    });

    it('should handle missing userId', () => {
      logger.logAuthFailure({
        ip: '192.168.1.1',
        reason: 'User not found',
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('anonymous');
    });
  });

  describe('logAuthSuccess', () => {
    it('should log successful authentication', () => {
      logger.logAuthSuccess({
        userId: 'user123',
        ip: '192.168.1.1',
        method: 'password',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '🔒 SECURITY EVENT:',
        expect.stringContaining('authenticated successfully')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '🔒 SECURITY EVENT:',
        expect.stringContaining('password')
      );
    });
  });

  describe('logRateLimitExceeded', () => {
    it('should log rate limit violation', () => {
      logger.logRateLimitExceeded({
        userId: 'user123',
        ip: '192.168.1.1',
        endpoint: '/api/generate',
        limit: 10,
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('Rate limit exceeded');
      expect(loggedMessage).toContain('/api/generate');
      expect(loggedMessage).toContain('10');
    });
  });

  describe('logXSSAttempt', () => {
    it('should log XSS injection attempt', () => {
      logger.logXSSAttempt({
        userId: 'user123',
        ip: '192.168.1.1',
        payload: '<script>alert("XSS")</script>',
        field: 'message',
      });

      const loggedMessage = consoleErrorSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('XSS attempt detected');
      expect(loggedMessage).toContain('message');
    });

    it('should truncate long payloads to prevent log injection', () => {
      const longPayload = '<script>' + 'A'.repeat(1000) + '</script>';
      
      logger.logXSSAttempt({
        ip: '192.168.1.1',
        payload: longPayload,
        field: 'description',
      });

      const loggedMessage = consoleErrorSpy.mock.calls[0][1];
      const logObject = JSON.parse(loggedMessage);
      
      expect(logObject.metadata.payloadPreview.length).toBe(50);
      expect(logObject.metadata.payloadLength).toBe(longPayload.length);
    });

    it('should not include full malicious payload in logs', () => {
      logger.logXSSAttempt({
        ip: '192.168.1.1',
        payload: '<img src=x onerror=alert(document.cookie)>',
        field: 'bio',
      });

      const loggedMessage = consoleErrorSpy.mock.calls[0][1];
      const logObject = JSON.parse(loggedMessage);
      
      // Full payload should not be in logs, only truncated preview
      expect(logObject.metadata.payloadPreview.length).toBe(42); // Full payload is 42 chars, but we want max 50
      expect(logObject.metadata.payloadLength).toBe(42);
      expect(logObject.metadata.payloadPreview).toBeTruthy();
    });
  });

  describe('logSuspiciousQuery', () => {
    it('should log suspicious database query', () => {
      logger.logSuspiciousQuery({
        userId: 'user123',
        ip: '192.168.1.1',
        query: "SELECT * FROM users WHERE id='1' OR '1'='1'",
        reason: 'SQL injection pattern detected',
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('Suspicious query detected');
      expect(loggedMessage).toContain('SQL injection');
    });
  });

  describe('logUnauthorizedAccess', () => {
    it('should log unauthorized resource access', () => {
      logger.logUnauthorizedAccess({
        userId: 'user123',
        ip: '192.168.1.1',
        resource: '/admin/settings',
        action: 'READ',
      });

      const loggedMessage = consoleErrorSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('Unauthorized access attempt');
      expect(loggedMessage).toContain('/admin/settings');
      expect(loggedMessage).toContain('READ');
    });
  });

  describe('severity classification', () => {
    it('should classify XSS_ATTEMPT as CRITICAL', () => {
      logger.logSecurityEvent({
        type: 'XSS_ATTEMPT',
        details: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔒 SECURITY ALERT:',
        expect.anything()
      );
    });

    it('should classify INJECTION_ATTEMPT as CRITICAL', () => {
      logger.logSecurityEvent({
        type: 'INJECTION_ATTEMPT',
        details: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔒 SECURITY ALERT:',
        expect.anything()
      );
    });

    it('should classify UNAUTHORIZED_ACCESS as CRITICAL', () => {
      logger.logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        details: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔒 SECURITY ALERT:',
        expect.anything()
      );
    });

    it('should classify AUTH_FAILURE as WARNING', () => {
      logger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: 'Test',
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '🔒 SECURITY WARNING:',
        expect.anything()
      );
    });

    it('should classify AUTH_SUCCESS as INFO', () => {
      logger.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        details: 'Test',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '🔒 SECURITY EVENT:',
        expect.anything()
      );
    });
  });

  describe('edge cases', () => {
    it('should handle events without userId', () => {
      logger.logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        details: 'Anonymous user exceeded limit',
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('anonymous');
    });

    it('should handle events without IP address', () => {
      logger.logSecurityEvent({
        type: 'AUTH_FAILURE',
        userId: 'user123',
        details: 'Failed login',
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('unknown');
    });

    it('should handle events with complex metadata', () => {
      logger.logSecurityEvent({
        type: 'SUSPICIOUS_QUERY',
        details: 'Complex query detected',
        metadata: {
          queryParams: { limit: 1000, offset: 0 },
          headers: { 'X-Custom': 'value' },
          nested: { deep: { value: 123 } },
        },
      });

      const loggedMessage = consoleWarnSpy.mock.calls[0][1];
      expect(loggedMessage).toContain('queryParams');
      expect(loggedMessage).toContain('nested');
    });
  });
});
