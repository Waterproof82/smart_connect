// Load environment variables from .env.local for integration/E2E tests
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load environment variables

// Set VITE_ prefixed versions for consistency with Vite env (if not already set)
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

// Mock environment variables
jest.mock('@shared/utils/envMode', () => ({
  getEnvMode: () => 'test',
}));

jest.mock('@shared/config/env.config', () => ({
  ENV: {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key',
    MODE: 'test',
    DEV: false,
    PROD: false,
  },
}));

// Mock DOMPurify
jest.mock('dompurify', () => require('./__mocks__/dompurify'));

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
};

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

// Polyfill for crypto.randomUUID() in Node.js < 19
if (!globalThis.crypto) {
  globalThis.crypto = {} as any;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => 'test-uuid';
}