/**
 * RAG Indexer para documentos QRIBAR y Reviews
 * 
 * Clean Architecture: Data Layer (Implementation)
 * 
 * Responsabilidad:
 * - Indexar documentos con chunking estratégico
 * - Generar embeddings usando Gemini gemini-embedding-001
 * - Asignar metadata (source)
 * 
 * Fase 1 de optimización según ADR-003
 * docs/adr/006-rag-architecture-decision.md
 */

import { GoogleGenAI } from '@google/genai';
import type { 
  IRAGIndexer, 
  DocumentChunk, 
  IndexDocumentsParams
} from '../domain/interfaces/IRAGIndexer';

// Re-export types for backward compatibility
export type { ChunkMetadata, DocumentChunk, IndexDocumentsParams } from '../domain/interfaces/IRAGIndexer';

export class RAGIndexer implements IRAGIndexer {
  private readonly genAI: GoogleGenAI;
  
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
          text: chunkText,
          embedding,
          metadata: {
            source,
            chunkIndex: startIndex + chunks.length,
            totalChunks: 0, // Will be updated after loop
          },
        });
      } catch (error) {
        throw new Error(`Failed to generate embedding for chunk: ${error}`);
      }
      
      // Si alcanzamos el final, no continuar
      if (end >= words.length) break;
    }
    
    // Update totalChunks for all chunks
    const totalChunks = chunks.length;
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = totalChunks;
    });
    
    return chunks;
  }

  /**
   * Generate embedding for a single text (Public API for interface)
   * 
   * @param text Text to generate embedding for
   * @returns Embedding vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this._generateEmbedding(text);
  }

  /**
  * Genera embedding usando Gemini gemini-embedding-001
   * 
   * @param text Texto a convertir en embedding
   * @returns Vector de 768 dimensiones
   * @throws Error si falla la API de Gemini
   */
  private async _generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.genAI.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
      });
      return result.embeddings[0].values;
    } catch (error) {
      throw new Error(`Gemini API error: ${error}`);
    }
  }
}
