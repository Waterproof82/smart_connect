/**
 * Unit Tests for MessageEntity
 * 
 * Tests domain logic for message validation and business rules.
 * 
 * TDD Approach: Test-first development as per docs/context/readme_testing.md
 */

import { MessageEntity } from '@features/chatbot/domain/entities/Message';

describe('MessageEntity', () => {
  describe('Creation and Validation', () => {
    it('should create a valid user message', () => {
      const message = new MessageEntity({
        id: 'test-123',
        role: 'user',
        content: 'Hello, how can I help?',
        timestamp: new Date('2026-01-29T10:00:00Z'),
      });

      expect(message.id).toBe('test-123');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, how can I help?');
      expect(message.timestamp).toEqual(new Date('2026-01-29T10:00:00Z'));
    });

    it('should create a valid assistant message', () => {
      const message = new MessageEntity({
        id: 'test-456',
        role: 'assistant',
        content: 'I can help you with QRIBAR setup.',
        timestamp: new Date('2026-01-29T10:01:00Z'),
      });

      expect(message.role).toBe('assistant');
      expect(message.content).toContain('QRIBAR');
    });

    it('should generate UUID if id is not provided', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Test message',
      });

      expect(message.id).toBeDefined();
      expect(message.id.length).toBeGreaterThan(0);
    });

    it('should set current timestamp if not provided', () => {
      const before = new Date();
      const message = new MessageEntity({
        role: 'user',
        content: 'Test message',
      });
      const after = new Date();

      expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(message.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Content Validation', () => {
    it('should reject empty content', () => {
      expect(() => {
        new MessageEntity({
          role: 'user',
          content: '',
        });
      }).toThrow('Message content cannot be empty');
    });

    it('should reject whitespace-only content', () => {
      expect(() => {
        new MessageEntity({
          role: 'user',
          content: '   ',
        });
      }).toThrow('Message content cannot be empty');
    });

    it('should reject content exceeding 4000 characters', () => {
      const longContent = 'a'.repeat(4001);

      expect(() => {
        new MessageEntity({
          role: 'user',
          content: longContent,
        });
      }).toThrow('exceeds maximum length');
    });

    it('should accept content exactly at 4000 character limit', () => {
      const maxContent = 'a'.repeat(4000);

      const message = new MessageEntity({
        role: 'user',
        content: maxContent,
      });

      expect(message.content.length).toBe(4000);
    });

    it('should trim whitespace from content', () => {
      const message = new MessageEntity({
        role: 'user',
        content: '  Hello World  ',
      });

      expect(message.content).toBe('Hello World');
    });
  });

  describe('Role Validation', () => {
    it('should accept "user" role', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Test',
      });

      expect(message.role).toBe('user');
    });

    it('should accept "assistant" role', () => {
      const message = new MessageEntity({
        role: 'assistant',
        content: 'Test',
      });

      expect(message.role).toBe('assistant');
    });

    it('should reject invalid roles', () => {
      expect(() => {
        new MessageEntity({
          role: 'admin' as any, // Invalid role
          content: 'Test',
        });
      }).toThrow('Invalid role');
    });

    it('should reject system role (reserved for future use)', () => {
      expect(() => {
        new MessageEntity({
          role: 'system' as any,
          content: 'Test',
        });
      }).toThrow('Invalid role');
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of role after creation', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Test',
      });

      expect(() => {
        (message as any).role = 'assistant';
      }).toThrow();
    });

    it('should not allow modification of content after creation', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Original content',
      });

      expect(() => {
        (message as any).content = 'Modified content';
      }).toThrow();
    });

    it('should not allow modification of timestamp after creation', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Test',
      });

      expect(() => {
        (message as any).timestamp = new Date();
      }).toThrow();
    });
  });

  describe('Serialization', () => {
    it('should have all required properties', () => {
      const message = new MessageEntity({
        id: 'test-789',
        role: 'user',
        content: 'Test message',
        timestamp: new Date('2026-01-29T12:00:00Z'),
      });

      expect(message.id).toBe('test-789');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Test message');
      expect(message.timestamp).toEqual(new Date('2026-01-29T12:00:00Z'));
    });
  });

  describe('Business Logic', () => {
    it('should identify user messages correctly by role', () => {
      const userMessage = new MessageEntity({
        role: 'user',
        content: 'Question',
      });

      expect(userMessage.role).toBe('user');
    });

    it('should identify assistant messages correctly by role', () => {
      const assistantMessage = new MessageEntity({
        role: 'assistant',
        content: 'Answer',
      });

      expect(assistantMessage.role).toBe('assistant');
    });

    it('should calculate message age correctly', () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      const message = new MessageEntity({
        role: 'user',
        content: 'Test',
        timestamp: pastDate,
      });

      const ageMs = Date.now() - message.timestamp.getTime();

      expect(ageMs).toBeGreaterThanOrEqual(60000);
      expect(ageMs).toBeLessThan(70000); // Allow some margin
    });

    it('should format timestamp as ISO string', () => {
      const date = new Date('2026-01-29T14:30:00Z');
      const message = new MessageEntity({
        role: 'user',
        content: 'Test',
        timestamp: date,
      });

      expect(message.timestamp.toISOString()).toBe('2026-01-29T14:30:00.000Z');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in content', () => {
      const specialChars = 'Test with émojis 😀 and symbols: @#$%^&*()';
      const message = new MessageEntity({
        role: 'user',
        content: specialChars,
      });

      expect(message.content).toBe(specialChars);
    });

    it('should handle multiline content', () => {
      const multiline = `Line 1
Line 2
Line 3`;
      const message = new MessageEntity({
        role: 'user',
        content: multiline,
      });

      expect(message.content).toContain('\n');
      expect(message.content.split('\n').length).toBe(3);
    });

    it('should handle content with URLs', () => {
      const contentWithUrl = 'Check out https://smartconnect.ai for more info';
      const message = new MessageEntity({
        role: 'user',
        content: contentWithUrl,
      });

      expect(message.content).toContain('https://');
    });

    it('should handle content with code blocks', () => {
      const codeContent = 'Here is code: `console.log("Hello")`';
      const message = new MessageEntity({
        role: 'assistant',
        content: codeContent,
      });

      expect(message.content).toContain('`');
    });
  });
});
