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

import { IChatRepository, GenerateResponseParams } from '../repositories/IChatRepository';

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
