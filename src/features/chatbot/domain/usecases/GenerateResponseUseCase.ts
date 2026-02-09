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
import { ragLogger, LogLevel } from '../../shared/rag-logger';


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

    ragLogger.startOperation();
    ragLogger.log(LogLevel.DEBUG, 'GENERATE_RESPONSE_USECASE', 'GENERATION', 'Starting response generation', {
      input: {
        userQueryLength: userQuery.length,
        userQueryPreview: userQuery.substring(0, 100) + (userQuery.length > 100 ? '...' : ''),
        hasConversationHistory: conversationHistory.length > 0,
        temperature,
        abTestGroup,
        includeContext,
        maxContextDocuments,
        threshold
      }
    });

    let contextUsed: string[] = [];
    let documentsFound = 0;
    let context = '';

    // Use RAG Orchestrator (Phase 1+2+3 integration)
    if (includeContext) {
      ragLogger.logPhaseTransition('CONTEXT_RETRIEVAL', 'RAG_SEARCH', {
        userQuery: userQuery.substring(0, 100),
        maxContextDocuments,
        threshold
      });

      const searchResult = await this.ragOrchestrator.search(userQuery, {
        topK: maxContextDocuments,
        similarityThreshold: threshold,
      });
      
      contextUsed = searchResult.chunks.map(chunk => chunk.text);
      documentsFound = searchResult.totalFound;
      
      ragLogger.log(LogLevel.INFO, 'GENERATE_RESPONSE_USECASE', 'GENERATION', 'RAG search completed', {
        documentsFound,
        contextUsed: contextUsed.length,
        cacheHit: searchResult.cacheHit,
        usedFallback: searchResult.usedFallback,
        fallbackCategory: searchResult.fallbackResponse?.category,
        avgRelevance: searchResult.relevanceScores.length > 0 
          ? searchResult.relevanceScores.reduce((a, b) => a + b, 0) / searchResult.relevanceScores.length 
          : 0
      });
      
      // Get enriched context with relevance scores
      context = await this.ragOrchestrator.getContext(userQuery, {
        topK: maxContextDocuments,
        similarityThreshold: threshold,
      });

      ragLogger.log(LogLevel.DEBUG, 'GENERATE_RESPONSE_USECASE', 'GENERATION', 'Context generated for AI', {
        contextLength: context.length,
        contextPreview: context.substring(0, 200) + (context.length > 200 ? '...' : '')
      });
    }

    ragLogger.logPhaseTransition('CONTEXT_RETRIEVAL', 'AI_GENERATION', {
      hasContext: !!context,
      contextLength: context.length,
      finalPrompt: userQuery.substring(0, 100)
    });

    const response = await this.chatRepository.generateResponse({
      userQuery,
      conversationHistory,
      temperature,
      maxTokens: 1024,
      abTestGroup,
      context,
    });

    ragLogger.logResponseGeneration(userQuery, contextUsed, documentsFound, response);

    const result = {
      response,
      contextUsed,
      documentsFound,
    };

    ragLogger.log(LogLevel.INFO, 'GENERATE_RESPONSE_USECASE', 'GENERATION', 'Response generation completed', {
      finalResult: {
        responseLength: response.length,
        contextDocumentsUsed: contextUsed.length,
        documentsFound,
        responsePreview: response.substring(0, 150) + (response.length > 150 ? '...' : '')
      },
      totalDuration: ragLogger.getPerformanceStats().GENERATION.avgDuration
    });

    return result;
  }
}
