export function createSecurityLogger() {
  const securityLogger = {
    logXSSAttempt: jest.fn(),
    logRateLimitExceeded: jest.fn(),
    logError: jest.fn(),
  };

  return securityLogger;
}