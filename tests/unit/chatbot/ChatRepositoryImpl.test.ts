/**
 * Unit Tests for ChatRepositoryImpl
 * Tests chat repository with mocked GeminiDataSource
 */

import { ChatRepositoryImpl } from '@features/chatbot/data/repositories';
import type { GeminiDataSource } from '@features/chatbot/data/datasources';

describe('ChatRepositoryImpl', () => {
  let mockGeminiDataSource: jest.Mocked<GeminiDataSource>;
  let repository: ChatRepositoryImpl;

  beforeEach(() => {
    mockGeminiDataSource = {
      generateResponse: jest.fn(),
      generateEmbedding: jest.fn(),
    } as any;

    repository = new ChatRepositoryImpl(mockGeminiDataSource);
  });

  describe('generateResponse', () => {
    it('should call data source with transformed parameters', async () => {
      const params = {
        userQuery: 'Test query',
        context: 'Test context',
        temperature: 0.7,
        maxTokens: 500,
      };

      mockGeminiDataSource.generateResponse.mockResolvedValue('AI response');

      await repository.generateResponse(params);

      // Repository transforms params: userQuery -> prompt
      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalledWith({
        prompt: 'Test query',
        temperature: 0.7,
        maxTokens: 500,
      });
    });

    it('should return response from data source', async () => {
      const params = {
        userQuery: 'What is QRIBAR?',
      };

      const expectedResponse = 'QRIBAR is a digital menu solution';
      mockGeminiDataSource.generateResponse.mockResolvedValue(expectedResponse);

      const result = await repository.generateResponse(params);

      expect(result).toBe(expectedResponse);
    });

    it('should handle empty context', async () => {
      const params = {
        userQuery: 'Test',
        context: '',
      };

      mockGeminiDataSource.generateResponse.mockResolvedValue('Response');

      await repository.generateResponse(params);

      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalledWith({
        prompt: 'Test',
        temperature: undefined,
        maxTokens: undefined,
      });
    });

    it('should propagate errors from data source', async () => {
      const params = {
        userQuery: 'Test',
      };

      mockGeminiDataSource.generateResponse.mockRejectedValue(
        new Error('Network error')
      );

      await expect(repository.generateResponse(params)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle custom temperature', async () => {
      const params = {
        userQuery: 'Test',
        temperature: 0.9,
      };

      mockGeminiDataSource.generateResponse.mockResolvedValue('Response');

      await repository.generateResponse(params);

      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.9 })
      );
    });

    it('should handle custom maxTokens', async () => {
      const params = {
        userQuery: 'Test',
        maxTokens: 1000,
      };

      mockGeminiDataSource.generateResponse.mockResolvedValue('Response');

      await repository.generateResponse(params);

      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({ maxTokens: 1000 })
      );
    });
  });
});
