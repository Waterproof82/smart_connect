/**
 * UpdateDocument Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para actualizar un documento y regenerar su embedding.
 */

import { IDocumentRepository } from '../repositories/IDocumentRepository';
import { AdminUser } from '../entities/AdminUser';

export class UpdateDocumentUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(documentId: string, newContent: string, user: AdminUser, newSource?: string): Promise<void> {
    // Validar ID
    if (!documentId || typeof documentId !== 'string' || documentId.trim().length === 0) {
      throw new Error('Document ID is required');
    }

    // Validar contenido
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Content is required');
    }

    if (newContent.length > 10000) {
      throw new Error('Content exceeds maximum length (10000 characters)');
    }

    // Validar source si se proporciona
    if (newSource?.trim().length === 0) {
      throw new Error('Source cannot be empty string');
    }

    // Verificar permisos (OWASP A01: Broken Access Control)
    if (!user.canPerform('update')) {
      throw new Error('Insufficient permissions to update documents');
    }

    // Verificar que el documento existe
    const document = await this.documentRepository.getById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Actualizar documento (el repositorio se encargará de regenerar el embedding)
    await this.documentRepository.update(documentId, newContent, newSource);
  }
}
