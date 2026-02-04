/**
 * RAG Indexer Interface
 * 
 * Clean Architecture: Domain Layer
 * 
 * This interface defines the contract for document indexing operations.
 * Implementations should live in the Data Layer.
 */

export interface ChunkMetadata {
  source: string;
  category?: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentChunk {
  text: string;
  embedding: number[];
  metadata: ChunkMetadata;
}

export interface IndexDocumentsParams {
  source: string;
  documents: string[];
  category?: string;
}

/**
 * Interface for RAG document indexing
 */
export interface IRAGIndexer {
  /**
   * Index documents and generate embeddings
   * 
   * @param params Indexing parameters
   * @returns Array of document chunks with embeddings
   */
  indexDocuments(params: IndexDocumentsParams): Promise<DocumentChunk[]>;

  /**
   * Generate embedding for a single text
   * 
   * @param text Text to generate embedding for
   * @returns Embedding vector
   */
  generateEmbedding(text: string): Promise<number[]>;
}
