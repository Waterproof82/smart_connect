/**
 * GeminiDataSource
 * 
 * Handles communication with Gemini API via Supabase Edge Functions.
 * Abstracts the HTTP layer and provides clean interfaces.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GeminiEmbeddingResponse {
  embedding: {
    values: number[];
  };
}

export interface GeminiGenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiDataSource {
  private readonly supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Generates embedding via Supabase Edge Function
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const { data, error } = await this.supabase.functions.invoke(
      'gemini-embedding',
      {
        body: { text },
      }
    );

    if (error) {
      throw new Error(`Embedding generation failed: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    if (!data?.embedding?.values) {
      throw new Error('Invalid embedding response format');
    }

    return data.embedding.values;
  }

  /**
   * Generates text response via Supabase Edge Function
   */
  async generateResponse(params: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const { data, error } = await this.supabase.functions.invoke(
      'gemini-generate',
      {
        body: {
          contents: [
            {
              role: 'user',
              parts: [{ text: params.prompt }],
            },
          ],
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            maxOutputTokens: params.maxTokens ?? 500,
          },
        },
      }
    );

    if (error) {
      throw new Error(`Response generation failed: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Invalid response format from Gemini API');
    }

    return responseText;
  }
}
