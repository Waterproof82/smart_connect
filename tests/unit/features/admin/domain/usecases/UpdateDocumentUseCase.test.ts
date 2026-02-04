/**
 * UpdateDocument Use Case Tests
 * 
 * Clean Architecture: Domain Layer - Use Case Testing
 */

import { UpdateDocumentUseCase } from '../../../../../../src/features/admin/domain/usecases/UpdateDocumentUseCase';
import { IDocumentRepository } from '../../../../../../src/features/admin/domain/repositories/IDocumentRepository';
import { AdminUser } from '../../../../../../src/features/admin/domain/entities/AdminUser';
import { Document } from '../../../../../../src/features/admin/domain/entities/Document';

describe('UpdateDocumentUseCase', () => {
  let updateDocumentUseCase: UpdateDocumentUseCase;
  let mockRepository: IDocumentRepository;
  let mockSuperAdmin: AdminUser;
  let mockRegularAdmin: AdminUser;
  let mockDocument: Document;

  beforeEach(() => {
    mockDocument = Document.create({
      id: '123',
      content: 'Old content',
      source: 'test',
      category: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn().mockResolvedValue(mockDocument),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(mockDocument),
      delete: jest.fn(),
      getStats: jest.fn(),
    };

    mockSuperAdmin = AdminUser.create({
      id: 'user1',
      email: 'admin@test.com',
      role: 'super_admin',
    });

    mockRegularAdmin = AdminUser.create({
      id: 'user2',
      email: 'viewer@test.com',
      role: 'admin',
    });

    updateDocumentUseCase = new UpdateDocumentUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update document with valid data and super_admin permissions', async () => {
      await updateDocumentUseCase.execute('123', 'New content', mockSuperAdmin);

      expect(mockRepository.getById).toHaveBeenCalledWith('123');
      expect(mockRepository.update).toHaveBeenCalledWith('123', 'New content');
    });

    it('should throw error if document ID is empty', async () => {
      await expect(
        updateDocumentUseCase.execute('', 'New content', mockSuperAdmin)
      ).rejects.toThrow('Document ID is required');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if content is empty', async () => {
      await expect(
        updateDocumentUseCase.execute('123', '', mockSuperAdmin)
      ).rejects.toThrow('Content is required');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if content exceeds maximum length', async () => {
      const longContent = 'a'.repeat(10001);

      await expect(
        updateDocumentUseCase.execute('123', longContent, mockSuperAdmin)
      ).rejects.toThrow('Content exceeds maximum length (10000 characters)');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user does not have update permissions', async () => {
      await expect(
        updateDocumentUseCase.execute('123', 'New content', mockRegularAdmin)
      ).rejects.toThrow('Insufficient permissions to update documents');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if document does not exist', async () => {
      mockRepository.getById = jest.fn().mockResolvedValue(null);

      await expect(
        updateDocumentUseCase.execute('123', 'New content', mockSuperAdmin)
      ).rejects.toThrow('Document not found');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should allow content with whitespace as long as it has non-whitespace characters', async () => {
      const contentWithWhitespace = '  Valid content with spaces  ';

      await updateDocumentUseCase.execute('123', contentWithWhitespace, mockSuperAdmin);

      expect(mockRepository.update).toHaveBeenCalledWith('123', contentWithWhitespace);
    });

    it('should throw error for only whitespace content', async () => {
      await expect(
        updateDocumentUseCase.execute('123', '   ', mockSuperAdmin)
      ).rejects.toThrow('Content is required');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
