// ========================================
// SUPABASE EDGE FUNCTION - Gemini Embedding
// ========================================
// @ts-nocheck - Deno runtime types
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Simple in-memory rate limiter (for development)
// TODO: Use Upstash Redis for production
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
    // SECURITY: JWT Token Validation (OWASP A07:2021)
    // ===================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('SECURITY: Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT token
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('SECURITY: Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('SECURITY: Invalid or expired token', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===================================
    // SECURITY: Rate Limiting (OWASP A04:2021)
    // ===================================
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.warn(`SECURITY: Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60 // seconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60)
          } 
        }
      );
    }

    console.log(`Request from user: ${user.id} (${user.email}) - Rate limit remaining: ${rateLimit.remaining}`);

    const { text } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    // Debug logging
    console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
    console.log('GEMINI_API_KEY length:', GEMINI_API_KEY?.length || 0);
    console.log('GEMINI_API_KEY starts with:', GEMINI_API_KEY?.substring(0, 10) || 'N/A');

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: 'gemini-embedding-001',
          content: { parts: [{ text }] },
          outputDimensionality: 768
        })
      }
    );

    const data = await response.json();
    
    // Si hay error, agregar info de debug
    if (data.error) {
      data._debug = {
        keyExists: !!GEMINI_API_KEY,
        keyLength: GEMINI_API_KEY?.length || 0,
        keyPrefix: GEMINI_API_KEY?.substring(0, 15) || 'N/A',
        keySuffix: GEMINI_API_KEY?.substring(GEMINI_API_KEY.length - 5) || 'N/A'
      };
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
