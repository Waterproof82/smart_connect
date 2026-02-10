/**
 * RAG Orchestrator
 * Clean Architecture: Domain Layer
 * * Responsabilidades:
 * - Coordinar las 3 fases de RAG (Indexing, Cache, Fallback)
 * - Ejecutar búsqueda semántica con embeddings
 * - Gestionar la persistencia y recuperación en caché
 * - Proveer respuestas de fallback cuando no hay resultados
 */

import { IRAGIndexer, DocumentChunk } from './interfaces/IRAGIndexer';
import { IEmbeddingCache } from './interfaces/IEmbeddingCache';
import { FallbackHandler, FallbackResponse } from './fallback-handler';
import { ragLogger } from '../shared/rag-logger';

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
  source?: string;
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
   * Indexa documentos y almacena sus embeddings en caché
   */
  async indexDocuments(documents: RAGDocument[]): Promise<DocumentChunk[]> {
    ragLogger.logPhaseTransition('START', 'INDEXING', {
      totalDocuments: documents.length,
      sources: [...new Set(documents.map((d) => d.source))],
    });

    const groupedBySource = documents.reduce((acc, doc) => {
      if (!acc[doc.source]) acc[doc.source] = [];
      acc[doc.source].push(doc.content);
      return acc;
    }, {} as Record<string, string[]>);

    const allChunks: DocumentChunk[] = [];

    for (const [source, docs] of Object.entries(groupedBySource)) {
      const chunks = await this.indexer.indexDocuments({ source, documents: docs });

      this.indexedChunks.push(...chunks);

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

    ragLogger.logPhaseTransition('INDEXING', 'COMPLETE', {
      totalChunks: allChunks.length,
    });

    return allChunks;
  }

  /**
   * Ejecuta la búsqueda semántica con soporte de caché y fallback
   */
  async search(query: string, options: RAGSearchOptions = {}): Promise<RAGSearchResult> {
    const {
      topK = this.config.defaultTopK,
      similarityThreshold = this.config.defaultThreshold,
      useCache = this.config.enableCache,
      source,
    } = options;

    if (!query || query.trim().length === 0) {
      return this._handleFallback(query, source);
    }

    let queryEmbedding: number[];
    let isCacheHit = false;

    if (useCache) {
      const cacheKey = `query_${this._hashQuery(query)}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        queryEmbedding = cached.embedding;
        isCacheHit = true;
      } else {
        queryEmbedding = await this.indexer.generateEmbedding(query);
        await this.cache.set(cacheKey, queryEmbedding, { query, timestamp: Date.now() });
      }
    } else {
      queryEmbedding = await this.indexer.generateEmbedding(query);
    }

    let candidates = this.indexedChunks;
    if (source) {
      candidates = candidates.filter((c) => c.metadata.source === source);
    }

    const relevantResults = candidates
      .map((chunk) => ({
        chunk,
        score: this._cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((res) => res.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (relevantResults.length === 0) {
      return this._handleFallback(query, source);
    }

    return {
      chunks: relevantResults.map((r) => r.chunk),
      relevanceScores: relevantResults.map((r) => r.score),
      totalFound: relevantResults.length,
      cacheHit: isCacheHit,
      usedFallback: false,
    };
  }

  /**
   * Genera el contexto textual para el prompt del LLM
   */
  async getContext(query: string, options: RAGSearchOptions = {}): Promise<string> {
    const result = await this.search(query, options);

    if (result.usedFallback && result.fallbackResponse) {
      return result.fallbackResponse.message;
    }

    return result.chunks
      .map((chunk, idx) => {
        const score = result.relevanceScores[idx];
        return `[Relevancia: ${(score * 100).toFixed(1)}%] Source: ${chunk.metadata.source}\n${chunk.text}`;
      })
      .join('\n\n---\n\n');
  }

  // --- Gestión de Estado y Caché ---

  async reset() {
    await this.cache.clear();
    this.fallbackHandler.resetStats();
    this.indexedChunks = [];
  }

  async invalidateCache(keyPattern: string): Promise<void> {
    if (typeof this.cache.invalidate === 'function') {
      await this.cache.invalidate(keyPattern);
    } else if (keyPattern === '*' && typeof this.cache.clear === 'function') {
      await this.cache.clear();
    } else {
      throw new Error('Cache implementation does not support targeted invalidation');
    }
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  getFallbackStats() {
    return this.fallbackHandler.getStats();
  }

  // --- Utilidades Privadas ---

  private async _handleFallback(query: string, source?: string): Promise<RAGSearchResult> {
    const fallback = await this.fallbackHandler.getFallback({
      query,
      category: source || 'general',
      ragResults: [],
      confidence: 0,
    });

    return {
      chunks: [],
      relevanceScores: [],
      totalFound: 0,
      cacheHit: false,
      usedFallback: true,
      fallbackResponse: fallback,
    };
  }

  private _cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const result = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Number.isNaN(result) ? 0 : result;
  }

  private _hashQuery(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.codePointAt(i) ?? 0;
      hash = (hash << 5) - hash + char;
      hash = Math.trunc(hash);
    }
    return Math.abs(Math.trunc(hash)).toString(36);
  }
}