/**
 * Unit Tests for EmbeddingRepositoryImpl
 * Tests embedding repository with mocked GeminiDataSource
 */

import { EmbeddingRepositoryImpl } from '@features/chatbot/data/repositories';
import type { GeminiDataSource } from '@features/chatbot/data/datasources';

describe('EmbeddingRepositoryImpl', () => {
  let mockGeminiDataSource: jest.Mocked<GeminiDataSource>;
  let repository: EmbeddingRepositoryImpl;

  beforeEach(() => {
    mockGeminiDataSource = {
      generateEmbedding: jest.fn(),
      generateResponse: jest.fn(),
    } as any;

    repository = new EmbeddingRepositoryImpl(mockGeminiDataSource);
  });

  describe('generateEmbedding', () => {
    it('should call data source with text', async () => {
      const text = 'Test text for embedding';
      const mockEmbedding = [0.1, 0.2, 0.3];

      mockGeminiDataSource.generateEmbedding.mockResolvedValue(mockEmbedding);

      await repository.generateEmbedding(text);

      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalledWith(text);
    });

    it('should return embedding from data source', async () => {
      const text = 'QRIBAR digital menu';
      const expectedEmbedding = new Array(768).fill(0).map(() => Math.random());

      mockGeminiDataSource.generateEmbedding.mockResolvedValue(expectedEmbedding);

      const result = await repository.generateEmbedding(text);

      expect(result).toEqual(expectedEmbedding);
      expect(result.length).toBe(768);
    });

    it('should handle empty text', async () => {
      const text = '';
      mockGeminiDataSource.generateEmbedding.mockResolvedValue([]);

      await repository.generateEmbedding(text);

      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalledWith(text);
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(10000);
      const mockEmbedding = new Array(768).fill(0.5);

      mockGeminiDataSource.generateEmbedding.mockResolvedValue(mockEmbedding);

      const result = await repository.generateEmbedding(longText);

      expect(result).toEqual(mockEmbedding);
    });

    it('should propagate errors from data source', async () => {
      const text = 'Test';

      mockGeminiDataSource.generateEmbedding.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(repository.generateEmbedding(text)).rejects.toThrow(
        'API rate limit exceeded'
      );
    });
  });

  describe('getDimensions', () => {
    it('should return 768 (Gemini embedding dimensions)', () => {
      const dimensions = repository.getDimensions();

      expect(dimensions).toBe(768);
    });
  });
});
