// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { generateWithFailover, MODEL_NAME_REGEX } from '../_shared/generate.ts'
import { buildSystemInstruction } from '../_shared/prompt.ts'

// Generation timeout + backup-model failover (design D1/D2). Env swap = no
// redeploy; defaults verified available via ListModels for the current key.
const DEFAULT_PRIMARY_MODEL = 'gemini-3.1-flash-lite'
const DEFAULT_BACKUP_MODEL = 'gemini-3.5-flash-lite'
const TOTAL_REQUEST_DEADLINE_MS = 20_000

function resolveModel(envValue: string | undefined, fallback: string): string {
  if (envValue && MODEL_NAME_REGEX.test(envValue)) return envValue
  if (envValue) console.error('[RAG] Ignoring invalid model name from env:', envValue)
  return fallback
}

const ALLOWED_ORIGINS = [
  'https://digitalizatenerife.es',
  'http://localhost:5173',
  'http://localhost:3000',
]

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      ...SECURITY_HEADERS,
    }
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    ...SECURITY_HEADERS,
  }
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
// RATE LIMITER (in-memory, per isolate — best-effort defence in depth)
// The function is reachable without a session (anonymous chatbot users), so
// CORS alone does not stop non-browser clients from spending the Gemini quota.
// Same pattern as gemini-generate. Generous enough for normal conversations.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getClientKey(req: Request): string {
  const forwarded = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || ''
  return forwarded.split(',')[0].trim() || 'unknown'
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) rateLimitMap.delete(k)
    }
    if (rateLimitMap.size > 1000) rateLimitMap.clear()
  }
  let entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitMap.set(key, entry)
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true, retryAfter: 0 }
}

// ============================================================================
// MAIN HANDLER
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const startTime = Date.now()

  const rateLimit = checkRateLimit(getClientKey(req))
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  try {
    // 2️⃣ PARSE REQUEST (must be first to catch body parsing errors)
    const { query, conversationHistory, topK, threshold, source } = await parseRequest(req)

    // 1️⃣ AUTHENTICATION
    const { supabase, user } = await authenticateRequest(req)
 
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('Missing GEMINI_API_KEY')

    // 3️⃣ GENERATE QUERY EMBEDDING (with cache)
    const { queryEmbedding, cacheHit, embeddingTime } = await getQueryEmbedding(query, cache, geminiKey)

    // 4️⃣ VECTOR SIMILARITY SEARCH
    const searchStartTime = Date.now()
    
    // Pass embedding as array directly (Supabase RPC handles JSON arrays)
    let searchResults = []
    let searchError = null
    
    if (source) {
      const result = await supabase.rpc('match_documents_by_source', {
        query_embedding: queryEmbedding,
        source_filter: source,
        match_threshold: threshold,
        match_count: topK
      })
      searchResults = result.data || []
      searchError = result.error
    } else {
      const result = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK
      })
      searchResults = result.data || []
      searchError = result.error
    }
    
    if (searchError) throw new Error(`Vector search failed: ${searchError.message}`)
    const searchTime = Date.now() - searchStartTime

    // 5️⃣ BUILD SYSTEM INSTRUCTION (grounding + redirect rules, design D6)
    // Zero documents is NOT a dead end: the instruction still lets the model
    // answer greetings/small talk and redirects genuine unknowns to the CTA.
    const systemInstruction = buildSystemInstruction({ documents: searchResults || [] })

    // 6️⃣ GENERATE RESPONSE WITH GEMINI (primary + backup-model failover)
    const generateStartTime = Date.now()
    const contents = [
      ...conversationHistory.map(c => ({
        role: (c.role === 'user' || c.role === 'model') ? c.role : 'user',
        parts: Array.isArray(c.parts) ? c.parts : [{ text: String(c.parts) }]
      })),
      { role: 'user', parts: [{ text: query }] }
    ]

    const primaryModel = resolveModel(Deno.env.get('GEMINI_PRIMARY_MODEL'), DEFAULT_PRIMARY_MODEL)
    const backupModel = resolveModel(Deno.env.get('GEMINI_BACKUP_MODEL'), DEFAULT_BACKUP_MODEL)
    const remainingDeadlineMs = TOTAL_REQUEST_DEADLINE_MS - (Date.now() - startTime)

    const generation = await generateWithFailover({
      models: [primaryModel, backupModel],
      apiKey: geminiKey,
      request: { contents, systemInstruction },
      fetchFn: fetch,
      now: () => Date.now(),
      deadlineMs: remainingDeadlineMs,
    })

    if (!generation.ok) {
      console.error('[RAG] Generation failed on both models:', JSON.stringify(generation.attempts))
      return new Response(
        JSON.stringify({ error: 'generation_unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const generatedText = generation.text
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
          modelUsed: generation.modelUsed,
          timings: { embedding: embeddingTime, search: searchTime, generation: generateTime, total: totalTime }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    if (err instanceof Response) return err
    console.error('[RAG] Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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
  if (!user || error) {
    // Stale/invalid session (e.g. an expired token still stored in the browser, or
    // the public API key sent as Bearer): do NOT reuse the client that carries the
    // bad Authorization header — PostgREST would reject every RPC with a 401 and the
    // chatbot would answer 500. Fall back to a header-less (anonymous) client.
    const anonSupabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    return { supabase: anonSupabase, user: { id: 'anonymous', role: 'anonymous' } }
  }

  const role = user.role === 'anon' ? 'anonymous' : user.role
  return { supabase, user: { ...user, role } }
}

async function parseRequest(req) {
  try {
    const body = await req.json()
    const { query, conversationHistory = [], source = null } = body
    // Clamp client-controlled search parameters (defaults unchanged: 5 / 0.4)
    const topK = Math.min(Math.max(Math.trunc(Number(body.topK ?? 5)) || 5, 1), 10)
    const rawThreshold = Number(body.threshold ?? 0.4)
    const threshold = Number.isFinite(rawThreshold) ? Math.min(Math.max(rawThreshold, 0), 1) : 0.4
    if (!query || typeof query !== 'string') {
      throw new Error('Missing or invalid "query"')
    }
    if (query.length > 2000) {
      throw new Error('Query too long (max 2000 characters)')
    }
    if (conversationHistory.length > 20) {
      throw new Error('Conversation history too long (max 20 messages)')
    }
    return { query, conversationHistory, topK, threshold, source }
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid JSON body')
    }
    throw err
  }
}

async function getQueryEmbedding(query: string, cache: EmbeddingCache, geminiKey: string) {
  const startTime = Date.now()
  const cacheKey = `emb:${hashString(query)}`

  let queryEmbedding = await cache.get(cacheKey)
  let cacheHit = Array.isArray(queryEmbedding) && queryEmbedding.length > 0

  if (cacheHit) {
    // Using cached embedding
  } else {
    const embResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey }, body: JSON.stringify({ content: { parts: [{ text: query }] } }) }
    )
    const embData = await embResponse.json()
    if (!embResponse.ok || !Array.isArray(embData.embedding?.values) || embData.embedding.values.length === 0) {
      // Log Gemini's status/message (never the API key or the user's text) so failures are diagnosable.
      console.error('[RAG] Embedding failed: status', embResponse.status, 'queryLength', query.length, 'error', JSON.stringify(embData?.error ?? null).slice(0, 300))
      throw new Error('Embedding generation failed')
    }
    queryEmbedding = embData.embedding.values.slice(0, 768)
    await cache.set(cacheKey, queryEmbedding)
    cacheHit = false
  }

  return { queryEmbedding, cacheHit, embeddingTime: Date.now() - startTime }
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
