import { Document } from '../entities/Document';
import { AdminUser } from '../entities/AdminUser';
import { IDocumentRepository } from '../repositories/IDocumentRepository';

/**
 * Use Case: Create new document with automatic embedding generation
 * 
 * Security: OWASP A01 - Only super_admin can create documents
 * RAG Integration: Generates embedding BEFORE persisting (atomicity)
 * 
 * @throws {Error} If user lacks permissions
 * @throws {Error} If content validation fails
 * @throws {Error} If embedding generation fails
 */
export class CreateDocumentUseCase {
  constructor(private readonly repository: IDocumentRepository) {}

  async execute(
    content: string,
    source: string,
    metadata: Record<string, unknown>,
    user: AdminUser
  ): Promise<Document> {
    // 🔒 OWASP A01: Broken Access Control - Validate permissions
    if (!user.canPerform('create')) {
      throw new Error('Insufficient permissions');
    }

    // ✅ Validate content
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      throw new Error('Content cannot be empty');
    }

    if (trimmedContent.length > 10000) {
      throw new Error('Content too long (max 10000 characters)');
    }

    // ✅ Validate source
    const trimmedSource = source.trim();
    if (trimmedSource.length === 0) {
      throw new Error('Source cannot be empty');
    }

    // 🤖 CRITICAL: Generate embedding BEFORE creating document
    // If this fails, the document is NOT created (atomicity)
    const embedding = await this.repository.generateEmbedding(trimmedContent);

    // 💾 Create document with embedding included
    const document = Document.create({
      id: '', // Will be set by repository
      content: trimmedContent,
      source: trimmedSource,
      metadata,
      embedding, // ✅ Guaranteed to exist
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.repository.create(document);
  }
}
