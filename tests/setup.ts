// Mock environment variables for Node/Jest compatibility
process.env.SUPABASE_URL = 'https://tysjedvujvsmrzzrmesr.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDE5NjIsImV4cCI6MjA4NTExNzk2Mn0.wwEaxcanylAFKY1x6NNNlewEcQPby0zdo9Q93qqe3dM';
// SECURITY: Do NOT commit real API keys. Use a placeholder for tests only.
// The real key should be set in .env.local (gitignored) for local/dev.
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.N8N_WEBHOOK_URL = '';
process.env.GOOGLE_SHEETS_ID = '';
process.env.CONTACT_EMAIL = 'jmaristia@gmail.com';
/**
 * Jest Setup File
 * @description Global test configuration and mocks
 */

import { randomUUID } from 'node:crypto';

// Polyfill for crypto.randomUUID() in Node.js < 19
if (!globalThis.crypto) {
  globalThis.crypto = {} as any;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = randomUUID;
}

// Mock environment variables
// No need to mock VITE_GEMINI_API_KEY, fallback is handled in env.config.ts
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

// Mock window object for Node.js environment
if (!globalThis.window) {
  globalThis.window = {} as any;
}

// Mock window.matchMedia
if (!globalThis.window.matchMedia) {
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
}

