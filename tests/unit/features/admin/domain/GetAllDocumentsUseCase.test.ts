/**
 * GetAllDocuments Use Case Tests
 * 
 * Clean Architecture: Domain Layer Tests
 */

import { GetAllDocumentsUseCase } from '@/features/admin/domain/usecases/GetAllDocumentsUseCase';
import { IDocumentRepository } from '@/features/admin/domain/repositories/IDocumentRepository';
import { Document } from '@/features/admin/domain/entities/Document';

describe('GetAllDocumentsUseCase', () => {
  let useCase: GetAllDocumentsUseCase;
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

    useCase = new GetAllDocumentsUseCase(mockRepository);
  });

  it('should get all documents with default pagination', async () => {
    const mockDocuments = [
      Document.create({
        id: '1',
        content: 'Test 1',
        source: 'qribar',
        createdAt: new Date(),
      }),
      Document.create({
        id: '2',
        content: 'Test 2',
        source: 'reviews',
        createdAt: new Date(),
      }),
    ];

    mockRepository.getAll.mockResolvedValue({
      data: mockDocuments,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const result = await useCase.execute();

    expect(result.data.length).toBe(2);
    expect(result.total).toBe(2);
    expect(mockRepository.getAll).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should apply filters', async () => {
    mockRepository.getAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    const filters = { source: 'qribar', searchText: 'precio' };
    await useCase.execute(filters);

    expect(mockRepository.getAll).toHaveBeenCalledWith(filters, undefined);
  });

  it('should apply pagination', async () => {
    mockRepository.getAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      pageSize: 10,
      totalPages: 0,
    });

    const pagination = { page: 2, pageSize: 10 };
    await useCase.execute(undefined, pagination);

    expect(mockRepository.getAll).toHaveBeenCalledWith(undefined, pagination);
  });

  it('should throw error for invalid page number', async () => {
    await expect(
      useCase.execute(undefined, { page: 0, pageSize: 20 })
    ).rejects.toThrow('Page number must be greater than 0');
  });

  it('should throw error for invalid page size', async () => {
    await expect(
      useCase.execute(undefined, { page: 1, pageSize: 0 })
    ).rejects.toThrow('Page size must be between 1 and 100');

    await expect(
      useCase.execute(undefined, { page: 1, pageSize: 101 })
    ).rejects.toThrow('Page size must be between 1 and 100');
  });
});
