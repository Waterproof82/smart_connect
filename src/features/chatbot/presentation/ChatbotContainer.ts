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
import { GenerateResponseUseCase, SearchDocumentsUseCase } from '../domain/usecases';
import { RAGOrchestrator } from '../domain/rag-orchestrator';
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
  public readonly searchDocumentsUseCase: SearchDocumentsUseCase;
  
  // RAG System
  private readonly ragOrchestrator: RAGOrchestrator;
  // Removed knowledgeLoader and related logic (no longer used)
  private readonly isKnowledgeBaseInitialized = false;

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
    const embeddingRepository = new EmbeddingRepositoryImpl(geminiDataSource);
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

    // Knowledge Base Loader removed (no longer used)

    // ===================================
    // 4. DOMAIN LAYER (Use Cases)
    // ===================================
    this.generateResponseUseCase = new GenerateResponseUseCase(
      chatRepository,
      this.ragOrchestrator
    );

    this.searchDocumentsUseCase = new SearchDocumentsUseCase(
      embeddingRepository,
      documentRepository
    );
  }

  /**
   * Initialize knowledge base from Supabase documents
   * This loads all documents at startup for in-memory search optimization
   * Performance: Reduces query latency from 800ms to 150ms
   */
  // initializeKnowledgeBase removed (no longer used)

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
