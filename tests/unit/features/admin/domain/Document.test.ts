/**
 * Document Entity Tests
 * 
 * Clean Architecture: Domain Layer Tests
 */

import { Document } from '@/features/admin/domain/entities/Document';

describe('Document Entity', () => {
  describe('create', () => {
    it('should create a valid document', () => {
      const doc = Document.create({
        id: '123',
        content: 'Test content',
        source: 'qribar',
        category: 'producto_digital',
        embedding: new Array(768).fill(0),
        createdAt: new Date(),
      });

      expect(doc.id).toBe('123');
      expect(doc.content).toBe('Test content');
      expect(doc.source).toBe('qribar');
      expect(doc.category).toBe('producto_digital');
    });

    it('should use default category if not provided', () => {
      const doc = Document.create({
        id: '123',
        content: 'Test content',
        source: 'qribar',
        createdAt: new Date(),
      });

      expect(doc.category).toBe('general');
    });

    it('should throw error for empty content', () => {
      expect(() => {
        Document.create({
          id: '123',
          content: '',
          source: 'qribar',
          createdAt: new Date(),
        });
      }).toThrow('Document content cannot be empty');
    });

    it('should throw error for content exceeding max length', () => {
      expect(() => {
        Document.create({
          id: '123',
          content: 'a'.repeat(10001),
          source: 'qribar',
          createdAt: new Date(),
        });
      }).toThrow('Document content exceeds maximum length');
    });

    it('should throw error for empty source', () => {
      expect(() => {
        Document.create({
          id: '123',
          content: 'Test content',
          source: '',
          createdAt: new Date(),
        });
      }).toThrow('Document source cannot be empty');
    });

    it('should throw error for invalid embedding dimensions', () => {
      expect(() => {
        Document.create({
          id: '123',
          content: 'Test content',
          source: 'qribar',
          embedding: new Array(512).fill(0), // Invalid: should be 768
          createdAt: new Date(),
        });
      }).toThrow('Embedding must be 768 dimensions if provided');
    });
  });

  describe('hasEmbedding', () => {
    it('should return true if document has valid embedding', () => {
      const doc = Document.create({
        id: '123',
        content: 'Test content',
        source: 'qribar',
        embedding: new Array(768).fill(0),
        createdAt: new Date(),
      });

      expect(doc.hasEmbedding()).toBe(true);
    });

    it('should return false if document has no embedding', () => {
      const doc = Document.create({
        id: '123',
        content: 'Test content',
        source: 'qribar',
        createdAt: new Date(),
      });

      expect(doc.hasEmbedding()).toBe(false);
    });
  });

  describe('getContentPreview', () => {
    it('should return full content if within limit', () => {
      const doc = Document.create({
        id: '123',
        content: 'Short content',
        source: 'qribar',
        createdAt: new Date(),
      });

      expect(doc.getContentPreview(100)).toBe('Short content');
    });

    it('should truncate content with ellipsis if exceeds limit', () => {
      const doc = Document.create({
        id: '123',
        content: 'a'.repeat(150),
        source: 'qribar',
        createdAt: new Date(),
      });

      const preview = doc.getContentPreview(100);
      expect(preview).toBe('a'.repeat(100) + '...');
      expect(preview.length).toBe(103);
    });
  });

  describe('withContent', () => {
    it('should create new document with updated content', () => {
      const original = Document.create({
        id: '123',
        content: 'Original content',
        source: 'qribar',
        createdAt: new Date('2026-01-01'),
      });

      const updated = original.withContent('Updated content');

      expect(updated.content).toBe('Updated content');
      expect(updated.id).toBe(original.id);
      expect(updated.source).toBe(original.source);
      expect(updated.updatedAt).not.toBeNull();
    });
  });
});
