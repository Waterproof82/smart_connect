
import { ChatSessionEntity, Message } from '@features/chatbot/domain/entities';

describe('ChatSessionEntity', () => {
      it('should create a session with default values', () => {
            const session = new ChatSessionEntity();
            expect(session.id).toBeDefined();
            expect(session.messages).toEqual([]);
            expect(session.createdAt).toBeInstanceOf(Date);
            expect(session.updatedAt).toBeInstanceOf(Date);
      });

      it('should add a message', () => {
            const session = new ChatSessionEntity();
            const msg: Message = { id: '1', content: 'Hello', role: 'user', timestamp: new Date() };
            const updated = session.addMessage(msg);
            expect(updated.messages).toHaveLength(1);
            expect(updated.messages[0]).toEqual(msg);
            expect(updated.id).toBe(session.id);
      });

      it('should get recent messages', () => {
            const session = new ChatSessionEntity();
            const msgs: Message[] = Array.from({ length: 5 }, (_, i) => ({ id: `${i}`, content: `msg${i}`, role: 'user', timestamp: new Date() }));
            let s = session;
            msgs.forEach(m => { s = s.addMessage(m); });
            expect(s.getRecentMessages(3)).toEqual(msgs.slice(-3));
      });

      it('should filter user and assistant messages', () => {
            const session = new ChatSessionEntity();
            const userMsg: Message = { id: '1', content: 'Hi', role: 'user', timestamp: new Date() };
            const assistantMsg: Message = { id: '2', content: 'Hello', role: 'assistant', timestamp: new Date() };
            const s = session.addMessage(userMsg).addMessage(assistantMsg);
            expect(s.getUserMessages()).toEqual([userMsg]);
            expect(s.getAssistantMessages()).toEqual([assistantMsg]);
      });

      it('should report empty and message count correctly', () => {
            const session = new ChatSessionEntity();
            expect(session.isEmpty()).toBe(true);
            expect(session.getMessageCount()).toBe(0);
            const msg: Message = { id: '1', content: 'Hi', role: 'user', timestamp: new Date() };
            const s = session.addMessage(msg);
            expect(s.isEmpty()).toBe(false);
            expect(s.getMessageCount()).toBe(1);
      });

      it('should clear all messages', () => {
            const session = new ChatSessionEntity();
            const msg: Message = { id: '1', content: 'Hi', role: 'user', timestamp: new Date() };
            const s = session.addMessage(msg);
            const cleared = s.clear();
            expect(cleared.messages).toEqual([]);
            expect(cleared.id).toBe(s.id);
            expect(cleared.createdAt).toEqual(s.createdAt);
            expect(cleared.updatedAt.getTime()).toBeGreaterThanOrEqual(s.updatedAt.getTime());
      });
});
