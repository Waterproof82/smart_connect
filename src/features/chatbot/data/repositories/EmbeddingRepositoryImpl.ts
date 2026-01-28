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

  async generateEmbedding(text: string): Promise<number[]> {
    return this.geminiDataSource.generateEmbedding(text);
  }

  getDimensions(): number {
    return this.EMBEDDING_DIMENSIONS;
  }
}
