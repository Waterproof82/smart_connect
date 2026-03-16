/**
 * Rate Limiter Tests
 *
 * Security: OWASP A04:2021 (Insecure Design)
 */

import { RateLimiter, RateLimitPresets } from '../../../src/shared/utils/rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  afterEach(() => {
    limiter.destroy();
  });

  describe('checkLimit', () => {
    it('should allow requests under the limit', async () => {
      const config = { maxRequests: 3, windowMs: 60000 };
      expect(await limiter.checkLimit('user-1', config)).toBe(true);
      expect(await limiter.checkLimit('user-1', config)).toBe(true);
      expect(await limiter.checkLimit('user-1', config)).toBe(true);
    });

    it('should block requests when limit is exceeded', async () => {
      const config = { maxRequests: 2, windowMs: 60000 };
      await limiter.checkLimit('user-2', config);
      await limiter.checkLimit('user-2', config);
      expect(await limiter.checkLimit('user-2', config)).toBe(false);
    });

    it('should track different identifiers independently', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      await limiter.checkLimit('user-a', config);
      expect(await limiter.checkLimit('user-a', config)).toBe(false);
      expect(await limiter.checkLimit('user-b', config)).toBe(true);
    });

    it('should use default config when none provided', async () => {
      // Default: 10 requests per 60 seconds
      for (let i = 0; i < 10; i++) {
        expect(await limiter.checkLimit('default-user')).toBe(true);
      }
      expect(await limiter.checkLimit('default-user')).toBe(false);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max when no prior requests', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      expect(limiter.getRemainingRequests('new-user', config)).toBe(5);
    });

    it('should decrease after each request', async () => {
      const config = { maxRequests: 3, windowMs: 60000 };
      await limiter.checkLimit('user-rem', config);
      expect(limiter.getRemainingRequests('user-rem', config)).toBe(2);
      await limiter.checkLimit('user-rem', config);
      expect(limiter.getRemainingRequests('user-rem', config)).toBe(1);
    });

    it('should return 0 when limit is exhausted', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      await limiter.checkLimit('user-zero', config);
      expect(limiter.getRemainingRequests('user-zero', config)).toBe(0);
    });
  });

  describe('clearLimit', () => {
    it('should reset the limit for an identifier', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      await limiter.checkLimit('user-clear', config);
      expect(await limiter.checkLimit('user-clear', config)).toBe(false);

      limiter.clearLimit('user-clear');
      expect(await limiter.checkLimit('user-clear', config)).toBe(true);
    });

    it('should not affect other identifiers', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      await limiter.checkLimit('user-x', config);
      await limiter.checkLimit('user-y', config);

      limiter.clearLimit('user-x');
      expect(await limiter.checkLimit('user-x', config)).toBe(true);
      expect(await limiter.checkLimit('user-y', config)).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should clear all data', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      await limiter.checkLimit('user-destroy', config);

      limiter.destroy();
      // After destroy, a new check should succeed (data cleared)
      expect(await limiter.checkLimit('user-destroy', config)).toBe(true);
    });
  });
});

describe('RateLimitPresets', () => {
  it('should define CHATBOT preset (10 req/min)', () => {
    expect(RateLimitPresets.CHATBOT).toEqual({ maxRequests: 10, windowMs: 60000 });
  });

  it('should define CONTACT_FORM preset (3 req/hour)', () => {
    expect(RateLimitPresets.CONTACT_FORM).toEqual({ maxRequests: 3, windowMs: 3600000 });
  });

  it('should define API_STANDARD preset (100 req/min)', () => {
    expect(RateLimitPresets.API_STANDARD).toEqual({ maxRequests: 100, windowMs: 60000 });
  });

  it('should define API_STRICT preset (5 req/min)', () => {
    expect(RateLimitPresets.API_STRICT).toEqual({ maxRequests: 5, windowMs: 60000 });
  });

  it('should define LOGIN preset (5 req/5min)', () => {
    expect(RateLimitPresets.LOGIN).toEqual({ maxRequests: 5, windowMs: 300000 });
  });
});
