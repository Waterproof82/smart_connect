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

    // 1. Generate embedding for the search query
    const queryEmbedding = await this.embeddingRepository.generateEmbedding(
      query
    );

    // 2. Search for similar documents
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
