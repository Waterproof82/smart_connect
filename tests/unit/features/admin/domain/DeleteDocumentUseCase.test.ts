/**
 * DeleteDocument Use Case Tests
 * 
 * Clean Architecture: Domain Layer Tests
 * Tests de seguridad OWASP A01: Broken Access Control
 */

import { DeleteDocumentUseCase } from '@/features/admin/domain/usecases/DeleteDocumentUseCase';
import { IDocumentRepository } from '@/features/admin/domain/repositories/IDocumentRepository';
import { AdminUser } from '@/features/admin/domain/entities/AdminUser';
import { Document } from '@/features/admin/domain/entities/Document';

describe('DeleteDocumentUseCase - Security Tests (OWASP A01)', () => {
  let useCase: DeleteDocumentUseCase;
  let mockRepository: jest.Mocked<IDocumentRepository>;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      countBySource: jest.fn(),
      countByCategory: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    useCase = new DeleteDocumentUseCase(mockRepository);
  });

  describe('Authorization Tests', () => {
    it('should allow super_admin to delete documents', async () => {
      const superAdmin = AdminUser.create({
        id: '1',
        email: 'super@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      const mockDoc = Document.create({
        id: 'doc-1',
        content: 'Test',
        source: 'qribar',
        createdAt: new Date(),
      });

      mockRepository.getById.mockResolvedValue(mockDoc);
      mockRepository.delete.mockResolvedValue();

      await useCase.execute('doc-1', superAdmin);

      expect(mockRepository.delete).toHaveBeenCalledWith('doc-1');
    });

    it('should PREVENT regular admin from deleting documents (OWASP A01)', async () => {
      const regularAdmin = AdminUser.create({
        id: '2',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: new Date(),
      });

      await expect(
        useCase.execute('doc-1', regularAdmin)
      ).rejects.toThrow('Insufficient permissions to delete documents');

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Validation Tests', () => {
    it('should throw error for empty document ID', async () => {
      const superAdmin = AdminUser.create({
        id: '1',
        email: 'super@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      await expect(
        useCase.execute('', superAdmin)
      ).rejects.toThrow('Document ID is required');
    });

    it('should throw error if document not found', async () => {
      const superAdmin = AdminUser.create({
        id: '1',
        email: 'super@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      mockRepository.getById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent', superAdmin)
      ).rejects.toThrow('Document not found');
    });
  });
});
