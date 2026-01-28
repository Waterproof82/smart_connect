/**
 * ChatSession Entity
 * 
 * Represents a complete chat conversation session.
 * Aggregates messages and provides conversation history management.
 */

import { Message } from './Message';

export interface ChatSession {
  readonly id: string;
  readonly messages: Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class ChatSessionEntity implements ChatSession {
  readonly id: string;
  readonly messages: Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id?: string;
    messages?: Message[];
    createdAt?: Date;
    updatedAt?: Date;
  } = {}) {
    const generatedId = params.id ?? ChatSessionEntity.generateIdStatic();
    
    this.id = generatedId;
    this.messages = params.messages ?? [];
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  /**
   * Static ID generator (can be called before constructor completes)
   */
  private static generateIdStatic(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Adds a new message to the session
   */
  addMessage(message: Message): ChatSessionEntity {
    return new ChatSessionEntity({
      id: this.id,
      messages: [...this.messages, message],
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Gets the last N messages
   */
  getRecentMessages(count: number = 10): Message[] {
    return this.messages.slice(-count);
  }

  /**
   * Gets only user messages
   */
  getUserMessages(): Message[] {
    return this.messages.filter((m) => m.role === 'user');
  }

  /**
   * Gets only assistant messages
   */
  getAssistantMessages(): Message[] {
    return this.messages.filter((m) => m.role === 'assistant');
  }

  /**
   * Checks if session has any messages
   */
  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  /**
   * Generate a unique ID (browser-compatible fallback)
   */
  private generateId(): string {
    return ChatSessionEntity.generateIdStatic();
  }

  /**
   * Gets conversation length
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Clears all messages (creates new session with same ID)
   */
  clear(): ChatSessionEntity {
    return new ChatSessionEntity({
      id: this.id,
      messages: [],
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
