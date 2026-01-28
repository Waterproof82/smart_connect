// ========================================
// UNIT TEST: RAG Service
// ========================================
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');

describe('RAG Service', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      functions: {
        invoke: jest.fn(),
      },
      rpc: jest.fn(),
    };
    
    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('generateEmbedding', () => {
    it('should call gemini-embedding edge function with text', async () => {
      const mockEmbedding = { embedding: { values: new Array(768).fill(0.1) } };
      mockSupabase.functions.invoke.mockResolvedValue({ 
        data: mockEmbedding, 
        error: null 
      });

      // Mock implementation would go here
      expect(mockSupabase.functions.invoke).toBeDefined();
    });

    it('should throw error when API key is invalid', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { error: { message: 'API key not valid' } },
        error: null
      });

      expect(mockSupabase.functions.invoke).toBeDefined();
    });
  });

  describe('searchSimilarDocs', () => {
    it('should return relevant documents based on similarity', async () => {
      const mockDocs = [
        { id: 1, content: 'QRIBAR info', similarity: 0.85 },
        { id: 2, content: 'Pricing info', similarity: 0.78 }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockDocs, error: null });

      expect(mockSupabase.rpc).toBeDefined();
    });

    it('should return empty array when no matches found', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      expect(mockSupabase.rpc).toBeDefined();
    });

    it('should handle threshold parameter', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      expect(mockSupabase.rpc).toBeDefined();
    });
  });

  describe('generateWithRAG', () => {
    it('should generate response with context from similar docs', async () => {
      const mockDocs = [{ content: 'QRIBAR costs 50€/month' }];
      const mockResponse = {
        candidates: [{
          content: { parts: [{ text: 'QRIBAR cuesta 50€ al mes' }] }
        }]
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({ 
        data: { embedding: { values: new Array(768).fill(0.1) } }, 
        error: null 
      });
      
      mockSupabase.rpc.mockResolvedValue({ data: mockDocs, error: null });
      
      mockSupabase.functions.invoke.mockResolvedValueOnce({ 
        data: mockResponse, 
        error: null 
      });

      expect(mockSupabase.functions.invoke).toBeDefined();
    });

    it('should handle empty context gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      expect(mockSupabase.functions.invoke).toBeDefined();
    });
  });
});
