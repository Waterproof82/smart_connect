// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Estas variables las inyecta Supabase AUTOMÁTICAMENTE en el despliegue
    const supabaseUrl = Deno.env.get('SUPABASE_URL') 
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') 
    const geminiKey = Deno.env.get('GEMINI_API_KEY') // Esta es la única que tú subiste

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Missing Authorization header")

    // Creamos el cliente con la clave de servicio interna
    const supabase = createClient(supabaseUrl!, serviceKey!)
    const token = authHeader.replace('Bearer ', '')
    
    // Validamos el usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error("Invalid token")

    // Verificamos el rol de admin que pusimos por SQL
    if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, headers: corsHeaders 
      })
    }

    const { text } = await req.json()
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] }
        })
      }
    )

    const data = await geminiRes.json()
    return new Response(
      JSON.stringify({ embedding: data.embedding.values }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})