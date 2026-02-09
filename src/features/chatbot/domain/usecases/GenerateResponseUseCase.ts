// domain/usecases/GenerateResponseUseCase.ts

import { IChatRepository } from "../repositories";

export class GenerateResponseUseCase {
  constructor(
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(params: {
    userQuery: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    useRAG?: boolean;
    ragOptions?: {
      topK?: number;
      threshold?: number;
      source?: string;
    };
  }): Promise<string> {
    const { userQuery, conversationHistory, useRAG = true, ragOptions } = params;

    // ✅ Toda la lógica RAG ahora está en el backend
    // El useCase solo pasa los parámetros al repository
    return this.chatRepository.generateResponse({
      userQuery,
      conversationHistory,
      useRAG,
      ragOptions,
    });
  }
}