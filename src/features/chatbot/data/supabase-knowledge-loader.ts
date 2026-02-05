/**
 * SupabaseKnowledgeLoader
 * 
 * Clean Architecture: Data Layer
 * 
 * Responsabilidad:
 * - Cargar documentos desde Supabase tabla 'documents'
 * - Agrupar por source (qribar, reviews, general)
 * - Proporcionar estadísticas de carga
 * 
 * TDD: Implementación después de tests
 * Refs: AGENTS.md Section 3, ADR-003
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseKnowledgeLoaderConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface LoadedDocuments {
  [source: string]: string[];
}

export interface LoaderStats {
  totalDocuments: number;
  bySource: Record<string, number>;
  lastLoadedAt: Date | null;
}

interface SupabaseDocument {
  id: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export class SupabaseKnowledgeLoader {
  private readonly supabase: SupabaseClient;
  private stats: LoaderStats;

  constructor(config: SupabaseKnowledgeLoaderConfig) {
    // Validation
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    this.stats = {
      totalDocuments: 0,
      bySource: { qribar: 0, reviews: 0, general: 0 },
      lastLoadedAt: null,
    };
  }

  /**
   * Load documents from Supabase 'documents' table
   * 
   * @returns Documents grouped by source
   */
  async loadDocuments(): Promise<LoadedDocuments> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('id, content, source, metadata');

    if (error) {
      throw new Error(`Failed to load documents from Supabase: ${error.message}`);
    }


    // Only initialize result if data exists
    const result: LoadedDocuments = {};

    // Handle null or empty data
    if (!data || data.length === 0) {
      this._updateStats(result);
      return result;
    }

    // Group documents by all sources (dynamic)
    const dataArray = data as SupabaseDocument[];
    for (const doc of dataArray) {
      const sourceStr = doc.source?.toLowerCase() || 'general';
      const content = doc.content;
      const sources = sourceStr.split(',').map(s => s.trim()).filter(Boolean);
      for (const source of sources) {
        if (!result[source]) result[source] = [];
        result[source].push(content);
      }
    }

    this._updateStats(result);
    return result;
  }

  /**
   * Get loading statistics
   */
  getStats(): LoaderStats {
    return { ...this.stats };
  }

  /**
   * Update internal statistics
   */
  private _updateStats(docs: LoadedDocuments): void {
    // Solo incluye sources presentes en docs
    const bySource: Record<string, number> = {};
    let total = 0;
    for (const [source, arr] of Object.entries(docs)) {
      bySource[source] = arr.length;
      total += arr.length;
    }
    this.stats = {
      totalDocuments: total,
      bySource,
      lastLoadedAt: new Date(),
    };
  }
}
