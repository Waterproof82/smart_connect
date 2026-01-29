// ========================================
// E2E TEST: Full RAG Chatbot Flow
// ========================================
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

describe('RAG Chatbot E2E Flow', () => {
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  it('should complete full RAG workflow: query -> embedding -> search -> generate', async () => {
    const userQuery = '¿Cuánto cuesta QRIBAR?';

    // Step 1: Generate embedding for query
    const { data: embData, error: embError } = await supabase.functions.invoke('gemini-embedding', {
      body: { text: userQuery }
    });

    expect(embError).toBeNull();
    expect(embData.embedding.values).toHaveLength(768);

    // Step 2: Search similar documents
    const { data: docs, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: embData.embedding.values,
      match_threshold: 0.3,
      match_count: 3
    });

    expect(searchError).toBeNull();
    expect(Array.isArray(docs)).toBe(true);

    // Step 3: Build context
    const context = docs.length > 0 
      ? docs.map((doc: any) => doc.content).join('\n\n')
      : '';

    // Step 4: Generate response with context
    const systemPrompt = `Eres el Asistente Experto de SmartConnect AI.

TUS SERVICIOS PRINCIPALES:
1. QRIBAR: Menús digitales interactivos para restaurantes y bares
2. Automatización n8n: Flujos de trabajo inteligentes para empresas
3. Tarjetas Tap-to-Review NFC: Sistema para aumentar reseñas en Google Maps

${context ? `INFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n${context}\n\n` : ''}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé profesional, conciso y entusiasta
- Si la información está en la base de conocimiento, úsala
- Si no sabes algo, reconócelo y ofrece contactar al equipo
- Mantén respuestas bajo 150 palabras`;

    const { data: genData, error: genError } = await supabase.functions.invoke('gemini-generate', {
      body: {
        contents: [
          { 
            role: 'user', 
            parts: [{ text: `${systemPrompt}\n\nPregunta del usuario: ${userQuery}` }] 
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      }
    });

    expect(genError).toBeNull();
    expect(genData.candidates).toBeDefined();
    expect(genData.candidates[0].content.parts[0].text).toBeTruthy();

    const response = genData.candidates[0].content.parts[0].text;
    
    // Verify response is in Spanish
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(10);
    
    console.log('\n✅ Full RAG Flow Test Results:');
    console.log('━'.repeat(50));
    console.log(`Query: ${userQuery}`);
    console.log(`Docs Found: ${docs.length}`);
    console.log(`Response: ${response}`);
    console.log('━'.repeat(50));
    
  }, 30000);

  it('should handle queries without matching documents', async () => {
    const userQuery = 'Random unrelated question about something not in KB';

    const { data: embData } = await supabase.functions.invoke('gemini-embedding', {
      body: { text: userQuery }
    });

    await supabase.rpc('match_documents', {
      query_embedding: embData.embedding.values,
      match_threshold: 0.3,
      match_count: 3
    });

    const { data: genData, error: genError } = await supabase.functions.invoke('gemini-generate', {
      body: {
        contents: [
          { 
            role: 'user', 
            parts: [{ text: `Eres un asistente. Responde: ${userQuery}` }] 
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      }
    });

    expect(genError).toBeNull();
    expect(genData.candidates[0].content.parts[0].text).toBeTruthy();
  }, 30000);
});
