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
 * Refs: AGENTS.md Section 3, ADR-006
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseKnowledgeLoaderConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface LoadedDocuments {
  qribar: string[];
  reviews: string[];
  general: string[];
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

    // Initialize result structure
    const result: LoadedDocuments = {
      qribar: [],
      reviews: [],
      general: [],
    };

    // Handle null or empty data
    if (!data || data.length === 0) {
      this._updateStats(result);
      return result;
    }

    // Group documents by source
    const dataArray = data as SupabaseDocument[];
    for (let i = 0; i < dataArray.length; i++) {
      const doc = dataArray[i];
      const sourceType = this._mapSourceToCategory(doc.source);
      const content = doc.content;

      // Debug: Log first 3 documents to see source mapping
      if (i < 3) {
        console.warn(`🔍 DEBUG Doc ${i + 1}: source="${doc.source}" → mapped to "${sourceType}"`);
      }

      if (sourceType === 'qribar') {
        result.qribar.push(content);
      } else if (sourceType === 'reviews') {
        result.reviews.push(content);
      } else {
        result.general.push(content);
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
   * Map database source values to internal categories
   * Database uses: qribar_product, nfc_reviews_product, automation_product, company_philosophy, contact_info
   * Internal uses: qribar, reviews, general
   */
  private _mapSourceToCategory(source: string | null): 'qribar' | 'reviews' | 'general' {
    if (!source) return 'general';

    // QRIBAR products (carta digital, pedidos en mesa)
    if (source.includes('qribar')) return 'qribar';

    // Reviews/NFC products (tarjetas NFC, reputación online)
    if (source.includes('reviews') || source.includes('nfc')) return 'reviews';

    // Automation, company info, contact → general
    return 'general';
  }

  /**
   * Update internal statistics
   */
  private _updateStats(docs: LoadedDocuments): void {
    this.stats = {
      totalDocuments: docs.qribar.length + docs.reviews.length + docs.general.length,
      bySource: {
        qribar: docs.qribar.length,
        reviews: docs.reviews.length,
        general: docs.general.length,
      },
      lastLoadedAt: new Date(),
    };
  }
}
