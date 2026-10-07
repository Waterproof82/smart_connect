/**
 * ChatRepositoryImpl - Clean Architecture: Data Layer
 *
 * Calls the `chat-with-rag` Edge Function. NO ungrounded fallback: the
 * grounded-failure UX (design D7) requires that a `chat-with-rag` failure
 * (e.g. the 503 `generation_unavailable` response once both primary and
 * backup generation models fail — see `_shared/generate.ts`) propagate to
 * the caller as a thrown error, not be silently retried against an
 * ungrounded model. `gemini-generate` is never invoked from this repository.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  IChatRepository,
  GenerateResponseParams,
} from '../../domain/repositories/IChatRepository';

export class ChatRepositoryImpl implements IChatRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateResponse(params: GenerateResponseParams): Promise<string> {
    const { userQuery, conversationHistory = [], ragOptions = {} } = params;

    const { data, error } = await this.supabase.functions.invoke('chat-with-rag', {
      body: {
        query: userQuery,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        topK: ragOptions.topK ?? 5,
        threshold: ragOptions.threshold ?? 0.4,
        source: ragOptions.source ?? null,
      },
    });

    if (error) {
      console.error('[ChatRepository] RAG function error:', error);
      throw new Error(`RAG failed: ${error.message}`);
    }

    // (Opcional) Manejo de fuentes para UI de citas
    if (data.metadata?.sources && data.metadata.sources.length > 0) {
      this._handleSources(data.metadata.sources);
    }

    return data.response;
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
