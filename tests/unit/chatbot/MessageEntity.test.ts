/**
 * Unit Tests for MessageEntity
 * 
 * Tests domain entity validation and business rules
 */

import { MessageEntity } from '@features/chatbot/domain/entities';

describe('MessageEntity', () => {
  describe('constructor', () => {
    it('should create a message with provided values', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Hello',
      });

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different messages', () => {
      const message1 = new MessageEntity({ role: 'user', content: 'Test 1' });
      const message2 = new MessageEntity({ role: 'user', content: 'Test 2' });

      expect(message1.id).not.toBe(message2.id);
    });

    it('should accept custom ID and timestamp', () => {
      const customId = 'custom-id-123';
      const customTimestamp = new Date('2026-01-01');

      const message = new MessageEntity({
        id: customId,
        role: 'assistant',
        content: 'Response',
        timestamp: customTimestamp,
      });

      expect(message.id).toBe(customId);
      expect(message.timestamp).toBe(customTimestamp);
    });
  });

  describe('isValid', () => {
    it('should return true for valid message', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'Valid message',
      });
      expect(message.isValid()).toBe(true);
    });

    it('should throw for empty content', () => {
      expect(() => new MessageEntity({
        role: 'user',
        content: '   ',
      })).toThrow('Message content cannot be empty');
    });

    it('should throw for content exceeding 4000 characters', () => {
      expect(() => new MessageEntity({
        role: 'user',
        content: 'a'.repeat(4001),
      })).toThrow('Message content exceeds maximum length (4000 characters)');
    });

    it('should return true for content at exactly 4000 characters', () => {
      const message = new MessageEntity({
        role: 'user',
        content: 'a'.repeat(4000),
      });
      expect(message.isValid()).toBe(true);
    });
  });

  describe('withContent', () => {
    it('should create new message with updated content', () => {
      const original = new MessageEntity({
        id: 'test-id',
        role: 'user',
        content: 'Original',
        timestamp: new Date('2026-01-01'),
      });

      const updated = original.withContent('Updated');

      expect(updated.content).toBe('Updated');
      expect(updated.id).toBe(original.id);
      expect(updated.role).toBe(original.role);
      expect(updated.timestamp).toBe(original.timestamp);
      expect(updated).not.toBe(original); // Should be a new instance
    });
  });
});
