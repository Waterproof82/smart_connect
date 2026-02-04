/**
 * @file Integration Tests - Chatbot RAG Flow
 * @description Tests the complete RAG (Retrieval-Augmented Generation) flow
 * from user query through embedding generation, similarity search, and response generation.
 * 
 * These tests validate cross-layer integration without hitting real external APIs.
 * Mock external services (Gemini, Supabase) at infrastructure boundary.
 */

import { DocumentEntity } from '../../src/features/chatbot/domain/entities/Document';
import { GeminiDataSource } from '../../src/features/chatbot/data/datasources/GeminiDataSource';
import { SupabaseDataSource } from '../../src/features/chatbot/data/datasources/SupabaseDataSource';
import { ChatRepositoryImpl } from '../../src/features/chatbot/data/repositories/ChatRepositoryImpl';
import { EmbeddingRepositoryImpl } from '../../src/features/chatbot/data/repositories/EmbeddingRepositoryImpl';
import { DocumentRepositoryImpl } from '../../src/features/chatbot/data/repositories/DocumentRepositoryImpl';
import { GenerateResponseUseCase } from '../../src/features/chatbot/domain/usecases/GenerateResponseUseCase';

// Mock external data sources
jest.mock('../../src/features/chatbot/data/datasources/GeminiDataSource');
jest.mock('../../src/features/chatbot/data/datasources/SupabaseDataSource');

describe('Chatbot RAG Flow - Integration Tests', () => {
  let mockGeminiDataSource: jest.Mocked<GeminiDataSource>;
  let mockSupabaseDataSource: jest.Mocked<SupabaseDataSource>;
  
  let chatRepository: ChatRepositoryImpl;
  let embeddingRepository: EmbeddingRepositoryImpl;
  let documentRepository: DocumentRepositoryImpl;
  
  let generateResponseUseCase: GenerateResponseUseCase;

  beforeEach(() => {
    // Initialize mocked data sources
    mockGeminiDataSource = new GeminiDataSource('fake-url', 'fake-key') as jest.Mocked<GeminiDataSource>;
    mockSupabaseDataSource = new SupabaseDataSource('fake-url', 'fake-key') as jest.Mocked<SupabaseDataSource>;

    // Initialize repositories with mocked data sources
    chatRepository = new ChatRepositoryImpl(mockGeminiDataSource);
    embeddingRepository = new EmbeddingRepositoryImpl(mockGeminiDataSource);
    documentRepository = new DocumentRepositoryImpl(mockSupabaseDataSource);

    // Initialize use case with real repositories (but mocked data sources underneath)
    generateResponseUseCase = new GenerateResponseUseCase(
      chatRepository,
      embeddingRepository,
      documentRepository
    );
  });

  describe('Complete RAG Pipeline', () => {
    it('should process user query through full RAG flow: query → embedding → search → context → response', async () => {
      // Arrange: User query
      const userQuery = '¿Qué es QRIBAR?';
      const queryEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      // Mock embedding generation for user query
      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);

      // Mock similarity search returning relevant documents
      const mockDocuments = [
        new DocumentEntity({
          id: '1',
          content: 'QRIBAR es una carta digital con pedidos en mesa mediante códigos QR.',
          metadata: { title: 'QRIBAR Overview', source: 'docs' },
          embedding: [0.1, 0.2, 0.3]
        }),
        new DocumentEntity({
          id: '2',
          content: 'Los clientes escanean el QR en la mesa y hacen pedidos sin esperar al camarero.',
          metadata: { title: 'QRIBAR Features', source: 'docs' },
          embedding: [0.2, 0.3, 0.4]
        }),
      ];
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue(mockDocuments);

      // Mock final AI response generation
      const expectedResponse = 'QRIBAR es una carta digital que permite a los clientes hacer pedidos mediante códigos QR en la mesa, sin necesidad de esperar al camarero.';
      mockGeminiDataSource.generateResponse = jest.fn().mockResolvedValue(expectedResponse);

      // Act: Execute complete RAG flow
      const result = await generateResponseUseCase.execute({ userQuery });

      // Assert: Verify each step of the pipeline was called correctly
      
      // 1. Embedding generation
      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalledWith(userQuery);

      // 2. Similarity search with generated embedding
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith({
        queryEmbedding,
        matchCount: 3,
        matchThreshold: 0.3,
      });

      // 3. Response generation with retrieved context
      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalled();

      // 4. Final response returned to user
      expect(result.response).toBe(expectedResponse);
      expect(result.documentsFound).toBe(2);
      expect(result.contextUsed).toHaveLength(2);
    });

    it('should handle RAG flow with no similar documents found', async () => {
      // Arrange
      const userQuery = 'What is quantum computing?'; // Unrelated to QRIBAR/SmartConnect
      const queryEmbedding = [0.9, 0.8, 0.7];

      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);
      
      // No documents found
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue([]);

      const fallbackResponse = 'Lo siento, no tengo información específica sobre eso. ¿Puedo ayudarte con algo relacionado a QRIBAR o nuestros servicios?';
      mockGeminiDataSource.generateResponse = jest.fn().mockResolvedValue(fallbackResponse);

      // Act
      const result = await generateResponseUseCase.execute({ userQuery });

      // Assert: Should still generate response (fallback mode without context)
      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalled();
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalled();
      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalled();
      expect(result.response).toBe(fallbackResponse);
      expect(result.documentsFound).toBe(0);
    });

    it('should propagate embedding generation errors', async () => {
      // Arrange
      const userQuery = 'Test query';
      const embeddingError = new Error('Gemini API rate limit exceeded');
      mockGeminiDataSource.generateEmbedding = jest.fn().mockRejectedValue(embeddingError);

      // Act & Assert
      await expect(generateResponseUseCase.execute({ userQuery })).rejects.toThrow(
        'Gemini API rate limit exceeded'
      );

      // Verify pipeline stopped at embedding step
      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalled();
      expect(mockSupabaseDataSource.searchSimilarDocuments).not.toHaveBeenCalled();
      expect(mockGeminiDataSource.generateResponse).not.toHaveBeenCalled();
    });

    it('should propagate similarity search errors', async () => {
      // Arrange
      const userQuery = 'Test query';
      const queryEmbedding = [0.1, 0.2];
      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);

      const searchError = new Error('Supabase connection timeout');
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockRejectedValue(searchError);

      // Act & Assert
      await expect(generateResponseUseCase.execute({ userQuery })).rejects.toThrow(
        'Supabase connection timeout'
      );

      // Verify pipeline stopped at search step
      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalled();
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalled();
      expect(mockGeminiDataSource.generateResponse).not.toHaveBeenCalled();
    });

    it('should propagate response generation errors', async () => {
      // Arrange
      const userQuery = 'Test query';
      const queryEmbedding = [0.1, 0.2];
      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue([]);

      const responseError = new Error('Gemini safety filter triggered');
      mockGeminiDataSource.generateResponse = jest.fn().mockRejectedValue(responseError);

      // Act & Assert
      await expect(generateResponseUseCase.execute({ userQuery })).rejects.toThrow(
        'Gemini safety filter triggered'
      );

      // Verify all steps were attempted
      expect(mockGeminiDataSource.generateEmbedding).toHaveBeenCalled();
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalled();
      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalled();
    });
  });

  describe('RAG Context Building', () => {
    it('should build context from multiple relevant documents', async () => {
      // Arrange
      const userQuery = 'Servicios de reputación digital';
      const queryEmbedding = [0.5, 0.5, 0.5];

      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);

      const mockDocuments = [
        new DocumentEntity({ id: '1', content: 'Tarjetas NFC para Google Reviews.', metadata: { title: 'NFC Cards' }, embedding: [0.5, 0.5] }),
        new DocumentEntity({ id: '2', content: 'Códigos QR para perfil de Instagram.', metadata: { title: 'QR Codes' }, embedding: [0.5, 0.6] }),
        new DocumentEntity({ id: '3', content: 'Captación de reseñas automatizada.', metadata: { title: 'Review Automation' }, embedding: [0.6, 0.5] }),
      ];
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue(mockDocuments);
      mockGeminiDataSource.generateResponse = jest.fn().mockResolvedValue('Respuesta con contexto');

      // Act
      await generateResponseUseCase.execute({ userQuery });

      // Assert: Verify all documents were used in context
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ queryEmbedding })
      );
      expect(mockGeminiDataSource.generateResponse).toHaveBeenCalled();
    });

    it('should respect similarity threshold in document retrieval', async () => {
      // Arrange
      const userQuery = 'Test query';
      const queryEmbedding = [0.1];

      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue([]);
      mockGeminiDataSource.generateResponse = jest.fn().mockResolvedValue('Response');

      // Act
      await generateResponseUseCase.execute({ userQuery });

      // Assert: Default threshold should be applied (0.3)
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ matchThreshold: 0.3 })
      );
    });

    it('should respect document limit in similarity search', async () => {
      // Arrange
      const userQuery = 'Test query';
      const queryEmbedding = [0.1];

      mockGeminiDataSource.generateEmbedding = jest.fn().mockResolvedValue(queryEmbedding);
      mockSupabaseDataSource.searchSimilarDocuments = jest.fn().mockResolvedValue([]);
      mockGeminiDataSource.generateResponse = jest.fn().mockResolvedValue('Response');

      // Act
      await generateResponseUseCase.execute({ userQuery });

      // Assert: Default limit should be applied (3 documents in GenerateResponseUseCase)
      expect(mockSupabaseDataSource.searchSimilarDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ matchCount: 3 })
      );
    });
  });
});
