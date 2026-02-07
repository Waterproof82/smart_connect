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

// ✅ UNA SOLA LLAMADA (ARREGLADA PARA LOCAL)
      const response = await fetch(
        'http://localhost:54321/functions/v1/rag-v2', // <--- URL FIJA LOCAL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // PEGA TU CLAVE LOCAL 'ANON' AQUÍ DEBAJO (la que empieza por eyJ...) 👇
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDE5NjIsImV4cCI6MjA4NTExNzk2Mn0.wwEaxcanylAFKY1x6NNNlewEcQPby0zdo9Q93qqe3dM', 
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