/**
 * Unit Tests for DocumentRepositoryImpl
 * Tests document repository with mocked SupabaseDataSource
 */

import { DocumentRepositoryImpl } from '@features/chatbot/data/repositories';
import { DocumentEntity } from '@features/chatbot/domain/entities';
import type { SupabaseDataSource } from '@features/chatbot/data/datasources';

describe('DocumentRepositoryImpl', () => {
  let mockSupabaseDataSource: jest.Mocked<SupabaseDataSource>;
  let repository: DocumentRepositoryImpl;

  beforeEach(() => {
    mockSupabaseDataSource = {
      searchSimilarDocuments: jest.fn(),
    } as any;

    repository = new DocumentRepositoryImpl(mockSupabaseDataSource);
  });

  describe('searchSimilarDocuments', () => {
    it('should call data source with correct parameters', async () => {
      const params = {
        queryEmbedding: [0.1, 0.2, 0.3],
        limit: 5,
        threshold: 0.3,
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue([]);

      await repository.searchSimilarDocuments(params);

      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding: [0.1, 0.2, 0.3],
        matchCount: 5,
        matchThreshold: 0.3,
      });
    });

    it('should return documents from data source', async () => {
      const params = {
        queryEmbedding: [0.1, 0.2, 0.3],
        limit: 5,
        threshold: 0.3,
      };

      const mockDocs = [
        new DocumentEntity({
          id: 'doc1',
          content: 'QRIBAR information',
          metadata: { source: 'docs' },
          similarity: 0.95,
        }),
        new DocumentEntity({
          id: 'doc2',
          content: 'NFC reviews information',
          metadata: { source: 'docs' },
          similarity: 0.85,
        }),
      ];

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue(mockDocs);

      const result = await repository.searchSimilarDocuments(params);

      expect(result).toEqual(mockDocs);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no documents found', async () => {
      const params = {
        queryEmbedding: [0.1],
        limit: 5,
        threshold: 0.8,
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue([]);

      const result = await repository.searchSimilarDocuments(params);

      expect(result).toEqual([]);
    });

    it('should handle high similarity threshold', async () => {
      const params = {
        queryEmbedding: [0.5],
        limit: 10,
        threshold: 0.9, // Very high threshold
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue([]);

      await repository.searchSimilarDocuments(params);

      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ matchThreshold: 0.9 })
      );
    });

    it('should handle custom limit parameter', async () => {
      const params = {
        queryEmbedding: [0.1],
        limit: 20,
        threshold: 0.3,
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue([]);

      await repository.searchSimilarDocuments(params);

      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ matchCount: 20 })
      );
    });

    it('should propagate errors from data source', async () => {
      const params = {
        queryEmbedding: [0.1],
        limit: 5,
        threshold: 0.3,
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(repository.searchSimilarDocuments(params)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle 768-dimensional embeddings', async () => {
      const params = {
        queryEmbedding: new Array(768).fill(0).map(() => Math.random()),
        limit: 5,
        threshold: 0.3,
      };

      mockSupabaseDataSource.searchSimilarDocuments.mockResolvedValue([]);

      await repository.searchSimilarDocuments(params);

      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          queryEmbedding: expect.arrayContaining([expect.any(Number)]),
        })
      );
    });
  });
});
