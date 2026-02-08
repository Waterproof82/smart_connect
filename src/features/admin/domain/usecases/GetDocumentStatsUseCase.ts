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
}

export class GetDocumentStatsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(): Promise<DocumentStats> {
    const [totalDocuments, bySource] = await Promise.all([
      this.documentRepository.count(),
      this.documentRepository.countBySource(),
    ]);

    return {
      totalDocuments,
      bySource,
    };
  }
}
