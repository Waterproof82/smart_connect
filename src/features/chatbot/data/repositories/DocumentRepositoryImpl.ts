/**
 * DocumentRepositoryImpl
 * 
 * Implementation of IDocumentRepository using SupabaseDataSource.
 */

import {
  IDocumentRepository,
  SearchDocumentsParams,
} from '../../domain/repositories/IDocumentRepository';
import { Document, DocumentEntity } from '../../domain/entities/Document';
import { SupabaseDataSource } from '../datasources/SupabaseDataSource';
import { ragLogger } from '../../shared/rag-logger';

export class DocumentRepositoryImpl implements IDocumentRepository {
  constructor(private readonly supabaseDataSource: SupabaseDataSource) {}

  async searchSimilarDocuments(
    params: SearchDocumentsParams
  ): Promise<Document[]> {
    ragLogger.logDocumentSearch('DocumentRepository: Starting search', {
      params: {
        hasQueryEmbedding: !!params.queryEmbedding,
        threshold: params.threshold ?? 0.3,
        limit: params.limit ?? 5
      }
    });

    const results = await this.supabaseDataSource.searchSimilarDocuments({
      queryEmbedding: params.queryEmbedding,
      matchThreshold: params.threshold ?? 0.3,
      matchCount: params.limit ?? 5,
    });

    // Map to domain entities
    const mappedResults = results.map(
      (doc) =>
        new DocumentEntity({
          id: typeof doc.id === 'string' ? Number.parseInt(doc.id, 10) : doc.id,
          content: doc.content,
          metadata: doc.metadata,
          embedding: doc.embedding,
          similarity: doc.similarity,
        })
    );

    ragLogger.logDocumentSearch('DocumentRepository: Mapping completed', {
      originalResults: results.length,
      mappedResults: mappedResults.length,
      mappingDetails: mappedResults.slice(0, 3).map(doc => ({
        id: doc.id,
        hasEmbedding: !!doc.embedding,
        similarity: doc.similarity,
        contentLength: doc.content?.length,
        metadataKeys: Object.keys(doc.metadata || {})
      }))
    }, mappedResults as unknown as Record<string, unknown>[]);

    return mappedResults;
  }

  async storeDocument(document: Document): Promise<void> {
    if (!document.embedding) {
      throw new Error('Document must have an embedding to be stored');
    }

    await this.supabaseDataSource.storeDocument({
      id: String(document.id),
      content: document.content,
      metadata: document.metadata,
      embedding: document.embedding,
    });
  }

  async getDocumentById(id: number): Promise<Document | null> {
    const doc = await this.supabaseDataSource.getDocumentById(String(id));

    if (!doc) {
      return null;
    }

    return new DocumentEntity({
      id: typeof doc.id === 'string' ? Number.parseInt(doc.id, 10) : doc.id,
      content: doc.content,
      metadata: doc.metadata,
      embedding: doc.embedding,
    });
  }
}
