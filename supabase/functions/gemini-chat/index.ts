// ========================================
// SUPABASE EDGE FUNCTION - Gemini Chat with RAG
// ========================================
// Purpose: Secure chatbot endpoint with RAG (Retrieval Augmented Generation)
// Security: OWASP A02:2021 - Cryptographic Failures (API key protection)
// @ts-nocheck - Deno runtime types

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ========================================
// TYPES
// ========================================
interface ChatRequest {
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  maxDocuments?: number;
  similarityThreshold?: number;
  abTestGroup?: string; // 'A', 'B', 'C', etc.
  source?: string; // Nuevo: permite filtrar por source
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

// ========================================
// RATE LIMITER (In-Memory)
// ========================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  let userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    userLimit = { count: 0, resetAt: now + windowMs };
    rateLimitMap.set(userId, userLimit);
  }
  
  if (userLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: maxRequests - userLimit.count };
}

// ========================================
// EMBEDDING GENERATION
// ========================================
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Embedding API error:', errorText);
      throw new Error(`Embedding generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding?.values || [];
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

// ========================================
// RAG PROCESSING
// ========================================
async function processRAG(
  userQuery: string,
  supabase: any,
  geminiApiKey: string,
  similarityThreshold: number,
  maxDocuments: number
): Promise<{ queryEmbedding: number[]; documents: any[]; cacheHit: boolean }> {
  let queryEmbedding: number[] = [];
  let documents: any[] = [];
  let cacheHit = false;

  try {
    // Check cache first
    const cacheKey = `query:${userQuery}`;
    console.log('🔍 Checking embedding cache...');
    
    const { data: cachedEmbedding, error: cacheError } = await supabase
      .from('embedding_cache')
      .select('embedding, timestamp, ttl')
      .eq('key', cacheKey)
      .maybeSingle();
    
    if (cachedEmbedding && !cacheError) {
      const now = Date.now();
      const entryTtl = cachedEmbedding.ttl || (7 * 24 * 60 * 60 * 1000);
      const isExpired = now - cachedEmbedding.timestamp > entryTtl;
      
      if (!isExpired && Array.isArray(cachedEmbedding.embedding)) {
        queryEmbedding = cachedEmbedding.embedding;
        cacheHit = true;
        console.log('✅ Cache HIT - Using cached embedding');
      } else {
        console.log('⚠️ Cache MISS - Expired entry');
      }
    } else {
      console.log('⚠️ Cache MISS - No entry found');
    }
    
    // Generate embedding if not in cache
    if (!cacheHit) {
      console.log('🧠 Generating embedding...');
      queryEmbedding = await generateEmbedding(userQuery, geminiApiKey);
      console.log('✅ Embedding generated:', queryEmbedding.length, 'dimensions');
      
      // Store in cache (fire and forget)
      supabase
        .from('embedding_cache')
        .upsert({
          key: cacheKey,
          embedding: queryEmbedding,
          timestamp: Date.now(),
          ttl: 7 * 24 * 60 * 60 * 1000,
          metadata: { source: 'gemini-chat', query_length: userQuery.length }
        }, { onConflict: 'key' })
        .then(() => console.log('✅ Embedding cached'))
        .catch(err => console.warn('⚠️ Cache write failed:', err.message));
    }
    
    // Vector search
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    console.log('🔍 Searching documents...');
    
    const { data: searchResults, error: searchError } = await supabase
      .rpc('match_documents', {
        query_embedding: embeddingString,
        match_threshold: similarityThreshold,
        match_count: maxDocuments
      });

    if (searchError) {
      console.error('❌ Vector search error:', searchError);
    } else {
      documents = searchResults || [];
      console.log('✅ Found', documents.length, 'documents');
    }
  } catch (error) {
    console.error('❌ RAG processing error:', error);
  }

  return { queryEmbedding, documents, cacheHit };
}

// ========================================
// GEMINI API CALL
// ========================================
async function callGemini(
  systemPrompt: string,
  userQuery: string,
  geminiApiKey: string
): Promise<string> {
  console.log('🤖 Calling Gemini API...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Question: ${userQuery}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  console.log('✅ Gemini API responded');
  const data: GeminiResponse = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
}

// ========================================
// PROMPT VARIANTS
// ========================================
function getPromptVariant(
  abTestGroup: string,
  context: string,
  historyText: string
): { name: string; prompt: string } {
  const promptVariants = {
    'A': {
      name: 'Control - Standard Prompt',
      prompt: `You are an expert assistant for SmartConnect AI, a business accelerator agency specializing in:

**Core Products:**
- 🍽️ QRiBar: Digital menu system for restaurants with QR-based ordering
- ⭐ NFC Review Cards: Reputation management tools (like Tapstar) for Google Reviews & Instagram
- 🤖 Marketing Automation: Lead capture and nurturing with n8n workflows

**Business Model:** Agencia-Escuela approach
- Build real products for local businesses
- Focus on immediate value delivery
- Scale through automation and AI

Context from Knowledge Base:
${context}

Previous Conversation:
${historyText}

Guidelines:
- Be helpful, professional, and concise
- Reference the context when answering
- If the answer isn't in the context, use general knowledge but acknowledge the limitation
- For product inquiries, explain benefits and ROI
- For technical questions, provide clear, actionable guidance`
    },
    'B': {
      name: 'Concise - Direct & Actionable',
      prompt: `You are SmartConnect AI's expert assistant. Products: QRiBar (digital menus), NFC Review Cards (reputation), n8n automation.

Context: ${context}
History: ${historyText}

Rules:
- Maximum 80 words per response
- Start with direct answer
- Include pricing when known
- Use bullet points for options
- End with clear next step if applicable`
    },
    'C': {
      name: 'Conversational - Friendly & Detailed',
      prompt: `¡Hola! Soy tu asistente experto de SmartConnect AI. Somos una agencia-escuela que ayuda a negocios locales a crecer con tecnología.

**Nuestros productos estrella:**
🍽️ **QRiBar:** Cartas digitales con pedidos desde la mesa
⭐ **Tarjetas NFC Reseñas:** Más reviews en Google e Instagram  
🤖 **Automatización n8n:** Captación y nutrición de leads

Contexto disponible: ${context}
Conversación anterior: ${historyText}

Mi estilo:
- Tono cercano pero profesional
- Explico beneficios y ROI claramente
- Ofrezco ejemplos prácticos
- Respondo preguntas follow-up sin problema`
    }
  };

  return promptVariants[abTestGroup as keyof typeof promptVariants] || promptVariants['A'];
}

// ========================================
// FASE A: Extracción de etiquetas con LLM pequeño
async function extractMetadataTags(userQuery: string, geminiApiKey: string): Promise<string[]> {
  const prompt = `Extrae las etiquetas clave para filtrar documentos en una base de datos. Ejemplo:
Pregunta: "¿Qué precio tienen las copas?"
Respuesta: ["copas"]
Pregunta: "¿Qué platos hay en el menú?"
Respuesta: ["menú", "platos"]
Pregunta: "¿Qué opinan los clientes?"
Respuesta: ["reviews", "opiniones"]
Pregunta: "${userQuery}"
Respuesta:`;
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 32 }
      })
    }
  );
  if (!response.ok) return [];
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const tags = JSON.parse(text.replace(/'/g, '"'));
    return Array.isArray(tags) ? tags : [];
  } catch { return []; }
}

// ========================================
// MAIN HANDLER
// ========================================
Deno.serve(async (req) => {
  // CORS headers
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ===================================
    // SECURITY: Authorization Check (Accept anon key for public chatbot)
    // ===================================
    const authHeader = req.headers.get('Authorization');
    const apiKeyHeader = req.headers.get('apikey');
    
    console.log('🔐 Auth headers:', { 
      hasAuth: !!authHeader, 
      hasApiKey: !!apiKeyHeader 
    });
    
    if (!authHeader && !apiKeyHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization or apikey header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ===================================
    // PARSE REQUEST
    // ===================================
    const { 
      userQuery, 
      conversationHistory = [], 
      maxDocuments = 3, 
      similarityThreshold = 0.3,
      abTestGroup = 'A', // Default to control group
      source = undefined
    }: ChatRequest = await req.json();

    console.log('📝 Request:', { 
      queryLength: userQuery?.length, 
      historyCount: conversationHistory.length,
      maxDocuments,
      similarityThreshold
    });

    if (!userQuery || typeof userQuery !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing userQuery parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ===================================
    // RATE LIMITING (OWASP A04:2021)
    // ===================================
    // Use apikey or auth token for rate limiting
    const rateLimitKey = (apiKeyHeader || authHeader?.split(' ')[1] || 'anonymous').substring(0, 10);
    const userId = rateLimitKey; // User identifier for logging
    const rateLimit = checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // ===================================
    // INITIALIZE SUPABASE CLIENT
    // ===================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    console.log('⚙️ ENV check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasGeminiKey: !!geminiApiKey
    });

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      console.error('❌ Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized');

    // ===================================
    // FASE A: Extraer etiquetas/metadata con LLM pequeño
    const metadataTags = await extractMetadataTags(userQuery, geminiApiKey);
    console.log('🔎 Etiquetas extraídas por IA:', metadataTags);

    // RAG: PROCESSING
    // ===================================
    let { documents, cacheHit } = await processRAG(
      userQuery,
      supabase,
      geminiApiKey,
      similarityThreshold,
      maxDocuments
    );

    // FASE B: Filtrado duro por metadatos
    if (metadataTags.length > 0) {
      documents = documents.filter((doc: any) =>
        metadataTags.some(tag => (doc.source || '').toLowerCase().includes(tag.toLowerCase()))
      );
      console.log(`🔎 Filtrando documentos por metadatos:`, metadataTags, documents.length, 'encontrados');
    }

    // ===================================
    // BUILD CONTEXT & HISTORY
    // ===================================
    const context = documents && documents.length > 0
      ? documents.map((doc: any) => `[${doc.source || 'Knowledge Base'}]: ${doc.content}`).join('\n\n')
      : 'No specific context available. Using general knowledge about SmartConnect AI.';

    const historyText = conversationHistory
      .slice(-5)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // ===================================
    // GET PROMPT VARIANT
    // ===================================
    const selectedVariant = getPromptVariant(abTestGroup, context, historyText);

    // ===================================
    // GEMINI API CALL
    // ===================================
    const aiResponse = await callGemini(selectedVariant.prompt, userQuery, geminiApiKey);

    // ===================================
    // A/B TESTING: METRICS TRACKING
    // ===================================
    const responseStartTime = Date.now();
    const responseTime = Date.now() - responseStartTime;
    
    // Log A/B test metrics
    await supabase.from('ab_test_metrics').insert({
      test_name: 'prompt_variants',
      variant_name: selectedVariant.name,
      variant_id: abTestGroup,
      user_query: userQuery,
      ai_response: aiResponse,
      response_time_ms: responseTime,
      documents_used: documents?.length || 0,
      context_length: context.length,
      timestamp: new Date().toISOString(),
      user_id: userId,
      metadata: {
        queryLength: userQuery.length,
        responseLength: aiResponse.length,
        hasContext: documents?.length > 0,
        rateLimitRemaining: rateLimit.remaining
      }
    });

    // ===================================
    // SECURITY LOGGING (OWASP A09:2021)
    // ===================================
    await supabase.from('security_logs').insert({
      event_type: 'CHATBOT_QUERY',
      details: `Query: "${userQuery.substring(0, 100)}${userQuery.length > 100 ? '...' : ''}"`,
      severity: 'INFO',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      metadata: { 
        documentsRetrieved: documents?.length || 0,
        queryLength: userQuery.length,
        responseLength: aiResponse.length,
        rateLimitRemaining: rateLimit.remaining,
        abTestGroup,
        promptVariant: selectedVariant.name,
        embeddingCacheHit: cacheHit
      }
    });

// ===================================
    // RETURN RESPONSE
    // ===================================
    return new Response(
      JSON.stringify({
        response: aiResponse,
        sources: documents?.map((doc: any) => doc.source).filter(Boolean) || [],
        documentsUsed: documents?.length || 0,
        rateLimitRemaining: rateLimit.remaining,
        abTestGroup,
        promptVariant: selectedVariant.name,
        responseTime,
        cacheHit
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString()
        } 
      }
    );

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
