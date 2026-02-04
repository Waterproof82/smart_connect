/**
 * GetDocumentStats Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para obtener estadísticas de documentos.
 */

import { IDocumentRepository } from '../repositories/IDocumentRepository';

export interface DocumentStats {
  totalDocuments: number;
  bySource: Record<string, number>;
  byCategory: Record<string, number>;
}

export class GetDocumentStatsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(): Promise<DocumentStats> {
    const [bySource, byCategory] = await Promise.all([
      this.documentRepository.countBySource(),
      this.documentRepository.countByCategory(),
    ]);

    const totalDocuments = Object.values(bySource).reduce((sum, count) => sum + count, 0);

    return {
      totalDocuments,
      bySource,
      byCategory,
    };
  }
}
