/**
 * Unit Tests for SearchDocumentsUseCase
 * Tests document search orchestration with mocked repositories
 */

import { SearchDocumentsUseCase } from '@features/chatbot/domain/usecases';
import type { IEmbeddingRepository } from '@features/chatbot/domain/repositories/IEmbeddingRepository';
import type { IDocumentRepository } from '@features/chatbot/domain/repositories/IDocumentRepository';
import { DocumentEntity } from '@features/chatbot/domain/entities';

describe('SearchDocumentsUseCase', () => {
  let mockEmbeddingRepository: jest.Mocked<IEmbeddingRepository>;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let useCase: SearchDocumentsUseCase;

  beforeEach(() => {
    mockEmbeddingRepository = {
      generateEmbedding: jest.fn(),
      getDimensions: jest.fn().mockReturnValue(768),
    };

    mockDocumentRepository = {
      searchSimilarDocuments: jest.fn(),
    };

    useCase = new SearchDocumentsUseCase(
      mockEmbeddingRepository,
      mockDocumentRepository
    );
  });

  describe('execute', () => {
    it('should generate embedding for query', async () => {
      const input = {
        query: 'QRIBAR features',
        limit: 10,
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1, 0.2]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);

      await useCase.execute(input);

      expect(mockEmbeddingRepository.generateEmbedding).toHaveBeenCalledWith(input.query);
    });

    it('should search documents with generated embedding', async () => {
      const input = {
        query: 'Test query',
        limit: 10,
        threshold: 0.5,
      };

      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbeddingRepository.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);

      await useCase.execute(input);

      expect(mockDocumentRepository.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding: mockEmbedding,
        limit: 10,
        threshold: 0.5,
      });
    });

    it('should use default values for optional parameters', async () => {
      const input = {
        query: 'Test',
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);

      await useCase.execute(input);

      expect(mockDocumentRepository.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding: [0.1],
        limit: 5, // Default
        threshold: 0.3, // Default
      });
    });

    it('should return documents from repository', async () => {
      const input = {
        query: 'Test',
      };

      const mockDocs = [
        new DocumentEntity({
          content: 'Document 1 content',
          metadata: { source: 'docs' },
          similarity: 0.95,
        }),
        new DocumentEntity({
          content: 'Document 2 content',
          metadata: { source: 'docs' },
          similarity: 0.85,
        }),
      ];

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue(mockDocs);

      const result = await useCase.execute(input);

      expect(result.documents).toEqual(mockDocs);
      expect(result.totalFound).toBe(2);
      expect(result.query).toBe('Test');
    });

    it('should return empty array when no documents found', async () => {
      const input = {
        query: 'Nonexistent query',
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);

      const result = await useCase.execute(input);

      expect(result.documents).toEqual([]);
      expect(result.totalFound).toBe(0);
    });

    it('should propagate errors from embedding repository', async () => {
      const input = {
        query: 'Test',
      };

      mockEmbeddingRepository.generateEmbedding.mockRejectedValue(
        new Error('Embedding generation failed')
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        'Embedding generation failed'
      );
    });

    it('should propagate errors from document repository', async () => {
      const input = {
        query: 'Test',
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockRejectedValue(
        new Error('Database unavailable')
      );

      await expect(useCase.execute(input)).rejects.toThrow('Database unavailable');
    });

    it('should handle very long queries', async () => {
      const longQuery = 'A'.repeat(5000);
      const input = {
        query: longQuery,
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);

      await useCase.execute(input);

      expect(mockEmbeddingRepository.generateEmbedding).toHaveBeenCalledWith(longQuery);
    });
  });
});
