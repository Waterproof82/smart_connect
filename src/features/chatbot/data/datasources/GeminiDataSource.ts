/**
 * GeminiDataSource
 * 
 * Handles communication with Gemini API via Supabase Edge Functions.
 * Uses gemini-chat Edge Function with RAG capabilities.
 * 
 * Security: API key protected server-side (OWASP A02:2021)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '@core/domain/entities';
import { ragLogger, LogLevel } from '../../shared/rag-logger';

export interface GeminiChatResponse {
  response: string;
  sources?: string[];
  documentsUsed?: number;
  rateLimitRemaining?: number;
}

export class GeminiDataSource {
  public readonly supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Generates embedding via gemini-chat Edge Function
   * Note: gemini-chat handles embeddings internally for RAG
   * This method is kept for interface compatibility
   */
  async generateEmbedding(text: string): Promise<number[]> {
    ragLogger.logEmbeddingOperation(text, 'generate');
    
    // For now, return empty array as gemini-chat handles embeddings internally
    // This could be updated to call a dedicated embedding endpoint if needed
    return [];
  }

  /**
   * Generates text response via gemini-chat Edge Function with RAG
   * 
   * @param params.prompt - User query
   * @param params.conversationHistory - Previous messages (optional)
   * @returns AI response text
   */
  async generateResponse(params: {
    prompt: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    ragLogger.log(LogLevel.DEBUG, 'GEMINI_DATASOURCE', 'GENERATION', 'Initiating AI response generation', {
      promptLength: params.prompt.length,
      hasConversationHistory: !!params.conversationHistory?.length,
      temperature: params.temperature,
      maxTokens: params.maxTokens
    });

    const { data, error } = await this.supabase.functions.invoke(
      'gemini-chat',
      {
        body: {
          userQuery: params.prompt,
          conversationHistory: params.conversationHistory || [],
          maxDocuments: 3,
          similarityThreshold: 0.3
        },
      }
    );

    if (error) {
      ragLogger.log(LogLevel.ERROR, 'GEMINI_DATASOURCE', 'GENERATION', 'Edge Function call failed', {
        error: error.message,
        prompt: params.prompt.substring(0, 100)
      });
      throw new ApiError(`Response generation failed: ${error.message}`, 500);
    }

    if (data?.error) {
      ragLogger.log(LogLevel.ERROR, 'GEMINI_DATASOURCE', 'GENERATION', 'Gemini API error', {
        error: data.error,
        prompt: params.prompt.substring(0, 100)
      });
      throw new ApiError(
        `AI service error: ${data.error}`,
        503
      );
    }

    const responseText = data?.response;

    if (!responseText) {
      ragLogger.log(LogLevel.ERROR, 'GEMINI_DATASOURCE', 'GENERATION', 'Invalid response format', {
        data,
        prompt: params.prompt.substring(0, 100)
      });
      throw new ApiError('Invalid response format from AI service', 500);
    }

    // Log RAG statistics
    ragLogger.logDocumentSearch('Gemini response received', {
      documentsUsed: data.documentsUsed,
      sources: data.sources,
      responseLength: responseText.length,
      rateLimitRemaining: data.rateLimitRemaining
    }, []);

    return responseText;
  }
}
