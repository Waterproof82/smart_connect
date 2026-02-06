// supabase/functions/filter-documents/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  // 1. Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { metadata_filters } = await req.json();

    // Validamos variables de entorno obligatorias
    const supabaseUrl =(globalThis as any).Deno.env.get("VITE_SUPABASE_URL");
    
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    // 2. Construcción de la Query string para PostgREST
    // Usamos URLSearchParams para manejar correctamente la codificación de caracteres
    const queryParams = new URLSearchParams();
    
    // Select fields: Solo lo necesario para generar embeddings y contexto
    queryParams.append("select", "id,content,source,is_public,created_at");
    
    // Filtros Base
    queryParams.append("is_public", "eq.true"); // Solo documentos públicos
    
    // LOGIC FIX: Quitamos el filtro de fecha (created_at). 
    // Los menús antiguos siguen siendo válidos hasta que se borren o actualicen.
    
    // Filtro Dinámico (Source)
    // Si metadata_filters.source es "bebidas", buscamos coincidencias parciales
    if (metadata_filters?.source) {
      // Nota: PostgREST usa sintaxis 'ilike.%valor%'
      queryParams.append("source", `ilike.%${metadata_filters.source}%`);
    }

    // Ordenación y Límites
    // Priorizamos los documentos más recientes por si hay versiones duplicadas
    queryParams.append("order", "created_at.desc"); 
    queryParams.append("limit", "20"); // Traemos un pool razonable para la búsqueda semántica posterior

    console.log(`[filter] Fetching docs from: ${supabaseUrl}/rest/v1/documents?${queryParams.toString()}`);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/documents?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase REST error: ${response.status} - ${errorText}`);
    }

    const documents = await response.json();
    console.log(`[filter] Found ${documents.length} documents.`);

    return new Response(JSON.stringify({ documents }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[filter] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}