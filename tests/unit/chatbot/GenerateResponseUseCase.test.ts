/**
 * Unit Tests for GenerateResponseUseCase
 * Tests RAG orchestration logic with mocked repositories
 */

import { GenerateResponseUseCase } from '@features/chatbot/domain/usecases';
import type { IChatRepository } from '@features/chatbot/domain/repositories/IChatRepository';
import type { IEmbeddingRepository } from '@features/chatbot/domain/repositories/IEmbeddingRepository';
import type { IDocumentRepository } from '@features/chatbot/domain/repositories/IDocumentRepository';
import { DocumentEntity } from '@features/chatbot/domain/entities';

describe('GenerateResponseUseCase', () => {
  let mockChatRepository: jest.Mocked<IChatRepository>;
  let mockEmbeddingRepository: jest.Mocked<IEmbeddingRepository>;
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let useCase: GenerateResponseUseCase;

  beforeEach(() => {
    mockChatRepository = {
      generateResponse: jest.fn(),
    };

    mockEmbeddingRepository = {
      generateEmbedding: jest.fn(),
      getDimensions: jest.fn().mockReturnValue(768),
    };

    mockDocumentRepository = {
      searchSimilarDocuments: jest.fn(),
    };

    useCase = new GenerateResponseUseCase(
      mockChatRepository,
      mockEmbeddingRepository,
      mockDocumentRepository
    );
  });

  describe('execute', () => {
    it('should generate embedding for user query when RAG is enabled', async () => {
      const input = {
        userQuery: 'Qué es QRIBAR?',
        includeContext: true,
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);
      mockChatRepository.generateResponse.mockResolvedValue('Respuesta generada');

      await useCase.execute(input);

      expect(mockEmbeddingRepository.generateEmbedding).toHaveBeenCalledWith(input.userQuery);
    });

    it('should search for similar documents when RAG is enabled', async () => {
      const input = {
        userQuery: 'Test query',
        includeContext: true,
        maxContextDocuments: 3,
      };

      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbeddingRepository.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);
      mockChatRepository.generateResponse.mockResolvedValue('Response');

      await useCase.execute(input);

      expect(mockDocumentRepository.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding: mockEmbedding,
        limit: 3,
        threshold: 0.3,
      });
    });

    it('should build context from relevant documents', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: true,
      };

      const mockDocs = [
        new DocumentEntity({
          content: 'First relevant content',
          metadata: { source: 'docs' },
        }),
        new DocumentEntity({
          content: 'Second relevant content',
          metadata: { source: 'docs' },
        }),
      ];

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue(mockDocs);
      mockChatRepository.generateResponse.mockResolvedValue('Response');

      const result = await useCase.execute(input);

      expect(result.contextUsed).toHaveLength(2);
      expect(result.contextUsed[0]).toBe('First relevant content');
      expect(result.contextUsed[1]).toBe('Second relevant content');
    });

    it('should return generated response from chat repository', async () => {
      const input = {
        userQuery: 'Test query',
        includeContext: false,
      };

      const expectedResponse = 'This is the AI generated response';
      mockChatRepository.generateResponse.mockResolvedValue(expectedResponse);

      const result = await useCase.execute(input);

      expect(result.response).toBe(expectedResponse);
      expect(result.documentsFound).toBe(0);
    });

    it('should skip RAG when includeContext is false', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: false,
      };

      mockChatRepository.generateResponse.mockResolvedValue('Response without context');

      await useCase.execute(input);

      expect(mockEmbeddingRepository.generateEmbedding).not.toHaveBeenCalled();
      expect(mockDocumentRepository.searchSimilarDocuments).not.toHaveBeenCalled();
    });

    it('should use default values for optional parameters', async () => {
      const input = {
        userQuery: 'Test',
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue([]);
      mockChatRepository.generateResponse.mockResolvedValue('Response');

      await useCase.execute(input);

      expect(mockDocumentRepository.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding: [0.1],
        limit: 3, // Default maxContextDocuments
        threshold: 0.3,
      });
    });

    it('should propagate errors from embedding repository', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: true,
      };

      mockEmbeddingRepository.generateEmbedding.mockRejectedValue(
        new Error('Embedding service unavailable')
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        'Embedding service unavailable'
      );
    });

    it('should propagate errors from document repository', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: true,
      };

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate errors from chat repository', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: false,
      };

      mockChatRepository.generateResponse.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        'API rate limit exceeded'
      );
    });

    it('should report correct number of documents found', async () => {
      const input = {
        userQuery: 'Test',
        includeContext: true,
      };

      const mockDocs = [
        new DocumentEntity({ content: 'Doc 1', metadata: {} }),
        new DocumentEntity({ content: 'Doc 2', metadata: {} }),
        new DocumentEntity({ content: 'Doc 3', metadata: {} }),
      ];

      mockEmbeddingRepository.generateEmbedding.mockResolvedValue([0.1]);
      mockDocumentRepository.searchSimilarDocuments.mockResolvedValue(mockDocs);
      mockChatRepository.generateResponse.mockResolvedValue('Response');

      const result = await useCase.execute(input);

      expect(result.documentsFound).toBe(3);
    });
  });
});
