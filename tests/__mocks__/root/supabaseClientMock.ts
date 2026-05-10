import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  auth: {
    onAuthStateChange: jest.fn(),
    signInAnonymously: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock_token' } }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock_token' } }, error: null })),
  },
  from: (tableName: string) => {
    if (tableName === 'log_errors') {
      return {
        insert: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
      };
    }
    return {
      insert: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: { message: 'Table not found' } }))
    };
  },
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: {}, error: null }))
  },
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null }))
};

export const supabaseMock = mockSupabase;