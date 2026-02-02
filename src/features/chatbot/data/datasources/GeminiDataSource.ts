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

export interface GeminiChatResponse {
  response: string;
  sources?: string[];
  documentsUsed?: number;
  rateLimitRemaining?: number;
}

export class GeminiDataSource {
  private readonly supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Generates embedding via gemini-chat Edge Function
   * Note: gemini-chat handles embeddings internally for RAG
   * This method is kept for interface compatibility
   */
  async generateEmbedding(_text: string): Promise<number[]> {
    // For now, return empty array as gemini-chat handles embeddings internally
    // This could be updated to call a dedicated embedding endpoint if needed
    console.warn('generateEmbedding called but gemini-chat handles embeddings internally');
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
      console.error('Edge Function error:', error);
      throw new ApiError(`Response generation failed: ${error.message}`, 500);
    }

    if (data?.error) {
      console.error('Gemini API error:', data.error);
      throw new ApiError(
        `AI service error: ${data.error}`,
        503
      );
    }

    const responseText = data?.response;

    if (!responseText) {
      console.error('Invalid response format:', data);
      throw new ApiError('Invalid response format from AI service', 500);
    }

    // Log RAG statistics
    if (data.documentsUsed > 0) {
      console.warn(`✅ RAG: Used ${data.documentsUsed} documents from knowledge base`);
    }

    return responseText;
  }
}
