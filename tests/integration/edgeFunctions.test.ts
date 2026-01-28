// ========================================
// INTEGRATION TEST: Supabase Edge Functions
// ========================================
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

describe('Edge Functions Integration', () => {
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('gemini-embedding', () => {
    it('should generate embeddings for text', async () => {
      const { data, error } = await supabase.functions.invoke('gemini-embedding', {
        body: { text: 'Test embedding generation' }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('embedding');
      expect(data.embedding).toHaveProperty('values');
      expect(data.embedding.values).toHaveLength(768);
    }, 10000);

    it('should handle empty text', async () => {
      const { data, error } = await supabase.functions.invoke('gemini-embedding', {
        body: { text: '' }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('embedding');
    }, 10000);
  });

  describe('gemini-generate', () => {
    it('should generate response with proper format', async () => {
      const { data, error } = await supabase.functions.invoke('gemini-generate', {
        body: {
          contents: [
            { role: 'user', parts: [{ text: '¿Qué es SmartConnect AI?' }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('candidates');
      expect(data.candidates[0]).toHaveProperty('content');
    }, 15000);

    it('should respect generation config', async () => {
      const { data, error } = await supabase.functions.invoke('gemini-generate', {
        body: {
          contents: [
            { role: 'user', parts: [{ text: 'Responde con una palabra' }] }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('candidates');
    }, 15000);
  });

  describe('match_documents RPC', () => {
    it('should find similar documents', async () => {
      // First generate an embedding
      const { data: embeddingData } = await supabase.functions.invoke('gemini-embedding', {
        body: { text: '¿Cuánto cuesta QRIBAR?' }
      });

      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embeddingData.embedding.values,
        match_threshold: 0.3,
        match_count: 3
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('content');
        expect(data[0]).toHaveProperty('similarity');
      }
    }, 15000);
  });
});
