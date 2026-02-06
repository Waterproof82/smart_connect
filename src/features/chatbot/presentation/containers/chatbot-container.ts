// src/chatbot/presentation/containers/chatbot-container.ts

export interface RAGResult {
  response: string;
  documents: any[];
  metadata: {
    classification: number;
    filtering: number;
    embedding: number;
    semantic: number;
    reranking: number;
    generation: number;
    total: number;
    documents_filtered: number;
    documents_semantic: number;
    documents_reranked: number;
  };
}

export class ChatbotContainer {
  async generateResponse(userQuery: string): Promise<RAGResult> {
    try {
      console.log('🤖 Calling RAG Orchestrator...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // ✅ UNA SOLA LLAMADA
      const response = await fetch(
        `${supabaseUrl}/functions/v1/gemini-rag-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ userQuery }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      return data.data;
    } catch (error) {
      console.error('ChatbotContainer error:', error);
      throw error;
    }
  }
}

let instance: ChatbotContainer | null = null;

export function getChatbotContainer(): ChatbotContainer {
  if (!instance) {
    instance = new ChatbotContainer();
  }
  return instance;
}