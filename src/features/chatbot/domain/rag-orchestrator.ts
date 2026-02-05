/**
 * RAG Orchestrator
 * 
 * Clean Architecture: Domain Layer
 * 
 * Responsabilidad:
 * - Coordinar las 3 fases de RAG (Indexing, Cache, Fallback)
 * - Ejecutar búsqueda semántica con embeddings
 * - Decidir cuándo usar cache vs generar nuevos embeddings
 * - Decidir cuándo usar RAG context vs fallback responses
 * - Proporcionar contexto enriquecido al chatbot
 * 
 * Integración de:
 * - Phase 1: RAGIndexer (Document chunking + embeddings)
 * - Phase 2: EmbeddingCache (Smart caching + Supabase backup)
 * - Phase 3: FallbackHandler (Intelligent fallback responses)
 * 
 * docs/adr/006-rag-architecture-decision.md
 */

import { IRAGIndexer, DocumentChunk } from './interfaces/IRAGIndexer';
import { IEmbeddingCache } from './interfaces/IEmbeddingCache';
import { 
  FallbackHandler, 
  FallbackContext, 
  FallbackResponse 
} from './fallback-handler';

export interface RAGDocument {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RAGSearchOptions {
  topK?: number;
  similarityThreshold?: number;
  useCache?: boolean;
  source?: string; // Filter by source instead of category
}

export interface RAGSearchResult {
  chunks: DocumentChunk[];
  relevanceScores: number[];
  totalFound: number;
  cacheHit: boolean;
  usedFallback: boolean;
  fallbackResponse?: FallbackResponse;
}

export interface RAGOrchestratorConfig {
  indexer: IRAGIndexer;
  cache: IEmbeddingCache;
  fallbackHandler?: FallbackHandler;
  defaultTopK?: number;
  defaultThreshold?: number;
  enableCache?: boolean;
}

export class RAGOrchestrator {
  private readonly indexer: IRAGIndexer;
  private readonly cache: IEmbeddingCache;
  private readonly fallbackHandler: FallbackHandler;
  private readonly config: {
    defaultTopK: number;
    defaultThreshold: number;
    enableCache: boolean;
  };
  private indexedChunks: DocumentChunk[] = [];

  constructor(config: RAGOrchestratorConfig) {
    this.indexer = config.indexer;
    this.cache = config.cache;
    this.fallbackHandler = config.fallbackHandler ?? new FallbackHandler();
    
    this.config = {
      defaultTopK: config.defaultTopK ?? 5,
      defaultThreshold: config.defaultThreshold ?? 0.7,
      enableCache: config.enableCache ?? true,
    };
  }

  /**
   * Index documents for RAG search
   * 
   * @param documents Documents to index
   * @returns Indexed chunks with embeddings
   */
  async indexDocuments(documents: RAGDocument[]): Promise<DocumentChunk[]> {
    // Group documents by source for batch indexing
    const groupedBySource = documents.reduce((acc, doc) => {
      if (!acc[doc.source]) {
        acc[doc.source] = [];
      }
      acc[doc.source].push(doc.content); // RAGIndexer expects string[] not objects
      return acc;
    }, {} as Record<string, string[]>);

    const allChunks: DocumentChunk[] = [];

    // Index each source group
    for (const [source, docs] of Object.entries(groupedBySource)) {
      const chunks = await this.indexer.indexDocuments({
        source,
        documents: docs,
      });
      
      // Store chunks in memory for fast search
      this.indexedChunks.push(...chunks);
      
      // Cache embeddings for future use
      if (this.config.enableCache) {
        for (const chunk of chunks) {
          const cacheKey = `chunk_${chunk.metadata.source}_${chunk.metadata.chunkIndex}`;
          await this.cache.set(cacheKey, chunk.embedding, {
            source: chunk.metadata.source,
            chunkIndex: chunk.metadata.chunkIndex,
          });
        }
      }

      allChunks.push(...chunks);
    }

    return allChunks;
  }

  /**
   * Search for relevant chunks using semantic similarity
   * 
   * @param query User query
   * @param options Search options
   * @returns Search results with chunks and relevance scores
   */
  async search(
    query: string,
    options: RAGSearchOptions = {}
  ): Promise<RAGSearchResult> {
    const {
      topK = this.config.defaultTopK,
      similarityThreshold = this.config.defaultThreshold,
      useCache = this.config.enableCache,
      source,
    } = options;

    // Handle empty query BEFORE generating embedding
    if (!query || query.trim().length === 0) {
      const fallbackContext: FallbackContext = {
        query: query || '',
        category: source || 'general',
        ragResults: [],
        confidence: 0,
      };
      const fallbackResponse = await this.fallbackHandler.getFallback(fallbackContext);
      
      return {
        chunks: [],
        relevanceScores: [],
        totalFound: 0,
        cacheHit: false,
        usedFallback: true,
        fallbackResponse,
      };
    }

    // Generate query embedding (with cache lookup)
    let queryEmbedding: number[];
    let cacheHit = false;

    if (useCache) {
      const cacheKey = `query_${this._hashQuery(query)}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        queryEmbedding = cached.embedding;
        cacheHit = true;
      } else {
        queryEmbedding = await this.indexer.generateEmbedding(query);
        await this.cache.set(cacheKey, queryEmbedding, {
          query,
          timestamp: Date.now(),
        });
      }
    } else {
      queryEmbedding = await this.indexer.generateEmbedding(query);
    }

    // Filter by source if specified
    let candidates = this.indexedChunks;
    if (source) {
      candidates = candidates.filter(chunk => chunk.metadata.source === source);
    }

    // Calculate cosine similarity for all chunks
    const similarities = candidates.map(chunk => ({
      chunk,
      score: this._cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by similarity (descending) and filter by threshold
    const relevantResults = similarities
      .filter(result => result.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // Check if we need fallback
    const usedFallback = relevantResults.length === 0;
    let fallbackResponse: FallbackResponse | undefined;

    if (usedFallback) {
      const fallbackContext: FallbackContext = {
        query,
        category: source || 'general', // Use source as category for fallback
        ragResults: [],
        confidence: 0,
      };
      fallbackResponse = await this.fallbackHandler.getFallback(fallbackContext);
    }

    return {
      chunks: relevantResults.map(r => r.chunk),
      relevanceScores: relevantResults.map(r => r.score),
      totalFound: relevantResults.length,
      cacheHit,
      usedFallback,
      fallbackResponse,
    };
  }

  /**
   * Get enriched context for chatbot
   * 
   * Combines RAG context or fallback response
   * 
   * @param query User query
   * @param options Search options
   * @returns Context string for prompt injection
   */
  async getContext(
    query: string,
    options: RAGSearchOptions = {}
  ): Promise<string> {
    const result = await this.search(query, options);

    if (result.usedFallback && result.fallbackResponse) {
      // Return fallback message as context
      return result.fallbackResponse.message;
    }

    // Combine relevant chunks into context
    const context = result.chunks
      .map((chunk, idx) => {
        const score = result.relevanceScores[idx];
        return `[Relevancia: ${(score * 100).toFixed(1)}%]\n${chunk.text}`;
      })
      .join('\n\n---\n\n');

    return context;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats() {
    return this.fallbackHandler.getStats();
  }

  /**
   * Clear cache and reset statistics
   */
  async reset() {
    await this.cache.clear();
    this.fallbackHandler.resetStats();
    this.indexedChunks = [];
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateCache(_pattern: string) {
    // Note: IEmbeddingCache doesn't support pattern invalidation
    // Use clear() for full cache reset or delete(key) for specific entries
    await this.cache.clear();
  }

  /**
   * Calculate cosine similarity between two vectors
   * 
   * @param a Vector A
   * @param b Vector B
   * @returns Similarity score (0-1)
   */
  private _cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Hash query for cache key generation
   * 
   * @param query Query string
   * @returns Hash string
   */
  private _hashQuery(query: string): string {
    // Simple hash function (can upgrade to crypto.subtle.digest in production)
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.codePointAt(i) ?? 0;
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
