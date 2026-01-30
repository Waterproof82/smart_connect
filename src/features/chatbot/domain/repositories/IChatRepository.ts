/**
 * IChatRepository Interface
 * 
 * Defines the contract for chat-related operations.
 * Domain layer defines interface, Data layer implements it.
 * This follows Dependency Inversion Principle (SOLID).
 */

import { Message } from '../entities/Message';

export interface GenerateResponseParams {
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  abTestGroup?: string;
}

export interface IChatRepository {
  /**
   * Generates an AI response based on user query and context
   */
  generateResponse(params: GenerateResponseParams): Promise<string>;

  /**
   * Stores a message (for persistence/history)
   */
  saveMessage?(message: Message): Promise<void>;

  /**
   * Retrieves chat history
   */
  getHistory?(sessionId: string): Promise<Message[]>;
}
