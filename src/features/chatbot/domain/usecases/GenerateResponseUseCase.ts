/**
 * GenerateResponseUseCase
 * 
 * Business logic for generating AI responses with RAG.
 * Now uses RAGOrchestrator for unified Phase 1+2+3 integration.
 * 
 * Follows Single Responsibility Principle (SOLID).
 */

import { IChatRepository } from '../repositories/IChatRepository';
import { RAGOrchestrator } from '../rag-orchestrator';


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
    private readonly ragOrchestrator: RAGOrchestrator
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

    // Use RAG Orchestrator (Phase 1+2+3 integration)
    if (includeContext) {
      const searchResult = await this.ragOrchestrator.search(userQuery, {
        topK: maxContextDocuments,
        similarityThreshold: threshold,
      });
      
      contextUsed = searchResult.chunks.map(chunk => chunk.text);
      documentsFound = searchResult.totalFound;
      
      // Get enriched context with relevance scores
      context = await this.ragOrchestrator.getContext(userQuery, {
        topK: maxContextDocuments,
        similarityThreshold: threshold,
      });
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
