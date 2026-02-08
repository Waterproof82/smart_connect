/**
 * SearchDocumentsUseCase
 * 
 * Business logic for searching relevant documents.
 * Can be used independently of chat generation.
 * 
 * Follows Single Responsibility Principle (SOLID).
 */

import { IEmbeddingRepository } from '../repositories/IEmbeddingRepository';
import { IDocumentRepository } from '../repositories/IDocumentRepository';
import { Document } from '../entities/Document';

export interface SearchDocumentsInput {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface SearchDocumentsOutput {
  documents: Document[];
  query: string;
  totalFound: number;
}

export class SearchDocumentsUseCase {
  constructor(
    private readonly embeddingRepository: IEmbeddingRepository,
    private readonly documentRepository: IDocumentRepository
  ) {}

  async execute(input: SearchDocumentsInput): Promise<SearchDocumentsOutput> {
    const { query, limit = 5, threshold = 0.3 } = input;

    // Buscar el embedding ya existente en Supabase
    // Asumimos que hay un método getEmbeddingByText en embeddingRepository
    const queryEmbedding = await this.embeddingRepository.getEmbeddingByText(query);

    if (!queryEmbedding || queryEmbedding.length !== 768) {
      return {
        documents: [],
        query,
        totalFound: 0,
      };
    }

    // Buscar documentos similares usando el embedding
    const documents = await this.documentRepository.searchSimilarDocuments({
      queryEmbedding,
      limit,
      threshold,
    });

    return {
      documents,
      query,
      totalFound: documents.length,
    };
  }
}
