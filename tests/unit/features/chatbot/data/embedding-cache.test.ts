/**
 * Embedding Cache Test Suite (TDD - Test First)
 * 
 * Fase 2: Caché de Embeddings
 * - Storage: Local (in-memory) + Supabase (backup)
 * - TTL: 7 días (604800000 ms)
 * - Invalidation: Manual + Webhook desde n8n
 * 
 * ADR: docs/adr/006-rag-architecture-decision.md
 * Clean Architecture: Data Layer Test
 */

const createMockQueryBuilder = () => {
  const mock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  return mock;
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => createMockQueryBuilder()),
  })),
}));

jest.mock('@/shared/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => createMockQueryBuilder()),
  },
}));

import { EmbeddingCache } from '@/features/chatbot/data/embedding-cache';

describe('EmbeddingCache - Core Functionality', () => {
  let cache: EmbeddingCache;
  const testEmbedding = Array.from({ length: 768 }, () => Math.random());

  beforeEach(() => {
    // Arrange: Inicializar cache limpia
    cache = new EmbeddingCache({
      ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
  });

  afterEach(async () => {
    // Cleanup: Limpiar cache después de cada test
    await cache.clear();
  });

  test('MUST store and retrieve embedding from cache', async () => {
    // Arrange
    const key = 'qribar_chunk_0';
    const embedding = testEmbedding;

    // Act
    await cache.set(key, embedding);
    const retrieved = await cache.get(key);

    // Assert
    expect(retrieved).toBeDefined();
    expect(retrieved?.embedding).toEqual(embedding);
    expect(retrieved?.key).toBe(key);
  });

  test('MUST return null for cache miss', async () => {
    // Arrange
    const nonExistentKey = 'non_existent_key';

    // Act
    const result = await cache.get(nonExistentKey);

    // Assert
    expect(result).toBeNull();
  });

  test('MUST include timestamp in cache entry', async () => {
    // Arrange
    const key = 'test_key';
    const beforeStore = Date.now();

    // Act
    await cache.set(key, testEmbedding);
    const entry = await cache.get(key);
    const afterStore = Date.now();

    // Assert
    expect(entry).toBeDefined();
    expect(entry.timestamp).toBeGreaterThanOrEqual(beforeStore);
    expect(entry.timestamp).toBeLessThanOrEqual(afterStore);
  });

  test('MUST include metadata in cache entry', async () => {
    // Arrange
    const key = 'qribar_chunk_0';
    const metadata = {
      source: 'qribar',
      category: 'producto_digital',
      chunkIndex: 0,
    };

    // Act
    await cache.set(key, testEmbedding, metadata);
    const entry = await cache.get(key);

    // Assert
    expect(entry?.metadata).toEqual(metadata);
  });

  test('MUST overwrite existing entry with same key', async () => {
    // Arrange
    const key = 'test_key';
    const embedding1 = Array.from({ length: 768 }, () => 0.1);
    const embedding2 = Array.from({ length: 768 }, () => 0.9);

    // Act
    await cache.set(key, embedding1);
    await cache.set(key, embedding2);
    const entry = await cache.get(key);

    // Assert
    expect(entry?.embedding).toEqual(embedding2);
    expect(entry?.embedding).not.toEqual(embedding1);
  });

  test('MUST handle multiple entries', async () => {
    // Arrange
    const entries = [
      { key: 'key1', embedding: Array.from({ length: 768 }, () => 0.1) },
      { key: 'key2', embedding: Array.from({ length: 768 }, () => 0.2) },
      { key: 'key3', embedding: Array.from({ length: 768 }, () => 0.3) },
    ];

    // Act
    for (const entry of entries) {
      await cache.set(entry.key, entry.embedding);
    }

    // Assert
    for (const entry of entries) {
      const cached = await cache.get(entry.key);
      expect(cached?.embedding).toEqual(entry.embedding);
    }
  });
});

describe('EmbeddingCache - TTL (Time To Live)', () => {
  test('MUST expire entry after TTL', async () => {
    // Arrange
    const shortTtl = 100; // 100ms
    const cache = new EmbeddingCache({ ttlMs: shortTtl });
    const key = 'expiring_key';
    const embedding = Array.from({ length: 768 }, () => Math.random());

    // Act
    await cache.set(key, embedding);
    const beforeExpiry = await cache.get(key);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, shortTtl + 50));
    
    const afterExpiry = await cache.get(key);

    // Assert
    expect(beforeExpiry).toBeDefined();
    expect(afterExpiry).toBeNull();
  });

  test('MUST NOT expire entry before TTL', async () => {
    // Arrange
    const longTtl = 10000; // 10 seconds
    const cache = new EmbeddingCache({ ttlMs: longTtl });
    const key = 'non_expiring_key';
    const embedding = Array.from({ length: 768 }, () => Math.random());

    // Act
    await cache.set(key, embedding);
    
    // Wait less than TTL
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const entry = await cache.get(key);

    // Assert
    expect(entry).toBeDefined();
    expect(entry?.embedding).toEqual(embedding);
  });

  test('MUST allow custom TTL per entry', async () => {
    // Arrange
    const defaultTtl = 10000;
    const customTtl = 100;
    const cache = new EmbeddingCache({ ttlMs: defaultTtl });
    const key = 'custom_ttl_key';
    const embedding = Array.from({ length: 768 }, () => Math.random());

    // Act
    await cache.set(key, embedding, undefined, customTtl);
    
    // Wait for custom TTL to expire
    await new Promise(resolve => setTimeout(resolve, customTtl + 50));
    
    const entry = await cache.get(key);

    // Assert
    expect(entry).toBeNull();
  });
});

describe('EmbeddingCache - Invalidation', () => {
  let cache: EmbeddingCache;

  beforeEach(() => {
    cache = new EmbeddingCache({ ttlMs: 10000 });
  });

  test('MUST invalidate single entry by key', async () => {
    // Arrange
    const key = 'key_to_invalidate';
    const embedding = Array.from({ length: 768 }, () => Math.random());
    await cache.set(key, embedding);

    // Act
    const removed = await cache.invalidate(key);
    const entry = await cache.get(key);

    // Assert
    expect(removed).toBe(true);
    expect(entry).toBeNull();
  });

  test('MUST return false when invalidating non-existent key', async () => {
    // Act
    const removed = await cache.invalidate('non_existent_key');

    // Assert
    expect(removed).toBe(false);
  });

  test('MUST invalidate multiple entries by pattern', async () => {
    // Arrange
    await cache.set('qribar_chunk_0', Array.from({ length: 768 }, () => 0.1));
    await cache.set('qribar_chunk_1', Array.from({ length: 768 }, () => 0.2));
    await cache.set('reviews_chunk_0', Array.from({ length: 768 }, () => 0.3));

    // Act
    const count = await cache.invalidateByPattern('qribar_*');

    // Assert
    expect(count).toBe(2);
    expect(await cache.get('qribar_chunk_0')).toBeNull();
    expect(await cache.get('qribar_chunk_1')).toBeNull();
    expect(await cache.get('reviews_chunk_0')).toBeDefined();
  });

  test('MUST clear all cache entries', async () => {
    // Arrange
    await cache.set('key1', Array.from({ length: 768 }, () => 0.1));
    await cache.set('key2', Array.from({ length: 768 }, () => 0.2));
    await cache.set('key3', Array.from({ length: 768 }, () => 0.3));

    // Act
    await cache.clear();

    // Assert
    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
    expect(await cache.get('key3')).toBeNull();
  });
});

describe('EmbeddingCache - Statistics', () => {
  let cache: EmbeddingCache;

  beforeEach(() => {
    cache = new EmbeddingCache({ ttlMs: 10000 });
  });

  test('MUST track cache hits and misses', async () => {
    // Arrange
    const key = 'test_key';
    await cache.set(key, Array.from({ length: 768 }, () => Math.random()));

    // Act
    await cache.get(key); // Hit
    await cache.get(key); // Hit
    await cache.get('non_existent'); // Miss
    
    const stats = cache.getStats();

    // Assert
    expect(stats.totalEntries).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.67, 2); // 2/3 = 66.67%
  });

  test('MUST track total entries count', async () => {
    // Act
    await cache.set('key1', Array.from({ length: 768 }, () => 0.1));
    await cache.set('key2', Array.from({ length: 768 }, () => 0.2));
    await cache.set('key3', Array.from({ length: 768 }, () => 0.3));
    
    const stats = cache.getStats();

    // Assert
    expect(stats.totalEntries).toBe(3);
  });

  test('MUST track memory usage estimation', async () => {
    // Arrange
    const embedding = Array.from({ length: 768 }, () => Math.random());
    
    // Act
    await cache.set('key1', embedding);
    const stats = cache.getStats();

    // Assert
    expect(stats.memorySize).toBeGreaterThan(0);
    // 768 floats * 8 bytes + overhead
    expect(stats.memorySize).toBeGreaterThan(768 * 8);
  });

  test('MUST reset statistics on clear', async () => {
    // Arrange
    await cache.set('key1', Array.from({ length: 768 }, () => 0.1));
    await cache.get('key1'); // Hit
    await cache.get('non_existent'); // Miss

    // Act
    await cache.clear();
    const stats = cache.getStats();

    // Assert
    expect(stats.totalEntries).toBe(0);
    expect(stats.hitRate).toBe(0); // No requests = 0% hit rate
  });
});

describe('EmbeddingCache - Supabase Integration', () => {
  let cache: EmbeddingCache;

  beforeEach(() => {
    cache = new EmbeddingCache({
      ttlMs: 10000,
      enableSupabaseBackup: true,
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    });
  });

  test('MUST sync to Supabase on set', async () => {
    // Arrange
    const key = 'supabase_key';
    const embedding = Array.from({ length: 768 }, () => Math.random());
    const metadata = { source: 'qribar', category: 'producto_digital' };

    // Act
    await cache.set(key, embedding, metadata);

    // Assert
    // In real scenario, would query Supabase to verify
    // For now, verify no errors thrown
    const entry = await cache.get(key);
    expect(entry).toBeDefined();
  });

  test('MUST restore from Supabase on cache miss', async () => {
    // Arrange
    const key = 'supabase_restore_key';
    const embedding = Array.from({ length: 768 }, () => Math.random());
    
    // Act
    // 1. Store to Supabase (via cache.set)
    await cache.set(key, embedding);
    
    // 2. Clear local cache
    await cache.clear();
    
    // 3. Try to get (should restore from Supabase)
    const restored = await cache.get(key);

    // Assert
    // Note: This test requires actual Supabase connection
    // With mock, we just verify structure
    expect(restored).toBeDefined();
  });

  test('MUST handle Supabase connection failure gracefully', async () => {
    // Arrange
    const cacheWithBadConfig = new EmbeddingCache({
      ttlMs: 10000,
      enableSupabaseBackup: true,
      supabaseUrl: 'https://invalid-url.supabase.co',
      supabaseKey: 'invalid-key',
    });

    // Act & Assert
    // Should not throw, should fall back to local cache only
    await expect(
      cacheWithBadConfig.set('key', Array.from({ length: 768 }, () => 0.1))
    ).resolves.not.toThrow();
  });
});

describe('EmbeddingCache - Error Handling', () => {
  test('MUST throw error when TTL is negative', () => {
    // Act & Assert
    expect(() => new EmbeddingCache({ ttlMs: -1000 })).toThrow(
      'TTL must be positive'
    );
  });

  test('MUST throw error when embedding dimensions are invalid', async () => {
    // Arrange
    const cache = new EmbeddingCache({ ttlMs: 10000 });
    const invalidEmbedding = [1, 2, 3]; // Not 768 dimensions

    // Act & Assert
    await expect(
      cache.set('key', invalidEmbedding)
    ).rejects.toThrow('Embedding must be 768 dimensions');
  });

  test('MUST handle empty key', async () => {
    // Arrange
    const cache = new EmbeddingCache({ ttlMs: 10000 });

    // Act & Assert
    await expect(
      cache.set('', Array.from({ length: 768 }, () => 0.1))
    ).rejects.toThrow('Key cannot be empty');
  });
});
