/**
 * SupabaseDataSource
 * 
 * Handles communication with Supabase PostgreSQL + pgvector.
 * Manages document storage and vector similarity search.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '@core/domain/entities';

export interface SupabaseDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
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
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: params.queryEmbedding,
      match_threshold: params.matchThreshold,
      match_count: params.matchCount,
      tenant_id: params.tenantId, // Pass tenant filter to database
    });

    if (error) {
      throw new ApiError(`Document search failed: ${error.message}`, 500);
    }

    // Additional safety check: Filter results by tenant in application layer
    let results = data || [];
    if (params.tenantId) {
      results = results.filter((doc: any) => 
        doc.metadata?.tenant_id === params.tenantId || 
        doc.metadata?.tenant_id === undefined // Allow public documents
      );
    }

    return results;
  }

  /**
   * Stores a document with its embedding
   */
  async storeDocument(document: {
    id?: string;
    content: string;
    metadata?: Record<string, any>;
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
