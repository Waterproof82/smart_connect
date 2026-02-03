/**
 * RAG Indexer para documentos QRIBAR y Reviews
 * 
 * Clean Architecture: Data Layer
 * 
 * Responsabilidad:
 * - Indexar documentos con chunking estratégico
 * - Generar embeddings usando Gemini text-embedding-004
 * - Asignar metadata (source, category, timestamp)
 * 
 * Fase 1 de optimización según ADR-006
 * docs/adr/006-rag-architecture-decision.md
 */

import { GoogleGenAI } from '@google/genai';

export interface ChunkMetadata {
  source: string;
  timestamp: number;
  category: string;
  chunkIndex: number;
}

export interface DocumentChunk {
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
}

export interface IndexDocumentsParams {
  source: string;
  documents: string[];
}

export class RAGIndexer {
  private readonly genAI: GoogleGenAI;
  private readonly embeddingModel;
  
  /**
   * Constructor
   * 
   * @param geminiApiKey API key de Google AI Studio (Gemini)
   * @throws Error si geminiApiKey está vacío
   */
  constructor(geminiApiKey: string) {
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      throw new Error('Gemini API key cannot be empty');
    }
    
    this.genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
  }

  /**
   * Indexa lista de documentos con chunking y embeddings
   * 
   * @param params Parámetros de indexación (source, documents)
   * @returns Lista de chunks con embeddings y metadata
   * @throws Error si falla la generación de embeddings
   */
  async indexDocuments(params: IndexDocumentsParams): Promise<DocumentChunk[]> {
    const { source, documents } = params;
    
    if (documents.length === 0) {
      return [];
    }

    const allChunks: DocumentChunk[] = [];
    
    for (const doc of documents) {
      const docChunks = await this._chunkDocument(
        doc,
        source,
        allChunks.length
      );
      allChunks.push(...docChunks);
    }
    
    return allChunks;
  }

  /**
   * Divide documento en chunks con overlap
   * 
   * Regla: Overlap de 50 tokens entre chunks consecutivos
   * Chunk size: ~500 tokens (aproximadamente 375 palabras)
   */
  private async _chunkDocument(
    content: string,
    source: string,
    startIndex: number
  ): Promise<DocumentChunk[]> {
    const CHUNK_SIZE = 500; // tokens aproximados
    const OVERLAP = 50;
    
    const words = content.split(' ');
    const chunks: DocumentChunk[] = [];
    
    // Calcular step (avance por chunk considerando overlap)
    const step = CHUNK_SIZE - OVERLAP;
    
    for (let i = 0; i < words.length; i += step) {
      const end = Math.min(i + CHUNK_SIZE, words.length);
      const chunkText = words.slice(i, end).join(' ');
      
      // Generar embedding con Gemini
      try {
        const embedding = await this._generateEmbedding(chunkText);
        
        chunks.push({
          content: chunkText,
          embedding,
          metadata: {
            source,
            timestamp: Date.now(),
            category: this._inferCategory(source),
            chunkIndex: startIndex + chunks.length,
          },
        });
      } catch (error) {
        throw new Error(`Failed to generate embedding for chunk: ${error}`);
      }
      
      // Si alcanzamos el final, no continuar
      if (end >= words.length) break;
    }
    
    return chunks;
  }

  /**
   * Genera embedding usando Gemini text-embedding-004
   * 
   * @param text Texto a convertir en embedding
   * @returns Vector de 768 dimensiones
   * @throws Error si falla la API de Gemini
   */
  private async _generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      throw new Error(`Gemini API error: ${error}`);
    }
  }

  /**
   * Infiere categoría según source
   * 
   * Mapeo:
   * - qribar -> producto_digital
   * - reviews -> reputacion_online
   * - default -> general
   */
  private _inferCategory(source: string): string {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes('qribar')) {
      return 'producto_digital';
    }
    
    if (lowerSource.includes('review')) {
      return 'reputacion_online';
    }
    
    return 'general';
  }
}
