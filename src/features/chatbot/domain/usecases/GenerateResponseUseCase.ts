/**
 * GenerateResponseUseCase
 * 
 * Business logic for generating AI responses with RAG.
 * Now delegates RAG logic to gemini-chat Edge Function.
 * 
 * Follows Single Responsibility Principle (SOLID).
 */

import { IChatRepository } from '../repositories/IChatRepository';
import { IEmbeddingRepository } from '../repositories/IEmbeddingRepository';
import { IDocumentRepository } from '../repositories/IDocumentRepository';

export interface GenerateResponseInput {
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  temperature?: number;
}

export interface GenerateResponseOutput {
  response: string;
  contextUsed: string[];
  documentsFound: number;
}

export class GenerateResponseUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly embeddingRepository: IEmbeddingRepository,
    private readonly documentRepository: IDocumentRepository
  ) {}

  async execute(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
    const {
      userQuery,
      conversationHistory = [],
      temperature = 0.7,
    } = input;

    // Generate response via Edge Function (RAG handled server-side)
    // gemini-chat Edge Function handles:
    // 1. Embedding generation
    // 2. Vector search
    // 3. Context building
    // 4. Response generation
    const response = await this.chatRepository.generateResponse({
      userQuery,
      conversationHistory,
      temperature,
      maxTokens: 1024,
    });

    return {
      response,
      contextUsed: [], // Not returned by Edge Function (could be added)
      documentsFound: 0, // Not returned by Edge Function (could be added)
    };
  }
}
