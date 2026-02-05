import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateDocumentUseCase } from '../../../../../../src/features/admin/domain/usecases/CreateDocumentUseCase';
import { IDocumentRepository } from '../../../../../../src/features/admin/domain/repositories/IDocumentRepository';
import { AdminUser } from '../../../../../../src/features/admin/domain/entities/AdminUser';
import { Document } from '../../../../../../src/features/admin/domain/entities/Document';

describe('CreateDocumentUseCase', () => {
  let useCase: CreateDocumentUseCase;
  let mockRepository: jest.Mocked<IDocumentRepository>;
  let superAdmin: AdminUser;
  let regularAdmin: AdminUser;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      generateEmbedding: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
      countBySource: jest.fn(),
      countByCategory: jest.fn(),
      count: jest.fn(),
    } as jest.Mocked<IDocumentRepository>;

    useCase = new CreateDocumentUseCase(mockRepository);

    superAdmin = AdminUser.create({
      id: 'admin-1',
      email: 'super@admin.com',
      role: 'super_admin',
      createdAt: new Date(),
    });

    regularAdmin = AdminUser.create({
      id: 'admin-2',
      email: 'regular@admin.com',
      role: 'admin',
      createdAt: new Date(),
    });
  });

  describe('OWASP A01: Access Control', () => {
    it('should ALLOW super_admin to create documents', async () => {
      const mockEmbedding = new Array(768).fill(0.5);
      mockRepository.generateEmbedding.mockResolvedValue(mockEmbedding);

      const mockDoc = Document.create({
        id: 'doc-1',
        content: 'Test content',
        source: 'test_source',
        metadata: {},
        embedding: mockEmbedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRepository.create.mockResolvedValue(mockDoc);

      const result = await useCase.execute(
        'Test content',
        'test_source',
        {},
        superAdmin
      );

      expect(result).toBeDefined();
      expect(mockRepository.generateEmbedding).toHaveBeenCalledWith('Test content');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should PREVENT regular admin from creating documents (OWASP A01)', async () => {
      await expect(
        useCase.execute('Test', 'source', {}, regularAdmin)
      ).rejects.toThrow('Insufficient permissions');

      expect(mockRepository.generateEmbedding).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Content Validation', () => {
    it('should reject empty content', async () => {
      await expect(
        useCase.execute('', 'source', {}, superAdmin)
      ).rejects.toThrow('Content cannot be empty');
    });

    it('should reject whitespace-only content', async () => {
      await expect(
        useCase.execute('   ', 'source', {}, superAdmin)
      ).rejects.toThrow('Content cannot be empty');
    });

    it('should reject content over 10000 characters', async () => {
      const longContent = 'a'.repeat(10001);

      await expect(
        useCase.execute(longContent, 'source', {}, superAdmin)
      ).rejects.toThrow('Content too long (max 10000 characters)');
    });

    it('should accept content exactly at 10000 characters', async () => {
      const maxContent = 'a'.repeat(10000);
      const mockEmbedding = new Array(768).fill(0.5);
      mockRepository.generateEmbedding.mockResolvedValue(mockEmbedding);

      const mockDoc = Document.create({
        id: 'doc-1',
        content: maxContent,
        source: 'test',
        metadata: {},
        embedding: mockEmbedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRepository.create.mockResolvedValue(mockDoc);

      await expect(
        useCase.execute(maxContent, 'test', {}, superAdmin)
      ).resolves.toBeDefined();
    });
  });

  describe('Source Validation', () => {
    it('should reject empty source', async () => {
      await expect(
        useCase.execute('Content', '', {}, superAdmin)
      ).rejects.toThrow('Source cannot be empty');
    });

    it('should trim and accept valid source', async () => {
      const mockEmbedding = new Array(768).fill(0.5);
      mockRepository.generateEmbedding.mockResolvedValue(mockEmbedding);

      const mockDoc = Document.create({
        id: 'doc-1',
        content: 'Test',
        source: 'test_source',
        metadata: {},
        embedding: mockEmbedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRepository.create.mockResolvedValue(mockDoc);

      const result = await useCase.execute(
        'Test',
        '  test_source  ',
        {},
        superAdmin
      );

      expect(result.source).toBe('test_source');
    });
  });

  describe('Embedding Auto-Generation', () => {
    it('should generate embedding before creating document', async () => {
      const mockEmbedding = new Array(768).fill(0.123);
      mockRepository.generateEmbedding.mockResolvedValue(mockEmbedding);

      const mockDoc = Document.create({
        id: 'doc-1',
        content: 'Test content',
        source: 'test',
        metadata: {},
        embedding: mockEmbedding,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRepository.create.mockResolvedValue(mockDoc);

      await useCase.execute('Test content', 'test', {}, superAdmin);

      expect(mockRepository.generateEmbedding).toHaveBeenCalledWith('Test content');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test content',
          embedding: mockEmbedding,
        })
      );
    });

    it('should throw error if embedding generation fails', async () => {
      mockRepository.generateEmbedding.mockRejectedValue(
        new Error('Gemini API error')
      );

      await expect(
        useCase.execute('Test', 'source', {}, superAdmin)
      ).rejects.toThrow('Gemini API error');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
