/**
 * Embedding Cache para RAG System
 * 
 * Clean Architecture: Data Layer (Implementation)
 * 
 * Responsabilidad:
 * - Cachear embeddings generados para evitar regeneración
 * - Gestionar TTL (Time To Live) de 7 días
 * - Sincronizar con Supabase como backup
 * - Invalidación manual y por patrón
 * - Estadísticas de cache (hits, misses, hit rate)
 * 
 * Fase 2 de optimización según ADR-003
 * docs/adr/006-rag-architecture-decision.md
 */

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { supabase } from '../../../shared/supabaseClient';
import { 
  IEmbeddingCache, 
  CacheEntry as ICacheEntry,
  CacheStats as ICacheStats
} from '../domain/interfaces/IEmbeddingCache';

// Internal cache entry with expiration tracking
interface InternalCacheEntry {
  key: string;
  embedding: number[];
  timestamp: number;
  expiresAt: number;
  metadata?: Record<string, unknown>;
  ttl?: number;
}

// Re-export interface types
export type CacheEntry = ICacheEntry;
export type CacheStats = ICacheStats;

export interface EmbeddingCacheConfig {
  ttlMs: number;
  enableSupabaseBackup?: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class EmbeddingCache implements IEmbeddingCache {
  private readonly cache: Map<string, InternalCacheEntry>;
  private readonly ttlMs: number;
  private stats: {
    hits: number;
    misses: number;
  };
  private readonly supabaseClient: SupabaseClient = supabase;
  private readonly enableSupabaseBackup: boolean;

  constructor(config: EmbeddingCacheConfig) {
    // Validate TTL
    if (config.ttlMs <= 0) {
      throw new Error('TTL must be positive');
    }

    this.cache = new Map();
    this.ttlMs = config.ttlMs;
    this.stats = { hits: 0, misses: 0 };
    this.enableSupabaseBackup = config.enableSupabaseBackup ?? false;

    // Initialize Supabase client if backup enabled
    if (this.enableSupabaseBackup && config.supabaseUrl && config.supabaseKey) {
      try {
        this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
      } catch (error) {
        console.warn('Failed to initialize Supabase client:', error);
        // Continue without Supabase backup
      }
    }
  }

  /**
   * Get embedding from cache
   * 
   * @param key Cache key
   * @returns CacheEntry if found and not expired, null otherwise
   */
  async get(key: string): Promise<CacheEntry | null> {
    // Check local cache first
    const entry = this.cache.get(key);

    if (entry) {
      // Check if expired
      const now = Date.now();
      const entryTtl = entry.ttl ?? this.ttlMs;
      const isExpired = now - entry.timestamp > entryTtl;

      if (isExpired) {
        // Remove expired entry
        this.cache.delete(key);
        this.stats.misses++;
        
        // Try to restore from Supabase
        if (this.enableSupabaseBackup) {
          return await this._restoreFromSupabase(key);
        }
        
        return null;
      }

      // Cache hit
      this.stats.hits++;
      return {
        key: entry.key,
        embedding: entry.embedding,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        metadata: entry.metadata,
      };
    }

    // Cache miss - try Supabase
    this.stats.misses++;
    
    if (this.enableSupabaseBackup) {
      return await this._restoreFromSupabase(key);
    }

    return null;
  }

  /**
   * Set embedding in cache
   * 
   * @param key Cache key
   * @param embedding 768-dimensional vector
   * @param metadata Optional metadata
   * @param customTtl Optional custom TTL for this entry
   */
  async set(
    key: string,
    embedding: number[],
    metadata?: Record<string, unknown>,
    customTtl?: number
  ): Promise<void> {
    // Validate key
    if (!key || key.trim() === '') {
      throw new Error('Key cannot be empty');
    }

    // Validate embedding dimensions
    if (embedding.length !== 768) {
      throw new Error('Embedding must be 768 dimensions');
    }

    const now = Date.now();
    const ttl = customTtl ?? this.ttlMs;
    const entry: InternalCacheEntry = {
      key,
      embedding,
      timestamp: now,
      expiresAt: now + ttl,
      metadata,
      ttl,
    };

    // Store in local cache
    this.cache.set(key, entry);

    // Sync to Supabase if enabled
    if (this.enableSupabaseBackup) {
      await this._syncToSupabase(entry);
    }
  }

  /**
   * Invalidate cache entries by key or pattern
   *
   * @param keyPattern Cache key or glob pattern
   * @returns true if any entry was invalidated
   */
  async invalidate(keyPattern: string): Promise<boolean> {
    // If exact key exists, invalidate it
    if (this.cache.has(keyPattern)) {
      this.cache.delete(keyPattern);
      if (this.enableSupabaseBackup) {
        await this._deleteFromSupabase(keyPattern);
      }
      return true;
    }

    // Otherwise, treat as glob pattern
    const regex = this._globToRegex(keyPattern);
    let found = false;
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.cache.delete(key);
      if (this.enableSupabaseBackup) {
        await this._deleteFromSupabase(key);
      }
      found = true;
    }
    return found;
  }

  /**
   * Delete entry from cache (IEmbeddingCache interface method)
   * 
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    await this.invalidate(key);
  }

  /**
   * Check if cache has entry (IEmbeddingCache interface method)
   * 
   * @param key Cache key
   * @returns true if entry exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  /**
   * Invalidate multiple entries by pattern
   * 
   * @param pattern Glob pattern (e.g., 'qribar_*')
   * @returns Number of entries invalidated
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = this._globToRegex(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        await this.invalidate(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };

    // Clear Supabase table if enabled
    if (this.enableSupabaseBackup) {
      await this._clearSupabase();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): ICacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    // Calculate memory usage and timestamps
    let memorySize = 0;
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;
    
    for (const entry of this.cache.values()) {
      // 768 floats * 8 bytes + key + metadata overhead
      memorySize += 768 * 8 + entry.key.length * 2;
      if (entry.metadata) {
        memorySize += JSON.stringify(entry.metadata).length * 2;
      }
      
      // Track oldest and newest
      if (oldestEntry === null || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (newestEntry === null || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    return {
      totalEntries: this.cache.size,
      hitRate,
      memorySize,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Convert glob pattern to regex
   */
  private _globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replaceAll('.', String.raw`\.`)
      .replaceAll('*', '.*')
      .replaceAll('?', '.');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Sync entry to Supabase
   */
  private async _syncToSupabase(entry: InternalCacheEntry): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient
        .from('embedding_cache')
        .upsert({
          key: entry.key,
          embedding: entry.embedding,
          timestamp: entry.timestamp,
          metadata: entry.metadata,
          ttl: entry.ttl,
        }, {
          onConflict: 'key', // Specify unique column for upsert
        });
    } catch (error) {
      console.warn('Failed to sync to Supabase:', error);
      // Continue without Supabase - local cache still works
    }
  }

  /**
   * Restore entry from Supabase
   */
  private async _restoreFromSupabase(key: string): Promise<CacheEntry | null> {
    if (!this.supabaseClient) return null;

    try {
      const { data, error } = await this.supabaseClient
        .from('embedding_cache')
        .select('*')
        .eq('key', key)
        .single();

      if (error || !data) return null;

      // Check if Supabase entry is expired
      const now = Date.now();
      const entryTtl = data.ttl ?? this.ttlMs;
      const isExpired = now - data.timestamp > entryTtl;

      if (isExpired) {
        // Delete expired entry from Supabase
        await this._deleteFromSupabase(key);
        return null;
      }

      // Restore to local cache
      const ttl = data.ttl ?? this.ttlMs;
      const entry: InternalCacheEntry = {
        key: data.key,
        embedding: data.embedding,
        timestamp: data.timestamp,
        expiresAt: data.timestamp + ttl,
        metadata: data.metadata as Record<string, unknown> | undefined,
        ttl,
      };

      this.cache.set(key, entry);
      return {
        key: entry.key,
        embedding: entry.embedding,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        metadata: entry.metadata,
      };
    } catch (error) {
      console.warn('Failed to restore from Supabase:', error);
      return null;
    }
  }

  /**
   * Delete entry from Supabase
   */
  private async _deleteFromSupabase(key: string): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient
        .from('embedding_cache')
        .delete()
        .eq('key', key);
    } catch (error) {
      console.warn('Failed to delete from Supabase:', error);
    }
  }

  /**
   * Clear all entries from Supabase
   */
  private async _clearSupabase(): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient
        .from('embedding_cache')
        .delete()
        .neq('key', ''); // Delete all
    } catch (error) {
      console.warn('Failed to clear Supabase:', error);
    }
  }
}
