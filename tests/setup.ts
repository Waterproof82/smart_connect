/**
 * Jest Setup File
 * @description Global test configuration and mocks
 */

import '@testing-library/jest-dom';
import { randomUUID } from 'node:crypto';

// Polyfill for crypto.randomUUID() in Node.js < 19
if (!globalThis.crypto) {
  globalThis.crypto = {} as any;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = randomUUID;
}

// Mock environment variables
process.env.VITE_GEMINI_API_KEY = 'test-api-key';
process.env.VITE_N8N_WEBHOOK_URL = 'https://test-webhook.com';
process.env.VITE_GOOGLE_SHEETS_ID = 'test-sheet-id';

// Mock DOMPurify for Node.js environment
jest.mock('dompurify', () => {
  return {
    __esModule: true,
    default: {
      sanitize: (dirty: string, config?: any) => {
        // Simple sanitization: remove all HTML tags
        let clean = dirty.replaceAll(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
        clean = clean.replaceAll(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
        clean = clean.replaceAll(/<[^>]+>/g, '');
        // Decode HTML entities
        clean = clean.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
        return clean;
      },
    },
  };
});

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
