/**
 * Document Repository Interface
 * 
 * Clean Architecture: Domain Layer
 * 
 * Define el contrato para acceder a documentos RAG.
 * La implementación concreta estará en la capa Data.
 */

import { Document } from '../entities/Document';

export interface DocumentFilters {
  source?: string;
  category?: string;
  searchText?: string;
  hasEmbedding?: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IDocumentRepository {
  /**
   * Obtiene todos los documentos con filtros y paginación
   */
  getAll(
    filters?: DocumentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Document>>;

  /**
   * Obtiene un documento por ID
   */
  getById(id: string): Promise<Document | null>;

  /**
   * Cuenta el total de documentos (únicos)
   */
  count(): Promise<number>;

  /**
   * Cuenta los documentos por fuente
   */
  countBySource(): Promise<Record<string, number>>;

  /**
   * Cuenta los documentos por categoría
   */
  countByCategory(): Promise<Record<string, number>>;

  /**
   * Elimina un documento por ID
   */
  delete(id: string): Promise<void>;

  /**
   * Actualiza el contenido y source de un documento
   */
  update(id: string, content: string, source?: string): Promise<Document>;

  /**
   * Crea un nuevo documento
   */
  create(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document>;

  /**
   * Genera un embedding vectorial para el contenido dado
   * @param content - Texto a vectorizar
   * @returns Array de 768 números (Gemini text-embedding-004)
   * @throws Error si la API de Gemini falla
   */
  generateEmbedding(content: string): Promise<number[]>;
}
