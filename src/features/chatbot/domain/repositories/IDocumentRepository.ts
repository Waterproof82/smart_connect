/**
 * IDocumentRepository Interface
 * 
 * Defines the contract for document search and retrieval operations.
 * Handles vector similarity search for RAG.
 */

import { Document } from '../entities/Document';

export interface SearchDocumentsParams {
  queryEmbedding: number[];
  limit?: number;
  threshold?: number;
}

export interface IDocumentRepository {
  /**
   * Searches for documents similar to the query embedding
   * @returns Documents sorted by similarity (highest first)
   */
  searchSimilarDocuments(params: SearchDocumentsParams): Promise<Document[]>;

  /**
   * Stores a document with its embedding (for training/indexing)
   */
  storeDocument?(document: Document): Promise<void>;

  /**
   * Retrieves a document by ID
   */
  getDocumentById?(id: string): Promise<Document | null>;
}
