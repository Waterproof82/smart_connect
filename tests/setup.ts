/**
 * Jest Setup File
 * @description Global test configuration and mocks
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_GEMINI_API_KEY = 'test-api-key';
process.env.VITE_N8N_WEBHOOK_URL = 'https://test-webhook.com';
process.env.VITE_GOOGLE_SHEETS_ID = 'test-sheet-id';

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  disconnect(): void {
    // Mock implementation
  }
  observe(): void {
    // Mock implementation
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {
    // Mock implementation
  }
} as any;

// Mock window.matchMedia
Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
