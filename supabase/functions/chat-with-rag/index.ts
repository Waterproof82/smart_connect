// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// GLOBAL CACHE (persistente entre requests)
class EmbeddingCache {
  private cache: Map<string, { embedding: number[]; timestamp: number }> = new Map()
  private readonly TTL = 3600000 // 1 hora

  async get(key: string): Promise<number[] | null> {
    const cached = this.cache.get(key)
    if (!cached) return null
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    return cached.embedding
  }

  async set(key: string, embedding: number[]): Promise<void> {
    this.cache.set(key, { embedding, timestamp: Date.now() })
    if (this.cache.size > 1000) {
      const now = Date.now()
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.TTL) this.cache.delete(k)
      }
    }
  }
}

const cache = new EmbeddingCache()

// ============================================================================
// MAIN HANDLER
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const startTime = Date.now()

  try {
    // 1️⃣ AUTHENTICATION
    const { supabase, user } = await authenticateRequest(req)

    // 2️⃣ PARSE REQUEST
    const { query, conversationHistory, topK, threshold, source } = await parseRequest(req)

    console.log(`[RAG] User ${user.id} query: "${query.substring(0, 100)}..."`)

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('Missing GEMINI_API_KEY')

    // 3️⃣ GENERATE QUERY EMBEDDING (with cache)
    const { queryEmbedding, cacheHit, embeddingTime } = await getQueryEmbedding(query, cache, geminiKey)

    // 4️⃣ VECTOR SIMILARITY SEARCH
    const searchStartTime = Date.now()
    const { data: searchResults, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      filter_source: source
    })
    if (searchError) throw new Error(`Vector search failed: ${searchError.message}`)
    const searchTime = Date.now() - searchStartTime
    console.log(`[RAG] Found ${searchResults?.length || 0} relevant documents (${searchTime}ms)`)

    // 5️⃣ CONSTRUCT PROMPT WITH RAG CONTEXT
    let prompt
    if (searchResults && searchResults.length > 0) {
      const contextBlocks = searchResults
        .map((doc, idx) => `[Documento ${idx + 1} - Relevancia: ${(doc.similarity * 100).toFixed(1)}%]\nFuente: ${doc.source || 'Desconocida'}\nContenido: ${doc.content}\n`)
        .join('\n---\n\n')
      prompt = `Eres un asistente que responde preguntas basándose ÚNICAMENTE en el contexto proporcionado.\n\nREGLAS IMPORTANTES:\n1. Responde SOLO con información del contexto\n2. Si el contexto no contiene la respuesta, di "No tengo información sobre eso en mi base de conocimiento"\n3. Sé conciso, directo y preciso\n4. NO inventes información que no esté en el contexto\n\nCONTEXTO:\n${contextBlocks}\n\n---\n\nPREGUNTA DEL USUARIO:\n${query}\n\nRESPUESTA:`
    } else {
      return new Response(
        JSON.stringify({ 
          response: `No encontré información relevante en mi base de conocimiento para: "${query}"`,
          metadata: { documentsFound: 0, cacheHit, timings: { embedding: embeddingTime, search: 0, total: Date.now() - startTime } }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6️⃣ GENERATE RESPONSE WITH GEMINI
    const generateStartTime = Date.now()
    const contents = [
      ...conversationHistory.map(c => ({
        role: (c.role === 'user' || c.role === 'model') ? c.role : 'user',
        parts: Array.isArray(c.parts) ? c.parts : [{ text: String(c.parts) }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ]
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 2048 } })
      }
    )
    const geminiData = await geminiResponse.json()
    if (!geminiResponse.ok || !geminiData.candidates?.[0]?.content) {
      console.error('[RAG] Gemini error:', geminiData)
      throw new Error(`Response generation failed: ${geminiData.error?.message || 'Unknown error'}`)
    }
    const generatedText = geminiData.candidates[0].content.parts.map(p => p.text).join('')
    const generateTime = Date.now() - generateStartTime
    const totalTime = Date.now() - startTime

    // 7️⃣ RETURN RESPONSE
    return new Response(
      JSON.stringify({
        response: generatedText,
        metadata: {
          documentsFound: searchResults.length,
          sources: searchResults.map(d => ({ source: d.source, similarity: d.similarity })),
          cacheHit,
          timings: { embedding: embeddingTime, search: searchTime, generation: generateTime, total: totalTime }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    if (err instanceof Response) return err
    console.error('[RAG] Error:', err)
    return new Response(JSON.stringify({ error: err?.message || String(err), stack: err?.stack }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

// ============================================================================
// HELPERS
// ============================================================================

async function authenticateRequest(req) {
  const authHeader = req.headers.get('Authorization')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined)

  if (!authHeader) return { supabase, user: { id: 'anonymous', role: 'anonymous' } }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) return { supabase, user: { id: 'anonymous', role: 'anonymous' } }

  const role = user.role === 'anon' ? 'anonymous' : user.role
  return { supabase, user: { ...user, role } }
}

async function parseRequest(req) {
  const body = await req.json()
  const { query, conversationHistory = [], topK = 5, threshold = 0.7, source = null } = body
  if (!query || typeof query !== 'string') returnError(400, 'Missing or invalid "query"')
  return { query, conversationHistory, topK, threshold, source }
}

async function getQueryEmbedding(query: string, cache: EmbeddingCache, geminiKey: string) {
  const startTime = Date.now()
  const cacheKey = `emb:${hashString(query)}`

  let queryEmbedding = await cache.get(cacheKey)
  let cacheHit = Array.isArray(queryEmbedding) && queryEmbedding.length > 0

  if (cacheHit) {
    console.log('[RAG] Cache hit - using cached embedding')
  } else {
    console.log('[RAG] Cache miss - generating embedding')
    const embResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: { parts: [{ text: query }] } }) }
    )
    const embData = await embResponse.json()
    if (!embResponse.ok || !Array.isArray(embData.embedding?.values) || embData.embedding.values.length === 0) throw new Error('Embedding generation failed')
    queryEmbedding = embData.embedding.values.slice(0, 768)
    await cache.set(cacheKey, queryEmbedding)
    cacheHit = false
  }

  return { queryEmbedding, cacheHit, embeddingTime: Date.now() - startTime }
}

function returnError(status, message) {
  throw new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i) ?? 0
    hash = ((hash << 5) - hash) + codePoint
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
