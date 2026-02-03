/**
 * Embedding Cache para RAG System
 * 
 * Clean Architecture: Data Layer
 * 
 * Responsabilidad:
 * - Cachear embeddings generados para evitar regeneración
 * - Gestionar TTL (Time To Live) de 7 días
 * - Sincronizar con Supabase como backup
 * - Invalidación manual y por patrón
 * - Estadísticas de cache (hits, misses, hit rate)
 * 
 * Fase 2 de optimización según ADR-006
 * docs/adr/006-rag-architecture-decision.md
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CacheEntry {
  key: string;
  embedding: number[];
  timestamp: number;
  metadata?: Record<string, any>;
  ttl?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsageBytes: number;
}

export interface EmbeddingCacheConfig {
  ttlMs: number;
  enableSupabaseBackup?: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class EmbeddingCache {
  private readonly cache: Map<string, CacheEntry>;
  private readonly ttlMs: number;
  private stats: {
    hits: number;
    misses: number;
  };
  private supabaseClient?: SupabaseClient;
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
      return entry;
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
    metadata?: Record<string, any>,
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

    const entry: CacheEntry = {
      key,
      embedding,
      timestamp: Date.now(),
      metadata,
      ttl: customTtl,
    };

    // Store in local cache
    this.cache.set(key, entry);

    // Sync to Supabase if enabled
    if (this.enableSupabaseBackup) {
      await this._syncToSupabase(entry);
    }
  }

  /**
   * Invalidate single cache entry
   * 
   * @param key Cache key to invalidate
   * @returns true if entry was removed, false if not found
   */
  async invalidate(key: string): Promise<boolean> {
    const existed = this.cache.has(key);
    this.cache.delete(key);

    // Delete from Supabase if enabled
    if (this.enableSupabaseBackup && existed) {
      await this._deleteFromSupabase(key);
    }

    return existed;
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
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    // Calculate memory usage (approximate)
    let memoryUsageBytes = 0;
    for (const entry of this.cache.values()) {
      // 768 floats * 8 bytes + key + metadata overhead
      memoryUsageBytes += 768 * 8 + entry.key.length * 2;
      if (entry.metadata) {
        memoryUsageBytes += JSON.stringify(entry.metadata).length * 2;
      }
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalEntries: this.cache.size,
      memoryUsageBytes,
    };
  }

  /**
   * Convert glob pattern to regex
   */
  private _globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Sync entry to Supabase
   */
  private async _syncToSupabase(entry: CacheEntry): Promise<void> {
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
      const entry: CacheEntry = {
        key: data.key,
        embedding: data.embedding,
        timestamp: data.timestamp,
        metadata: data.metadata,
        ttl: data.ttl,
      };

      this.cache.set(key, entry);
      return entry;
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
