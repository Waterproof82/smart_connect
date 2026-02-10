/**
 * DeleteDocument Use Case Tests
 * 
 * Clean Architecture: Domain Layer Tests
 * Tests de seguridad OWASP A01: Broken Access Control
 */

// All unused imports removed

import { DeleteDocumentUseCase } from '../../../../../src/features/admin/domain/usecases/DeleteDocumentUseCase';
import { IDocumentRepository } from '../../../../../src/features/admin/domain/repositories/IDocumentRepository';
import { AdminUser } from '../../../../../src/features/admin/domain/entities/AdminUser';
import { Document } from '../../../../../src/features/admin/domain/entities/Document';

describe('DeleteDocumentUseCase', () => {
	let mockRepository: jest.Mocked<IDocumentRepository>;
	let useCase: DeleteDocumentUseCase;
	let adminUser: AdminUser;
	let superAdminUser: AdminUser;
	let testDocument: Document;

	beforeEach(() => {
		mockRepository = {
			getAll: jest.fn(),
			getById: jest.fn(),
			count: jest.fn(),
			countBySource: jest.fn(),
			delete: jest.fn(),
			update: jest.fn(),
			create: jest.fn(),
			generateEmbedding: jest.fn(),
		};
		useCase = new DeleteDocumentUseCase(mockRepository);
		adminUser = AdminUser.create({
			id: 'admin-1',
			email: 'admin@test.com',
			role: 'admin',
			createdAt: new Date(),
		});
		superAdminUser = AdminUser.create({
			id: 'super-1',
			email: 'super@test.com',
			role: 'super_admin',
			createdAt: new Date(),
		});
		testDocument = Document.create({
			id: 'doc-1',
			content: 'Test content',
			source: 'qribar',
			createdAt: new Date(),
		});
	});

	it('should delete document if user has permission and document exists', async () => {
		mockRepository.getById.mockResolvedValue(testDocument);
		mockRepository.delete.mockResolvedValue();
		await expect(useCase.execute('doc-1', superAdminUser)).resolves.toBeUndefined();
		expect(mockRepository.getById).toHaveBeenCalledWith('doc-1');
		expect(mockRepository.delete).toHaveBeenCalledWith('doc-1');
	});

	it('should throw error if user does not have delete permission', async () => {
		mockRepository.getById.mockResolvedValue(testDocument);
		await expect(useCase.execute('doc-1', adminUser)).rejects.toThrow('Insufficient permissions to delete documents');
		expect(mockRepository.delete).not.toHaveBeenCalled();
	});

	it('should throw error if documentId is invalid', async () => {
		await expect(useCase.execute('', superAdminUser)).rejects.toThrow('Document ID is required');
		await expect(useCase.execute('   ', superAdminUser)).rejects.toThrow('Document ID is required');
		await expect(useCase.execute(undefined as any, superAdminUser)).rejects.toThrow('Document ID is required');
		expect(mockRepository.getById).not.toHaveBeenCalled();
		expect(mockRepository.delete).not.toHaveBeenCalled();
	});

	it('should throw error if document does not exist', async () => {
		mockRepository.getById.mockResolvedValue(null);
		await expect(useCase.execute('doc-404', superAdminUser)).rejects.toThrow('Document not found');
		expect(mockRepository.delete).not.toHaveBeenCalled();
	});
});
