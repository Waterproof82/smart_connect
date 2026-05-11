// Load environment variables from .env.local for integration/E2E tests
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Load environment variables

// Set VITE_ prefixed versions for consistency with Vite env (if not already set)
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

// Mock Supabase
jest.mock("@supabase/supabase-js", () => {
  const mockSupabase = {
    createClient: jest.fn(() => ({
      from: jest.fn((_tableName) => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "test-doc-id", content: "Test document" },
          error: null,
        }),
      })),
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn().mockResolvedValue({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { id: "test-user-id" }, error: null }),
      },
    })),
  };
  return mockSupabase;
});

// Mock environment variables
jest.mock("@shared/utils/envMode", () => ({
  getEnvMode: () => "test",
}));

jest.mock("@shared/config/env.config", () => ({
  ENV: {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || "http://localhost:54321",
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || "test-anon-key",
    MODE: "test",
    DEV: false,
    PROD: false,
  },
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock window object for Node.js environment
if (!globalThis.window) {
  globalThis.window = {} as unknown as Window & typeof globalThis;
}

// Mock window.matchMedia
if (!globalThis.window.matchMedia) {
  Object.defineProperty(globalThis.window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
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
  globalThis.crypto = {} as Crypto;
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () =>
    "test-uuid" as `${string}-${string}-${string}-${string}-${string}`;
}
