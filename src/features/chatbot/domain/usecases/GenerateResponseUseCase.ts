import { IChatRepository } from '../repositories/IChatRepository';

  export class GenerateResponseUseCase {
    constructor(private readonly chatRepository: IChatRepository) {}

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
      return this.chatRepository.generateResponse({
        userQuery: params.userQuery,
        conversationHistory: params.conversationHistory,
        useRAG: params.useRAG ?? true,
        ragOptions: params.ragOptions,
      });
    }
  }