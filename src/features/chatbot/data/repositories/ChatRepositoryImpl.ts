/**
 * ChatRepositoryImpl - Clean Architecture: Data Layer
 * Fallback a Gemini directo si RAG falla
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  IChatRepository,
  GenerateResponseParams,
} from '../../domain/repositories/IChatRepository';

export class ChatRepositoryImpl implements IChatRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateResponse(params: GenerateResponseParams): Promise<string> {
    const {
      userQuery,
      conversationHistory = [],
      useRAG = true,
      ragOptions = {},
      temperature = 0.7,
      maxTokens = 2048,
    } = params;

    // Si RAG está desactivado, usar Gemini directo
    if (!useRAG) {
      return this._generateWithoutRAG(userQuery, conversationHistory, temperature, maxTokens);
    }

    // ========================================================================
    // LLAMADA A EDGE FUNCTION: chat-with-rag
    // ========================================================================
    try {

      const { data, error } = await this.supabase.functions.invoke('chat-with-rag', {
        body: {
          query: userQuery,
          conversationHistory: conversationHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          topK: ragOptions.topK ?? 5,
          threshold: ragOptions.threshold ?? 0.7,
          source: ragOptions.source ?? null,
        },
      });


      if (error) {
        console.error('[ChatRepository] RAG function error:', error);
        throw new Error(`RAG failed: ${error.message}`);
      }

      // (Opcional) Aquí puedes loguear métricas si lo necesitas

      // (Opcional) Manejo de fuentes para UI de citas
      if (data.metadata?.sources && data.metadata.sources.length > 0) {
        this._handleSources(data.metadata.sources);
      }

      return data.response;

    } catch (error) {
      console.error('[ChatRepository] RAG error:', error);
      // Fallback: Gemini directo si RAG falla
      return this._generateWithoutRAG(userQuery, conversationHistory, temperature, maxTokens);
    }
  }

  /**
   * Fallback: Generación directa con Gemini (sin RAG)
   * 
   * @private
   */
  private async _generateWithoutRAG(
    query: string,
    history: Array<{ role: string; content: string }>,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const { data, error } = await this.supabase.functions.invoke('gemini-generate', {
      body: {
        contents: [
          ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          {
            role: 'user',
            parts: [{ text: query }]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topK: 40,
          topP: 0.95,
        },
      },
    });

    if (error) {
      throw new Error(`Gemini generation failed: ${error.message}`);
    }

    if (!data.candidates?.[0]?.content?.parts) {
      throw new Error('Invalid response from Gemini');
    }

    return data.candidates[0].content.parts
      .map((part: { text: string }) => part.text)
      .join('');
  }

  /**
   * Handle sources for citation UI (optional)
   * 
   * @private
   */
  private _handleSources(_sources: Array<{ source: string; similarity: number }>) {
    // (Opcional) Implementa manejo de fuentes si tu UI lo requiere
  }
}