// Create a closure to avoid referencing supabaseMock directly
const supabaseMock = {
  auth: {
    onAuthStateChange: jest.fn(),
    signInAnonymously: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock_token' } }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock_token' } }, error: null }))
  },
  from: (tableName) => {
    return {
      insert: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
      select: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
    };
  },
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: {}, error: null }))
  },
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null }))
};

// Mock Supabase globally
global.supabase = supabaseMock;

// Mock environment variables
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'anon_key_for_testing';
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'anon_key_for_testing';

// Mock DOMPurify for sanitizer tests
const DOMPurifyMock = {
  sanitize: jest.fn((input, options) => input),
};
global.DOMPurify = DOMPurifyMock;

// Mock console.error to suppress errors
jest.spyOn(global.console, 'error').mockImplementation(() => {});

// Mock Supabase JS library
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => supabaseMock),
  };
});