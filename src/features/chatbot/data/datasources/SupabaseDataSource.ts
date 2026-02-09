/**
 * SupabaseDataSource
 * 
 * Handles communication with Supabase PostgreSQL + pgvector.
 * Manages document storage and vector similarity search.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '@core/domain/entities';
import { ragLogger } from '../../shared/rag-logger';

export interface SupabaseDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  similarity?: number;
}

export class SupabaseDataSource {
  private readonly supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Searches for documents similar to the query embedding
   * 
   * Security: OWASP A01:2021 (Broken Access Control)
   * - Supports tenant isolation via tenantId parameter
   * - Filters results by tenant to prevent data leakage
   */
  async searchSimilarDocuments(params: {
    queryEmbedding: number[];
    matchThreshold: number;
    matchCount: number;
    tenantId?: string; // NEW: Add tenant isolation
  }): Promise<SupabaseDocument[]> {
    ragLogger.logVectorSearch(
      params.queryEmbedding,
      params.matchThreshold,
      params.matchCount,
      0 // We'll update after the search
    );

    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: params.queryEmbedding,
      match_threshold: params.matchThreshold,
      match_count: params.matchCount,
      tenant_id: params.tenantId, // Pass tenant filter to database
    });

    if (error) {
      ragLogger.logDocumentSearch('Supabase RPC call failed', { error: error.message, params }, []);
      throw new ApiError(`Document search failed: ${error.message}`, 500);
    }

    // Additional safety check: Filter results by tenant in application layer
    let results = data || [];
    if (params.tenantId) {
      const beforeFilter = results.length;
      results = results.filter((doc: SupabaseDocument) => 
        doc.metadata?.tenant_id === params.tenantId || 
        doc.metadata?.tenant_id === undefined // Allow public documents
      );
      
      ragLogger.logDocumentSearch('Tenant filtering applied', {
        tenantId: params.tenantId,
        beforeFilter,
        afterFilter: results.length,
        filtered: beforeFilter - results.length
      }, results);
    }

    // Log the final results with metadata details
    ragLogger.logDocumentSearch('Vector search completed', {
      params,
      totalResults: results.length,
      topResults: results.slice(0, 3).map(doc => ({
        id: doc.id,
        similarity: doc.similarity,
        source: doc.metadata?.source,
        contentPreview: doc.content?.substring(0, 100) + '...',
        metadataKeys: Object.keys(doc.metadata || {})
      }))
    }, results);

    return results;
  }

  /**
   * Stores a document with its embedding
   */
  async storeDocument(document: {
    id?: string;
    content: string;
    metadata?: Record<string, unknown>;
    embedding: number[];
  }): Promise<void> {
    const { error } = await this.supabase.from('documents').insert({
      id: document.id,
      content: document.content,
      metadata: document.metadata ?? {},
      embedding: document.embedding,
    });

    if (error) {
      throw new ApiError(`Document storage failed: ${error.message}`, 500);
    }
  }

  /**
   * Retrieves a document by ID
   */
  async getDocumentById(id: string): Promise<SupabaseDocument | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Document retrieval failed: ${error.message}`);
    }

    return data;
  }
}
