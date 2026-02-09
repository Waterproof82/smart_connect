/**
 * ChatRepositoryImpl - Optimized for Server-Side RAG
 * 
 * Clean Architecture: Data Layer
 * 
 * Responsabilidad:
 * - Llamar a la Edge Function 'chat-with-rag' que maneja todo el flujo RAG
 * - Fallback a Gemini directo si RAG falla
 * - Logging de métricas de performance
 * 
 * Benefits:
 * - Single API call (vs multiple roundtrips)
 * - Lower latency (~1s vs ~2-4s)
 * - Better caching (server-side)
 * - Simplified frontend logic
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
    // Todo el flujo RAG (embedding, search, prompt, generation) en servidor
    // ========================================================================
    try {
      const startTime = Date.now();

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

      const totalTime = Date.now() - startTime;

      if (error) {
        console.error('[ChatRepository] RAG function error:', error);
        throw new Error(`RAG failed: ${error.message}`);
      }

      // Log performance metrics
      console.log('[ChatRepository] RAG Performance:', {
        documentsFound: data.metadata?.documentsFound ?? 0,
        cacheHit: data.metadata?.cacheHit ?? false,
        timings: data.metadata?.timings,
        totalTimeMs: totalTime,
      });

      // Optional: Handle sources for citation UI
      if (data.metadata?.sources && data.metadata.sources.length > 0) {
        this._handleSources(data.metadata.sources);
      }

      return data.response;

    } catch (error) {
      console.error('[ChatRepository] RAG error:', error);
      
      // Fallback: Gemini directo si RAG falla
      console.warn('[ChatRepository] Falling back to non-RAG response');
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
    try {
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
        .map((part: any) => part.text)
        .join('');

    } catch (error) {
      console.error('[ChatRepository] Gemini direct call error:', error);
      throw error;
    }
  }

  /**
   * Handle sources for citation UI (optional)
   * 
   * @private
   */
  private _handleSources(sources: Array<{ source: string; similarity: number }>) {
    console.log('[ChatRepository] Sources used:', sources);
    
    // Optional: Emit event for UI to show sources/citations
    // Example:
    // window.dispatchEvent(new CustomEvent('rag-sources', { detail: sources }));
    
    // Or store in global state (Redux, Zustand, etc.)
  }
}