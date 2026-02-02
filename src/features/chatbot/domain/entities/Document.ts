/**
 * Document Entity
 * 
 * Represents a knowledge base document with its vector embedding.
 * Used for RAG (Retrieval-Augmented Generation).
 */

export interface DocumentMetadata {
  title?: string;
  category?: string;
  source?: string;
  [key: string]: any;
}

export interface Document {
  readonly id: number;
  readonly content: string;
  readonly metadata: DocumentMetadata;
  readonly embedding?: number[];
  readonly similarity?: number;
}

export class DocumentEntity implements Document {
  readonly id: number;
  readonly content: string;
  readonly metadata: DocumentMetadata;
  readonly embedding?: number[];
  readonly similarity?: number;

  constructor(params: {
    id?: number;
    content: string;
    metadata?: DocumentMetadata;
    embedding?: number[];
    similarity?: number;
  }) {
    this.id = params.id ?? Math.floor(Math.random() * 1000000);
    this.content = params.content;
    this.metadata = params.metadata ?? {};
    this.embedding = params.embedding;
    this.similarity = params.similarity;
  }

  /**
   * Validates document
   */
  isValid(): boolean {
    return this.content.trim().length > 0;
  }

  /**
   * Checks if document is relevant based on similarity threshold
   */
  isRelevant(threshold: number = 0.3): boolean {
    return this.similarity !== undefined && this.similarity >= threshold;
  }

  /**
   * Returns a summary of the document
   */
  getSummary(maxLength: number = 200): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  /**
   * Creates a copy with similarity score
   */
  withSimilarity(similarity: number): DocumentEntity {
    return new DocumentEntity({
      id: this.id,
      content: this.content,
      metadata: this.metadata,
      embedding: this.embedding,
      similarity,
    });
  }
}
