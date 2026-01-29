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
// MAIN HANDLER
// ========================================
Deno.serve(async (req) => {
  // CORS headers
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ===================================
    // SECURITY: Authorization Check
    // ===================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
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
      similarityThreshold = 0.3 
    }: ChatRequest = await req.json();

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
    const userId = authHeader.split(' ')[1]?.substring(0, 10) || 'anonymous';
    const rateLimit = checkRateLimit(userId);
    
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

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ===================================
    // RAG: GENERATE QUERY EMBEDDING
    // ===================================
    let queryEmbedding: number[] = [];
    let documents: any[] = [];
    
    try {
      queryEmbedding = await generateEmbedding(userQuery, geminiApiKey);
      
      // ===================================
      // RAG: VECTOR SEARCH
      // ===================================
      // Convert embedding array to pgvector format string: [0.1,0.2,0.3]
      const embeddingString = `[${queryEmbedding.join(',')}]`;
      
      const { data: searchResults, error: searchError } = await supabase
        .rpc('match_documents', {
          query_embedding: embeddingString, // Send as string for pgvector cast
          match_threshold: similarityThreshold,
          match_count: maxDocuments
        });

      if (searchError) {
        console.error('Vector search error:', searchError);
        // Continue without documents (fallback to general knowledge)
      } else {
        documents = searchResults || [];
      }
    } catch (error) {
      console.error('RAG processing error:', error);
      // Continue without RAG - use general knowledge only
    }

    // ===================================
    // RAG: BUILD CONTEXT
    // ===================================
    const context = documents && documents.length > 0
      ? documents.map((doc: any) => `[${doc.source || 'Knowledge Base'}]: ${doc.content}`).join('\n\n')
      : 'No specific context available. Using general knowledge about SmartConnect AI.';

    // ===================================
    // BUILD CONVERSATION HISTORY
    // ===================================
    const historyText = conversationHistory
      .slice(-5) // Last 5 messages only
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // ===================================
    // GEMINI API CALL (Protected)
    // ===================================
    const systemPrompt = `You are an expert assistant for SmartConnect AI, a business accelerator agency specializing in:

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
- For technical questions, provide clear, actionable guidance`;

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
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

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

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
        rateLimitRemaining: rateLimit.remaining
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
        rateLimitRemaining: rateLimit.remaining
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
