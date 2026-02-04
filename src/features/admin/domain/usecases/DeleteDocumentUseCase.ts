/**
 * DeleteDocument Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para eliminar un documento.
 * Incluye validación de permisos.
 */

import { IDocumentRepository } from '../repositories/IDocumentRepository';
import { AdminUser } from '../entities/AdminUser';

export class DeleteDocumentUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(documentId: string, user: AdminUser): Promise<void> {
    // Validar ID
    if (!documentId || documentId.trim().length === 0) {
      throw new Error('Document ID is required');
    }

    // Verificar permisos (OWASP A01: Broken Access Control)
    if (!user.canPerform('delete')) {
      throw new Error('Insufficient permissions to delete documents');
    }

    // Verificar que el documento existe
    const document = await this.documentRepository.getById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Eliminar documento
    await this.documentRepository.delete(documentId);
  }
}
