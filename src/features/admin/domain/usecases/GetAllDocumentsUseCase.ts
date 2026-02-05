/**
 * GetAllDocuments Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para obtener todos los documentos con filtros y paginación.
 */

import { 
  IDocumentRepository, 
  DocumentFilters, 
  PaginationOptions,
  PaginatedResult 
} from '../repositories/IDocumentRepository';
import { Document } from '../entities/Document';

export class GetAllDocumentsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(
    filters?: DocumentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Document>> {
    // Validar paginación
    if (pagination) {
      if (pagination.page < 1) {
        throw new Error('Page number must be greater than 0');
      }
      if (pagination.pageSize < 1 || pagination.pageSize > 100) {
        throw new Error('Page size must be between 1 and 100');
      }
    }

    // Ejecutar consulta
    return await this.documentRepository.getAll(filters, pagination);
  }
}
