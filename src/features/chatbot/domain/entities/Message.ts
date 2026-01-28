/**
 * Message Entity
 * 
 * Represents a single message in the chat conversation.
 * Pure domain entity with no external dependencies.
 */

export type MessageRole = 'user' | 'assistant';

export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
}

export class MessageEntity implements Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;

  constructor(params: {
    id?: string;
    role: MessageRole;
    content: string;
    timestamp?: Date;
  }) {
    // Generate ID first to ensure it exists before other operations
    const generatedId = params.id ?? MessageEntity.generateIdStatic();
    
    this.id = generatedId;
    this.role = params.role;
    this.content = params.content;
    this.timestamp = params.timestamp ?? new Date();
  }

  /**
   * Static ID generator (can be called before constructor completes)
   */
  private static generateIdStatic(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validates message content
   */
  isValid(): boolean {
    return (
      this.content.trim().length > 0 &&
      this.content.length <= 4000 && // Max length
      ['user', 'assistant'].includes(this.role)
    );
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
  private generateId(): string {
    return MessageEntity.generateIdStatic();
  }
}
