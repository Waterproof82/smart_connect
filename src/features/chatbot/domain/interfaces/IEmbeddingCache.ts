/**
 * Embedding Cache Interface
 * 
 * Clean Architecture: Domain Layer
 * 
 * This interface defines the contract for embedding cache operations.
 * Implementations should live in the Data Layer.
 */

export interface CacheEntry {
  key: string;
  embedding: number[];
  metadata?: unknown;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memorySize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

/**
 * Interface for embedding cache operations
 */
export interface IEmbeddingCache {
  /**
   * Get embedding from cache
   * 
   * @param key Cache key
   * @returns Cache entry or null if not found/expired
   */
  get(key: string): Promise<CacheEntry | null>;

  /**
   * Set embedding in cache
   * 
   * @param key Cache key
   * @param embedding Embedding vector
   * @param metadata Optional metadata
   */
  set(key: string, embedding: number[], metadata?: unknown): Promise<void>;

  /**
   * Delete entry from cache
   * 
   * @param key Cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getStats(): CacheStats;

  /**
   * Check if cache has entry
   * 
   * @param key Cache key
   * @returns true if entry exists and is valid
   */
  has(key: string): Promise<boolean>;
}
