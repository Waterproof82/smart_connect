/**
 * SupabaseKnowledgeLoader Tests (TDD)
 * 
 * Test suite for loading documents from Supabase for RAG indexing.
 * 
 * Refs: AGENTS.md Section 3 (TDD), ADR-003 (RAG optimization)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SupabaseKnowledgeLoader } from '../../../../../src/features/chatbot/data/supabase-knowledge-loader';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('SupabaseKnowledgeLoader', () => {
  let loader: SupabaseKnowledgeLoader;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSelect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockFrom: any;
  let mockSupabase: unknown;

  beforeEach(() => {
    // @ts-expect-error - Jest mock type inference issue with mockResolvedValue
    mockSelect = jest.fn().mockResolvedValue({
      data: [
        { 
          id: '1', 
          content: 'QRIBAR es una carta digital QR que revoluciona restaurantes...', 
          source: 'qribar', // Simplified source
          metadata: { category: 'features' }
        },
        { 
          id: '2', 
          content: 'Precios QRIBAR: Plan Básico $29/mes, Premium $49/mes...', 
          source: 'qribar', // Simplified source
          metadata: { category: 'pricing' }
        },
        { 
          id: '3', 
          content: 'Sistema de gestión de reputación online con tarjetas NFC...', 
          source: 'reviews', // Simplified source
          metadata: { category: 'features' }
        },
      ],
      error: null,
    });

    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as unknown as jest.Mock).mockReturnValue(mockSupabase);

    loader = new SupabaseKnowledgeLoader({
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
    });
  });

  describe('Document Loading', () => {
    it('should load documents grouped by source', async () => {
      const result = await loader.loadDocuments();

      expect(result).toHaveProperty('qribar');
      expect(result).toHaveProperty('reviews');
      expect(result.qribar).toHaveLength(2);
      expect(result.reviews).toHaveLength(1);
      expect(mockFrom).toHaveBeenCalledWith('documents');
      expect(mockSelect).toHaveBeenCalledWith('id, content, source, metadata');
    });

    it('should return only content strings in arrays', async () => {
      const result = await loader.loadDocuments();

      expect(result.qribar[0]).toBe('QRIBAR es una carta digital QR que revoluciona restaurantes...');
      expect(result.qribar[1]).toBe('Precios QRIBAR: Plan Básico $29/mes, Premium $49/mes...');
      expect(result.reviews[0]).toBe('Sistema de gestión de reputación online con tarjetas NFC...');
    });

    it('should handle empty database gracefully', async () => {
      mockSelect.mockResolvedValue({ data: [], error: null });

      const result = await loader.loadDocuments();
      expect(result).toEqual({});
    });

    it('should handle null data from Supabase', async () => {
      mockSelect.mockResolvedValue({ data: null, error: null });

      const result = await loader.loadDocuments();
      expect(result).toEqual({});
    });

    it('should include general category if present', async () => {
      mockSelect.mockResolvedValue({
        data: [
          { id: '4', content: 'SmartConnect info...', source: 'general', metadata: {} },
        ],
        error: null,
      });

      const result = await loader.loadDocuments();

      expect(result).toHaveProperty('general');
      expect(result.general).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on database connection failure', async () => {
      mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: 'PGRST301' },
      });

      await expect(loader.loadDocuments()).rejects.toThrow('Failed to load documents from Supabase: Connection failed');
    });

    it('should throw error on invalid Supabase credentials', async () => {
      mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key', code: 'PGRST301' },
      });

      await expect(loader.loadDocuments()).rejects.toThrow('Failed to load documents from Supabase: Invalid API key');
    });

    it('should handle documents without source field', async () => {
      mockSelect.mockResolvedValue({
        data: [
          { id: '5', content: 'No source document', metadata: {} }, // Missing 'source'
        ],
        error: null,
      });

      const result = await loader.loadDocuments();

      // Should be grouped under 'general' by default
      expect(result.general).toContain('No source document');
    });
  });

  describe('Configuration', () => {
    it('should validate required configuration', () => {
      expect(() => new SupabaseKnowledgeLoader({
        supabaseUrl: '',
        supabaseKey: 'test-key',
      })).toThrow('Supabase URL and key are required');

      expect(() => new SupabaseKnowledgeLoader({
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: '',
      })).toThrow('Supabase URL and key are required');
    });
  });

  describe('Statistics', () => {
    it('should provide loading statistics', async () => {
      await loader.loadDocuments();
      const stats = loader.getStats();

      expect(stats.totalDocuments).toBe(3);
      expect(stats.bySource).toEqual({
        qribar: 2,
        reviews: 1,
      });
      expect(stats.lastLoadedAt).toBeInstanceOf(Date);
    });
  });
});
