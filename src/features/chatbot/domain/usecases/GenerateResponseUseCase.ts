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
  abTestGroup?: string;
  includeContext?: boolean;
  maxContextDocuments?: number;
  threshold?: number;
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
      abTestGroup,
      includeContext = true,
      maxContextDocuments = 3,
      threshold = 0.3,
    } = input;

    let contextUsed: string[] = [];
    let documentsFound = 0;
    let context = '';

    // Detect if embedding provider is GeminiDataSource (remote RAG)
    const isGemini =
      (this.embeddingRepository as { geminiDataSource?: unknown }).geminiDataSource !== undefined;

    if (isGemini) {
      // Delegate all RAG to backend (Edge Function)
      const response = await this.chatRepository.generateResponse({
        userQuery,
        conversationHistory,
        temperature,
        maxTokens: 1024,
        abTestGroup,
        // context is ignored, backend handles RAG
      });
      return {
        response,
        contextUsed: [],
        documentsFound: 0,
      };
    }

    // Local RAG (embedding + document search)
    if (includeContext) {
      const queryEmbedding = await this.embeddingRepository.generateEmbedding(userQuery);
      const relevantDocs = await this.documentRepository.searchSimilarDocuments({
        queryEmbedding,
        limit: maxContextDocuments,
        threshold,
      });
      contextUsed = relevantDocs.map(doc => doc.content);
      documentsFound = relevantDocs.length;
      context = contextUsed.join('\n\n');
    }

    const response = await this.chatRepository.generateResponse({
      userQuery,
      conversationHistory,
      temperature,
      maxTokens: 1024,
      abTestGroup,
      context,
    });

    return {
      response,
      contextUsed,
      documentsFound,
    };
  }
}
