/**
 * Message Entity
 * 
 * Represents a single message in the chat conversation.
 * Pure domain entity with no external dependencies.
 */

export type MessageRole = 'user' | 'assistant';

export interface Message {
  readonly id: number | string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date | number;
}

export class MessageEntity implements Message {
  readonly id: number | string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date | number;

  constructor(params: {
    id?: number | string;
    role: string;
    content: string;
    timestamp?: Date | number;
  }) {
    // Validate and assign role
    if (params.role !== 'user' && params.role !== 'assistant') {
      throw new Error('Invalid role');
    }
    // Validate and trim content
    const trimmedContent = params.content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (trimmedContent.length > 4000) {
      throw new Error('Message content exceeds maximum length (4000 characters)');
    }
    // Generate ID first to ensure it exists before other operations
    const generatedId = params.id ?? MessageEntity.generateIdStatic();
    this.id = generatedId;
    this.role = params.role;
    this.content = trimmedContent;
    this.timestamp = params.timestamp ?? new Date();
    // Freeze to enforce immutability
    Object.freeze(this);
  }

  /**
   * Static ID generator (can be called before constructor completes)
   */
  private static generateIdStatic(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Validates message content (legacy: returns false for empty or >4000 chars)
   */
  isValid(): boolean {
    const trimmedContent = this.content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) return false;
    if (trimmedContent.length > 4000) return false;
    return true;
  }

  /**
   * Creates a copy with updated content
   */
  withContent(newContent: string): MessageEntity {
    return new MessageEntity({
      id: this.id,
      role: this.role,
      content: newContent,
      timestamp: this.timestamp,
    });
  }

  /**
   * Generate a unique ID (browser-compatible fallback)
   */
  private generateId(): number {
    return MessageEntity.generateIdStatic();
  }
}
