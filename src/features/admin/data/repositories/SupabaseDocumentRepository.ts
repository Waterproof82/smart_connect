/**
 * Supabase Document Repository
 * 
 * Clean Architecture: Data Layer
 * 
 * Implementación del repositorio de documentos usando Supabase.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  IDocumentRepository, 
  DocumentFilters, 
  PaginationOptions,
  PaginatedResult 
} from '../../domain/repositories/IDocumentRepository';
import { Document } from '../../domain/entities/Document';

export class SupabaseDocumentRepository implements IDocumentRepository {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

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

    if (filters?.category) {
      query = query.eq('category', filters.category);
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
      // Validar embedding (debe ser array de 768 dimensiones o null)
      const embedding = row.embedding as number[] | null;
      const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
        ? embedding 
        : undefined;

      return Document.create({
        id: row.id as string,
        content: row.content as string,
        source: row.source as string,
        category: row.category as string,
        embedding: validEmbedding,
        createdAt: new Date(row.created_at as string),
        updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
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

    // Validar embedding
    const embedding = data.embedding as number[] | null;
    const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
      ? embedding 
      : undefined;

    return Document.create({
      id: data.id,
      content: data.content,
      source: data.source,
      category: data.category,
      embedding: validEmbedding,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      metadata: data.metadata || {},
    });
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
      const source = (row.source as string) || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    });

    return counts;
  }

  async countByCategory(): Promise<Record<string, number>> {
    const { data, error } = await this.client
      .from('documents')
      .select('category');

    if (error) {
      throw new Error(`Failed to count by category: ${error.message}`);
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row: Record<string, unknown>) => {
      const category = (row.category as string) || 'general';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async update(id: string, content: string): Promise<Document> {
    const { data, error } = await this.client
      .from('documents')
      .update({ 
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    // Validar embedding
    const embedding = data.embedding as number[] | null;
    const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
      ? embedding 
      : undefined;

    return Document.create({
      id: data.id,
      content: data.content,
      source: data.source,
      category: data.category,
      embedding: validEmbedding,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      metadata: data.metadata || {},
    });
  }

  async create(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const { data, error } = await this.client
      .from('documents')
      .insert({
        content: document.content,
        source: document.source,
        category: document.category,
        embedding: document.embedding,
        metadata: document.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    // Validar embedding
    const embedding = data.embedding as number[] | null;
    const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
      ? embedding 
      : undefined;

    return Document.create({
      id: data.id,
      content: data.content,
      source: data.source,
      category: data.category,
      embedding: validEmbedding,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      metadata: data.metadata || {},
    });
  }
}
