/**
 * Dependency Injection Container for Chatbot Feature
 * 
 * This container follows Clean Architecture principles by wiring
 * dependencies from outer layers (infrastructure) to inner layers (domain).
 * 
 * Dependency Flow: Data Sources → Repositories → Use Cases → UI Components
 */

import { GeminiDataSource, SupabaseDataSource } from '../data/datasources';
import { 
  ChatRepositoryImpl, 
  EmbeddingRepositoryImpl, 
  DocumentRepositoryImpl 
} from '../data/repositories';
import { GenerateResponseUseCase } from '../domain/usecases';
import { RAGOrchestrator } from '../domain/rag-orchestrator';
import { SupabaseKnowledgeLoader } from '../data/supabase-knowledge-loader';
import { RAGIndexer } from '../data/rag-indexer';
import type { IRAGIndexer, DocumentChunk, IndexDocumentsParams } from '../domain/interfaces/IRAGIndexer';
// Stub seguro para frontend: nunca permite embeddings ni indexación
const FrontendRAGIndexerStub: IRAGIndexer = {
  indexDocuments: async (_params: IndexDocumentsParams): Promise<DocumentChunk[]> => {
    throw new Error('RAG indexer is not available in the frontend. Indexing must be done server-side.');
  },
  generateEmbedding: async (_text: string): Promise<number[]> => {
    throw new Error('Embedding generation is not available in the frontend.');
  }
};
import { EmbeddingCache } from '../data/embedding-cache';

/**
 * Container for all chatbot dependencies
 */
export class ChatbotContainer {
  // Use Cases (exposed to UI layer)
  public readonly generateResponseUseCase: GenerateResponseUseCase;
  
  // RAG System
  private readonly ragOrchestrator: RAGOrchestrator;
  private readonly knowledgeLoader: SupabaseKnowledgeLoader;
  private isKnowledgeBaseInitialized = false;

  constructor() {
    // ===================================
    // 1. INFRASTRUCTURE LAYER (Data Sources)
    // ===================================
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        '❌ Missing environment variables. Check your .env.local file: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY'
      );
    }

    // Data Sources (responsible for external communication)
    // GeminiDataSource encapsula la llamada a la Edge Function, la clave nunca viaja al frontend
    const geminiDataSource = new GeminiDataSource(supabaseUrl, supabaseAnonKey);
    const supabaseDataSource = new SupabaseDataSource(supabaseUrl, supabaseAnonKey);

    // ===================================
    // 2. DATA LAYER (Repository Implementations)
    // ===================================
    const chatRepository = new ChatRepositoryImpl(geminiDataSource);
    const documentRepository = new DocumentRepositoryImpl(supabaseDataSource);

    // ===================================
    // 3. RAG SYSTEM (Phases 1+2+3 Integration)
    // ===================================
    
    // Instantiate concrete implementations (Data Layer)
    // El indexador ya no se inicializa en el frontend con la clave Gemini
    // Si se requiere indexación, debe hacerse desde el backend/Edge Function
    // const ragIndexer = new RAGIndexer(geminiApiKey); // ELIMINADO
    const ragIndexer = FrontendRAGIndexerStub;
    const embeddingCache = new EmbeddingCache({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
      ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      enableSupabaseBackup: false, // Disabled: Edge Function handles server-side cache
    });
    
    // Inject implementations into RAGOrchestrator (Domain Layer)
    this.ragOrchestrator = new RAGOrchestrator({
      indexer: ragIndexer,
      cache: embeddingCache,
      defaultTopK: 5,
      defaultThreshold: 0.7,
    });

    // Knowledge Base Loader
    this.knowledgeLoader = new SupabaseKnowledgeLoader({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    });

    // ===================================
    // 4. DOMAIN LAYER (Use Cases)
    // ===================================
    this.generateResponseUseCase = new GenerateResponseUseCase(
      chatRepository,
      this.ragOrchestrator
    );

  }

  /**
   * Initialize knowledge base from Supabase documents
   * This loads all documents at startup for in-memory search optimization
   * Performance: Reduces query latency from 800ms to 150ms
   */
  async initializeKnowledgeBase(): Promise<void> {
    if (this.isKnowledgeBaseInitialized) {
      console.warn('✅ Knowledge base already initialized');
      return;
    }

    try {
      console.warn('📚 Loading knowledge base from Supabase...');
      const documents = await this.knowledgeLoader.loadDocuments();
      const stats = this.knowledgeLoader.getStats();

      // Ya no se indexan documentos en el frontend. Solo se cargan y se muestran estadísticas.
      this.isKnowledgeBaseInitialized = true;
      console.warn(`✅ Knowledge base loaded: ${stats.totalDocuments} total documents`);
      console.warn(`📊 By source:`, stats.bySource);
    } catch (error) {
      console.error('❌ Failed to initialize knowledge base:', error);
      throw new Error('Knowledge base initialization failed. Chatbot will use fallback mode.');
    }
  }

  /**
   * Check if knowledge base is ready
   */
  isKnowledgeBaseReady(): boolean {
    return this.isKnowledgeBaseInitialized;
  }
}

/**
 * Singleton instance for application-wide use
 */
let containerInstance: ChatbotContainer | null = null;

/**
 * Get or create the chatbot container singleton
 */
export function getChatbotContainer(): ChatbotContainer {
  if (!containerInstance) {
    containerInstance = new ChatbotContainer();
  }
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetChatbotContainer(): void {
  containerInstance = null;
}
