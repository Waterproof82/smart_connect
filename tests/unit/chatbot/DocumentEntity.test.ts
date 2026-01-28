/**
 * Unit Tests for DocumentEntity
 * Tests document entity with similarity scoring
 */

import { DocumentEntity } from '@features/chatbot/domain/entities';

describe('DocumentEntity', () => {
  describe('constructor', () => {
    it('should create document with all fields', () => {
      const doc = new DocumentEntity({
        id: 'doc-123',
        content: 'Test content',
        metadata: { source: 'docs', category: 'qribar' },
        embedding: [0.1, 0.2, 0.3],
        similarity: 0.95,
      });

      expect(doc.id).toBe('doc-123');
      expect(doc.content).toBe('Test content');
      expect(doc.metadata.source).toBe('docs');
      expect(doc.embedding).toEqual([0.1, 0.2, 0.3]);
      expect(doc.similarity).toBe(0.95);
    });

    it('should generate ID when not provided', () => {
      const doc = new DocumentEntity({
        content: 'Test',
        metadata: {},
      });

      expect(doc.id).toBeDefined();
      expect(doc.id.length).toBeGreaterThan(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid document with content', () => {
      const doc = new DocumentEntity({
        content: 'Valid content',
        metadata: {},
      });

      expect(doc.isValid()).toBe(true);
    });

    it('should return false for empty content', () => {
      const doc = new DocumentEntity({
        content: '',
        metadata: {},
      });

      expect(doc.isValid()).toBe(false);
    });

    it('should return false for whitespace-only content', () => {
      const doc = new DocumentEntity({
        content: '   ',
        metadata: {},
      });

      expect(doc.isValid()).toBe(false);
    });

    it('should return true even without embedding', () => {
      const doc = new DocumentEntity({
        content: 'Content',
        metadata: {},
      });

      expect(doc.isValid()).toBe(true);
    });
  });

  describe('isRelevant', () => {
    it('should return true when similarity above default threshold', () => {
      const doc = new DocumentEntity({
        content: 'Test',
        metadata: {},
        similarity: 0.5,
      });

      expect(doc.isRelevant()).toBe(true);
    });

    it('should return false when similarity below default threshold', () => {
      const doc = new DocumentEntity({
        content: 'Test',
        metadata: {},
        similarity: 0.2,
      });

      expect(doc.isRelevant()).toBe(false);
    });

    it('should use custom threshold', () => {
      const doc = new DocumentEntity({
        content: 'Test',
        metadata: {},
        similarity: 0.7,
      });

      expect(doc.isRelevant(0.8)).toBe(false);
      expect(doc.isRelevant(0.6)).toBe(true);
    });

    it('should return false when similarity is undefined', () => {
      const doc = new DocumentEntity({
        content: 'Test',
        metadata: {},
      });

      expect(doc.isRelevant()).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('should return full content when shorter than limit', () => {
      const doc = new DocumentEntity({
        content: 'Short content',
        metadata: {},
      });

      expect(doc.getSummary(100)).toBe('Short content');
    });

    it('should truncate content and add ellipsis', () => {
      const longContent = 'This is a very long document content that should be truncated';
      const doc = new DocumentEntity({
        content: longContent,
        metadata: {},
      });

      const summary = doc.getSummary(20);
      expect(summary).toBe('This is a very long ...');
      expect(summary.length).toBe(23); // 20 + "..."
    });

    it('should use default length of 200', () => {
      const longContent = 'A'.repeat(250);
      const doc = new DocumentEntity({
        content: longContent,
        metadata: {},
      });

      const summary = doc.getSummary();
      expect(summary.length).toBe(203); // 200 + "..."
    });

    it('should handle exact length match', () => {
      const doc = new DocumentEntity({
        content: 'Exactly twenty chars',
        metadata: {},
      });

      expect(doc.getSummary(20)).toBe('Exactly twenty chars');
    });
  });

  describe('withSimilarity', () => {
    it('should create new instance with updated similarity', () => {
      const original = new DocumentEntity({
        id: 'doc-1',
        content: 'Test',
        metadata: { source: 'docs' },
        similarity: 0.5,
      });

      const updated = original.withSimilarity(0.9);

      expect(updated).not.toBe(original);
      expect(updated.id).toBe(original.id);
      expect(updated.content).toBe(original.content);
      expect(updated.similarity).toBe(0.9);
    });
  });
});
