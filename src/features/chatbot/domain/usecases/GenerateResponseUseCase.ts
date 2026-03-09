/**
 * GenerateResponse Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para generar respuestas del chatbot.
 * Orquesta la búsqueda de documentos relevantes y la generación de respuesta.
 * 
 * @requires IChatRepository - Repository para interacturar con el modelo de chat
 */

import { IChatRepository } from '../repositories/IChatRepository';

/**
 * Parámetros de ejecución para GenerateResponseUseCase
 */
export interface GenerateResponseParams {
  /** Consulta del usuario */
  userQuery: string;
  /** Historial de conversación previo */
  conversationHistory?: Array<{ role: string; content: string }>;
  /** Si debe usar RAG (búsqueda de documentos) - por defecto true */
  useRAG?: boolean;
  /** Opciones específicas de RAG */
  ragOptions?: {
    /** Número de documentos a recuperar */
    topK?: number;
    /** Threshold de similitud (0-1) */
    threshold?: number;
    /** Filtrar por fuente específica */
    source?: string;
  };
}

/**
 * Caso de uso para generar respuestas del chatbot
 */
export class GenerateResponseUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(params: GenerateResponseParams): Promise<string> {
    return this.chatRepository.generateResponse({
      userQuery: params.userQuery,
      conversationHistory: params.conversationHistory,
      useRAG: params.useRAG ?? true,
      ragOptions: params.ragOptions,
    });
  }
}
