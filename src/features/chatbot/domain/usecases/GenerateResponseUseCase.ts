/**
 * GenerateResponseUseCase
 * 
 * Business logic for generating AI responses with RAG.
 * Orchestrates: Search documents → Build context → Generate response
 * 
 * Follows Single Responsibility Principle (SOLID).
 */

import { IChatRepository } from '../repositories/IChatRepository';
import { IEmbeddingRepository } from '../repositories/IEmbeddingRepository';
import { IDocumentRepository } from '../repositories/IDocumentRepository';

export interface GenerateResponseInput {
  userQuery: string;
  includeContext?: boolean;
  maxContextDocuments?: number;
  temperature?: number;
}

export interface GenerateResponseOutput {
  response: string;
  contextUsed: string[];
  documentsFound: number;
}

export class GenerateResponseUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly embeddingRepository: IEmbeddingRepository,
    private readonly documentRepository: IDocumentRepository
  ) {}

  async execute(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
    const {
      userQuery,
      includeContext = true,
      maxContextDocuments = 3,
      temperature = 0.7,
    } = input;

    // 1. Search for relevant documents (if RAG enabled)
    let contextDocs: string[] = [];
    let docsFound = 0;

    if (includeContext) {
      // Generate embedding for user query
      const queryEmbedding = await this.embeddingRepository.generateEmbedding(
        userQuery
      );

      // Search similar documents
      const documents = await this.documentRepository.searchSimilarDocuments({
        queryEmbedding,
        limit: maxContextDocuments,
        threshold: 0.3,
      });

      docsFound = documents.length;
      contextDocs = documents.map((doc) => doc.content);
    }

    // 2. Build context from documents
    const context = contextDocs.length > 0 ? contextDocs.join('\n\n') : '';

    // 3. Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // 4. Generate response
    const response = await this.chatRepository.generateResponse({
      userQuery: `${systemPrompt}\n\nPregunta del usuario: ${userQuery}`,
      temperature,
      maxTokens: 500,
    });

    return {
      response,
      contextUsed: contextDocs,
      documentsFound: docsFound,
    };
  }

  private buildSystemPrompt(context: string): string {
    return `Eres el Asistente Experto de SmartConnect AI. 

TUS SERVICIOS PRINCIPALES:
1. QRIBAR: Menús digitales interactivos para restaurantes y bares
2. Automatización n8n: Flujos de trabajo inteligentes para empresas
3. Tarjetas Tap-to-Review NFC: Sistema para aumentar reseñas en Google Maps

${context ? `INFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n${context}\n\n` : ''}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé profesional, conciso y entusiasta
- Si la información está en la base de conocimiento, úsala
- Si no sabes algo, reconócelo y ofrece contactar al equipo
- Mantén respuestas bajo 150 palabras`;
  }
}
