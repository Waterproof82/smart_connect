export interface RAGOptions {
    topK?: number;
    threshold?: number;
    source?: string | null;
  }

  export interface GenerateResponseParams {
    userQuery: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    useRAG?: boolean;
    ragOptions?: RAGOptions;
  }

  export interface IChatRepository {
    generateResponse(params: GenerateResponseParams): Promise<string>;
  }