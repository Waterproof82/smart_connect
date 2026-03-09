/**
 * Supabase Document Repository
 * 
 * Clean Architecture: Data Layer
 * 
 * Implementación del repositorio de documentos usando Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@shared/supabaseClient';
import { ENV } from '@shared/config/env.config';
import { 
  IDocumentRepository, 
  DocumentFilters, 
  PaginationOptions,
  PaginatedResult 
} from '../../domain/repositories/IDocumentRepository';
import { Document } from '../../domain/entities/Document';

// Type alias for embedding data (can be array or JSON string from Supabase)
type EmbeddingData = number[] | string | null;

/**
 * Parses embedding data from Supabase (may come as JSON string or array).
 * Returns validated 768-dimension array or undefined.
 */
function parseEmbedding(raw: EmbeddingData, docId?: string | number): number[] | undefined {
  let embedding: EmbeddingData = raw;

  if (typeof embedding === 'string') {
    try {
      embedding = JSON.parse(embedding) as number[];
    } catch (e) {
      console.error(`Failed to parse embedding for document ${docId ?? 'unknown'}:`, e);
      return undefined;
    }
  }

  if (embedding && Array.isArray(embedding) && embedding.length === 768) {
    return embedding;
  }
  return undefined;
}

export class SupabaseDocumentRepository implements IDocumentRepository {
  private readonly client: SupabaseClient = supabase;



  async getAll(
    filters?: DocumentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Document>> {
    // Configurar paginación por defecto
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Construir query base
    let query = this.client
      .from('documents')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters?.source) {
      query = query.ilike('source', `%${filters.source}%`);
    }

    if (filters?.searchText) {
      query = query.ilike('content', `%${filters.searchText}%`);
    }

    if (filters?.hasEmbedding !== undefined) {
      if (filters.hasEmbedding) {
        query = query.not('embedding', 'is', null);
      } else {
        query = query.is('embedding', null);
      }
    }

    // Aplicar ordenamiento y paginación
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    // Ejecutar query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    // Mapear a entidades de dominio
    const documents = (data || []).map((row: Record<string, unknown>) => {
      const validEmbedding = parseEmbedding(row.embedding as EmbeddingData, row.id as string);

      return Document.create({
        id: row.id as string,
        content: row.content as string,
        source: row.source as string,
        embedding: validEmbedding,
        createdAt: new Date(row.created_at as string),
        updatedAt: row.created_at ? new Date(row.created_at as string) : undefined,
        metadata: (row.metadata as Record<string, unknown>) || {},
      });
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: documents,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id: string): Promise<Document | null> {
    const { data, error } = await this.client
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    const validEmbedding = parseEmbedding(data.embedding as EmbeddingData, id);

    return Document.create({
      id: data.id,
      content: data.content,
      source: data.source,
      embedding: validEmbedding,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.created_at),
      metadata: data.metadata || {},
    });
  }

  async count(): Promise<number> {
    const { count, error } = await this.client
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count documents: ${error.message}`);
    }

    return count || 0;
  }

  async countBySource(): Promise<Record<string, number>> {
    const { data, error } = await this.client
      .from('documents')
      .select('source');

    if (error) {
      throw new Error(`Failed to count by source: ${error.message}`);
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row: Record<string, unknown>) => {
      const sourceStr = (row.source as string) || 'unknown';
      // Split by comma to handle multi-source documents
      sourceStr.split(',').forEach(s => {
        const source = s.trim();
        if (source) {
          counts[source] = (counts[source] || 0) + 1;
        }
      });
    });

    return counts;
  }


  // countByCategory removed: use countBySource for all stats

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

// ... (resto de la clase)

async update(id: string, content: string, source?: string, metadata?: Record<string, unknown>): Promise<Document> {
  // 1. Generate embedding using the same auth pattern as generateEmbedding()
  const embedding = await this.generateEmbedding(content);
  const embeddingData = { embedding };

  // 2. Preparar payload (Usamos created_at para marcar la edición)

  interface UpdateData {
    content: string;
    embedding: number[] | null;
    created_at: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }
  const updateData: UpdateData = {
    content,
    embedding: embeddingData?.embedding ?? null,
    created_at: new Date().toISOString()
  };
  if (source !== undefined) {
    updateData.source = source;
  }
  if (metadata !== undefined) {
    updateData.metadata = metadata;
  }

  // 3. Update en Supabase
  const { data, error } = await this.client
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }

  // 4. Retornar usando el nuevo método mapeador
  return this.mapToDomain(data);
}

/**
 * Método privado para convertir la fila de la DB a la Entidad Document
 */
private mapToDomain(row: Record<string, unknown>): Document {
  const validEmbedding = parseEmbedding(row.embedding as EmbeddingData, row.id as string);

  return Document.create({
    id: row.id as string,
    content: row.content as string,
    source: row.source as string,
    embedding: validEmbedding,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.created_at as string), // Usamos created_at como updatedAt
    metadata: (row.metadata as Record<string, unknown>) || {},
  });
}

async generateEmbedding(content: string): Promise<number[]> {
  const { data: { session } } = await this.client.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session - please log in again');
  }

  const supabaseUrl = ENV.SUPABASE_URL;
  const anonKey = ENV.SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-embedding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ text: content })
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMsg = `Embedding failed (${response.status})`;
    try {
      const err = JSON.parse(text);
      errorMsg = err.error || errorMsg;
    } catch { /* non-JSON error body */ }
    throw new Error(errorMsg);
  }

  const data = JSON.parse(text);
  return data.embedding;
}

  async create(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const { data, error } = await this.client
      .from('documents')
      .insert({
        content: document.content,
        source: document.source,
        embedding: document.embedding,
        metadata: document.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    const validEmbedding = parseEmbedding(data.embedding as EmbeddingData, data.id);

    return Document.create({
      id: data.id,
      content: data.content,
      source: data.source,
      embedding: validEmbedding,
      createdAt: new Date(data.created_at),
      updatedAt: data.created_at ? new Date(data.created_at) : undefined,
      metadata: data.metadata || {},
    });
  }
}
