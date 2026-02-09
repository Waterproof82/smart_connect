/**
 * EmbeddingRepositoryImpl
 * 
 * Implementation of IEmbeddingRepository using GeminiDataSource.
 */

import { IEmbeddingRepository } from '../../domain/repositories/IEmbeddingRepository';
import { GeminiDataSource } from '../datasources/GeminiDataSource';

export class EmbeddingRepositoryImpl implements IEmbeddingRepository {
  private readonly EMBEDDING_DIMENSIONS = 768;

  constructor(private readonly geminiDataSource: GeminiDataSource) {}

  async generateEmbedding(_text: string): Promise<number[]> {
    // No se usa en frontend
    throw new Error('Embedding generation is not available in the frontend.');
  }

  async getEmbeddingByText(text: string): Promise<number[] | null> {
    // Buscar el embedding en Supabase por el texto
    // Asume que hay una tabla 'documents' con columna 'content' y 'embedding'
    const { data, error } = await this.geminiDataSource.supabase
      .from('documents')
      .select('embedding')
      .eq('content', text)
      .limit(1)
      .single();
    if (error || !data || !data.embedding) return null;
    return data.embedding as number[];
  }

  getDimensions(): number {
    return this.EMBEDDING_DIMENSIONS;
  }
}
