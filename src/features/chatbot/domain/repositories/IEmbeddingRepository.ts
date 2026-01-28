/**
 * IEmbeddingRepository Interface
 * 
 * Defines the contract for embedding generation operations.
 * Abstracts the embedding provider (Gemini, OpenAI, etc.)
 */

export interface IEmbeddingRepository {
  /**
   * Generates an embedding vector for the given text
   * @returns Array of floats representing the embedding (typically 768 dimensions)
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Gets the dimension size of embeddings (e.g., 768 for Gemini)
   */
  getDimensions(): number;
}
