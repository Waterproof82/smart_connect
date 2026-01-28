// ========================================
// SUPABASE EDGE FUNCTION - Gemini Embedding
// ========================================
// @ts-nocheck - Deno runtime types
import "https://deno.land/x/xhr@0.1.0/mod.ts";

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autorización (requerido por Supabase)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
