// Load environment variables from .env.local for integration/E2E tests
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Set VITE_ prefixed versions for consistency with Vite env (if not already set)
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

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
// Note: Settings are now fetched from Supabase database, not ENV
// No need to mock VITE_GEMINI_API_KEY, fallback is handled in env.config.ts

// Mock modules that use import.meta (not supported in Jest)
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

// Mock DOMPurify for Node.js environment
jest.mock('dompurify', () => {
  const sanitize = (dirty: string, config?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[]; KEEP_CONTENT?: boolean }) => {
    // Remove script/iframe tags and content
    let clean = dirty.replaceAll(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    clean = clean.replaceAll(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');

    const allowedTags = config?.ALLOWED_TAGS;

    if (allowedTags && allowedTags.length > 0) {
      // Keep allowed tags, strip disallowed ones (keep content)
      clean = clean.replaceAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match: string, tag: string) => {
        return allowedTags.includes(tag.toLowerCase()) ? match : '';
      });
    } else {
      // No tags allowed - strip all
      clean = clean.replaceAll(/<[^>]+>/g, '');
    }

    return clean;
  };

  return {
    __esModule: true,
    default: { sanitize },
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

