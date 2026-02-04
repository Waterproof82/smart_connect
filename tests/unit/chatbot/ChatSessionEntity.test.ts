/**
 * Unit Tests for ChatSessionEntity
 * 
 * Tests chat session aggregate with message management
 */

import { ChatSessionEntity, MessageEntity } from '@features/chatbot/domain/entities';

describe('ChatSessionEntity', () => {
  describe('constructor', () => {
    it('should create empty session with generated ID', () => {
      const session = new ChatSessionEntity();

      expect(session.id).toBeDefined();
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it('should create session with initial messages', () => {
      const message1 = new MessageEntity({ role: 'user', content: 'Hello' });
      const message2 = new MessageEntity({ role: 'assistant', content: 'Hi' });

      const session = new ChatSessionEntity({
        messages: [message1, message2],
      });

      expect(session.messages).toHaveLength(2);
      expect(session.messages[0]).toBe(message1);
      expect(session.messages[1]).toBe(message2);
    });

    it('should accept custom ID and dates', () => {
      const customId = 'session-123';
      const customDate = new Date('2026-01-01');

      const session = new ChatSessionEntity({
        id: customId,
        createdAt: customDate,
        updatedAt: customDate,
      });

      expect(session.id).toBe(customId);
      expect(session.createdAt).toBe(customDate);
      expect(session.updatedAt).toBe(customDate);
    });
  });

  describe('addMessage', () => {
    it('should add message and return new session', () => {
      const session = new ChatSessionEntity();
      const message = new MessageEntity({ role: 'user', content: 'Test' });

      const newSession = session.addMessage(message);

      expect(newSession.messages).toHaveLength(1);
      expect(newSession.messages[0]).toBe(message);
      expect(newSession).not.toBe(session); // Immutability
      expect(session.messages).toHaveLength(0); // Original unchanged
    });

    it('should preserve existing messages when adding new one', () => {
      const message1 = new MessageEntity({ role: 'user', content: 'First' });
      const session1 = new ChatSessionEntity().addMessage(message1);

      const message2 = new MessageEntity({ role: 'assistant', content: 'Second' });
      const session2 = session1.addMessage(message2);

      expect(session2.messages).toHaveLength(2);
      expect(session2.messages[0]).toBe(message1);
      expect(session2.messages[1]).toBe(message2);
    });

    it('should update updatedAt timestamp', () => {
      const session = new ChatSessionEntity();
      const originalUpdatedAt = session.updatedAt;

      // Wait a bit to ensure different timestamp
      const message = new MessageEntity({ role: 'user', content: 'Test' });
      const newSession = session.addMessage(message);

      expect(newSession.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('getRecentMessages', () => {
    it('should return last N messages', () => {
      let session = new ChatSessionEntity();
      
      for (let i = 1; i <= 5; i++) {
        const message = new MessageEntity({ role: 'user', content: `Message ${i}` });
        session = session.addMessage(message);
      }

      const recent = session.getRecentMessages(3);

      expect(recent).toHaveLength(3);
      expect(recent[0].content).toBe('Message 3');
      expect(recent[1].content).toBe('Message 4');
      expect(recent[2].content).toBe('Message 5');
    });

    it('should return all messages if count exceeds total', () => {
      const message = new MessageEntity({ role: 'user', content: 'Test' });
      const session = new ChatSessionEntity().addMessage(message);

      const recent = session.getRecentMessages(10);

      expect(recent).toHaveLength(1);
      expect(recent[0]).toBe(message);
    });

    it('should return empty array for empty session', () => {
      const session = new ChatSessionEntity();
      const recent = session.getRecentMessages(5);

      expect(recent).toEqual([]);
    });
  });

  describe('getUserMessages', () => {
    it('should return only user messages', () => {
      let session = new ChatSessionEntity();
      
      const userMsg1 = new MessageEntity({ role: 'user', content: 'Q1' });
      const assistantMsg1 = new MessageEntity({ role: 'assistant', content: 'A1' });
      const userMsg2 = new MessageEntity({ role: 'user', content: 'Q2' });
      const assistantMsg2 = new MessageEntity({ role: 'assistant', content: 'A2' });

      session = session
        .addMessage(userMsg1)
        .addMessage(assistantMsg1)
        .addMessage(userMsg2)
        .addMessage(assistantMsg2);

      const userMessages = session.getUserMessages();

      expect(userMessages).toHaveLength(2);
      expect(userMessages[0]).toBe(userMsg1);
      expect(userMessages[1]).toBe(userMsg2);
    });
  });

  describe('getAssistantMessages', () => {
    it('should return only assistant messages', () => {
      let session = new ChatSessionEntity();
      
      const userMsg = new MessageEntity({ role: 'user', content: 'Q' });
      const assistantMsg1 = new MessageEntity({ role: 'assistant', content: 'A1' });
      const assistantMsg2 = new MessageEntity({ role: 'assistant', content: 'A2' });

      session = session
        .addMessage(userMsg)
        .addMessage(assistantMsg1)
        .addMessage(assistantMsg2);

      const assistantMessages = session.getAssistantMessages();

      expect(assistantMessages).toHaveLength(2);
      expect(assistantMessages[0]).toBe(assistantMsg1);
      expect(assistantMessages[1]).toBe(assistantMsg2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for new session', () => {
      const session = new ChatSessionEntity();
      expect(session.isEmpty()).toBe(true);
    });

    it('should return false after adding message', () => {
      const session = new ChatSessionEntity();
      const message = new MessageEntity({ role: 'user', content: 'Test' });
      const newSession = session.addMessage(message);

      expect(newSession.isEmpty()).toBe(false);
    });
  });

  describe('getMessageCount', () => {
    it('should return 0 for empty session', () => {
      const session = new ChatSessionEntity();
      expect(session.getMessageCount()).toBe(0);
    });

    it('should return correct count', () => {
      let session = new ChatSessionEntity();
      
      for (let i = 0; i < 3; i++) {
        const message = new MessageEntity({ role: 'user', content: `Msg ${i}` });
        session = session.addMessage(message);
      }

      expect(session.getMessageCount()).toBe(3);
    });
  });

  describe('clear', () => {
    it('should create new session with same ID but empty messages', () => {
      let session = new ChatSessionEntity({ id: 'test-session' });
      
      const message = new MessageEntity({ role: 'user', content: 'Test' });
      session = session.addMessage(message);

      const cleared = session.clear();

      expect(cleared.id).toBe('test-session');
      expect(cleared.messages).toEqual([]);
      expect(cleared).not.toBe(session);
    });
  });
});
