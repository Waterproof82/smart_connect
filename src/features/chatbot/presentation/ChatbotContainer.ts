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

/**
 * Container for all chatbot dependencies
 */
export class ChatbotContainer {
  // Use Cases (exposed to UI layer)
  public readonly generateResponseUseCase: GenerateResponseUseCase;
  public readonly searchDocumentsUseCase: SearchDocumentsUseCase;

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
    const geminiDataSource = new GeminiDataSource(supabaseUrl, supabaseAnonKey);
    const supabaseDataSource = new SupabaseDataSource(supabaseUrl, supabaseAnonKey);

    // ===================================
    // 2. DATA LAYER (Repository Implementations)
    // ===================================
    const chatRepository = new ChatRepositoryImpl(geminiDataSource);
    const embeddingRepository = new EmbeddingRepositoryImpl(geminiDataSource);
    const documentRepository = new DocumentRepositoryImpl(supabaseDataSource);

    // ===================================
    // 3. DOMAIN LAYER (Use Cases)
    // ===================================
    this.generateResponseUseCase = new GenerateResponseUseCase(
      chatRepository,
      embeddingRepository,
      documentRepository
    );

    this.searchDocumentsUseCase = new SearchDocumentsUseCase(
      embeddingRepository,
      documentRepository
    );
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
