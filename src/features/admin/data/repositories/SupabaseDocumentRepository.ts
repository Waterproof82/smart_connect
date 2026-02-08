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

// Type alias for embedding data (can be array or JSON string from Supabase)
type EmbeddingData = number[] | string | null;

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
      let embedding: EmbeddingData = row.embedding as EmbeddingData;
      
      // Si el embedding es un string, parsearlo
      if (typeof embedding === 'string') {
        try {
          embedding = JSON.parse(embedding) as number[];
        } catch (e) {
          const docId = typeof row.id === 'string' || typeof row.id === 'number' ? row.id : 'unknown';
          console.error(`Failed to parse embedding for document ${docId}:`, e);
          embedding = null;
        }
      }
      
      const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
        ? embedding 
        : undefined;

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

    // Validar embedding
    let embedding: EmbeddingData = data.embedding as EmbeddingData;
    
    // Si el embedding es un string, parsearlo
    if (typeof embedding === 'string') {
      try {
        embedding = JSON.parse(embedding) as number[];
      } catch (e) {
        console.error(`Failed to parse embedding for document ${id}:`, e);
        embedding = null;
      }
    }
    
    const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
      ? embedding 
      : undefined;

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

async update(id: string, content: string, source?: string): Promise<Document> {
  const { data: { session } } = await this.client.auth.getSession();
  const token = session?.access_token;

  // 1. Generar embedding (Seguro con Anon Key + JWT)
  const { data: embeddingData } = await this.client.functions.invoke(
    'gemini-embedding',
    {
      body: { text: content },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  );

  // 2. Preparar payload (Usamos created_at para marcar la edición)
  interface UpdateData {
    content: string;
    embedding: number[] | null;
    created_at: string;
    source?: string;
  }
  const updateData: UpdateData = {
    content,
    embedding: embeddingData?.embedding ?? null,
    created_at: new Date().toISOString()
  };
  if (source !== undefined) {
    updateData.source = source;
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
  let embedding: number[] | undefined;
  if (typeof row.embedding === 'string') {
    try {
      embedding = JSON.parse(row.embedding);
    } catch {
      embedding = undefined;
    }
  } else if (Array.isArray(row.embedding)) {
    embedding = row.embedding as number[];
  }

  // Validar dimensiones del embedding
  const validEmbedding = embedding?.length === 768 ? embedding : undefined;

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
  
  // Forzamos la obtención de las llaves del entorno
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-embedding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey, // ESTO abre la puerta del Gateway
      'Authorization': `Bearer ${session?.access_token}` // ESTO valida tu rol admin
    },
    body: JSON.stringify({ text: content })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error en la autenticación de la función');
  }

  const data = await response.json();
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

    // Validar embedding
    const embedding = data.embedding as number[] | null;
    const validEmbedding = embedding && Array.isArray(embedding) && embedding.length === 768 
      ? embedding 
      : undefined;

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
