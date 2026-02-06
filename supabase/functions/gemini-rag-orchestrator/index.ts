// supabase/functions/gemini-rag-orchestrator/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  // 1. MANEJO DE PREFLIGHT (CORS) - ESTO DEBE IR PRIMERO
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTotal = Date.now();
  const timings: Record<string, number> = {};

  try {
    // 2. Extracción segura de datos
    // Usamos ?. para evitar crash si el body está vacío o mal formado
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Invalid JSON body");
    }
    
    const { userQuery } = body;
    if (!userQuery) throw new Error("userQuery required");

    // 3. Manejo de Autorización (CRÍTICO)
    // Para llamar a otras funciones, necesitamos pasar el JWT del usuario o la Service Key.
    // Si el cliente no lo envía, usamos la key anónima del entorno como fallback.
    const authHeader = req.headers.get("Authorization") ?? `Bearer ${(globalThis as any).Deno.env.get("SUPABASE_ANON_KEY")}`;

    const baseUrl = new URL(req.url).origin;

    // Helper para llamadas internas con manejo de errores
    const apiCall = async (endpoint: string, payload: object, timeout = 10000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const res = await fetch(`${baseUrl}/functions/v1/${endpoint}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": authHeader // Pasamos el token
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        
        clearTimeout(id);
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error en ${endpoint} (${res.status}): ${errorText}`);
        }
        return res.json();
      } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') throw new Error(`Timeout en ${endpoint}`);
        throw error;
      }
    };

    console.log(`[Orchestrator] Procesando query: "${userQuery}"`);

    // --- PASO 1: CLASIFICAR ---
    const t1 = Date.now();
    const classification = await apiCall("gemini-classify-query", { userQuery });
    timings.classification = Date.now() - t1;
    console.log("[Orchestrator] Clasificación:", classification.intent);

    // --- PASOS 2 Y 3: FILTRADO Y EMBEDDING (PARALELO) ---
    const t23 = Date.now();
    const [filterData, embeddingData] = await Promise.all([
      apiCall("filter-documents", { metadata_filters: classification.metadata_filters }),
      apiCall("gemini-embedding", { text: userQuery })
    ]);
    timings.filter_and_embedding = Date.now() - t23;

    // --- PASO 4: BÚSQUEDA SEMÁNTICA ---
    const t4 = Date.now();
    const semanticData = await apiCall("semantic-search", {
      embedding: embeddingData.embedding,
      document_ids: filterData.documents?.map((d: any) => d.id) || [],
    });
    const foundDocuments = semanticData.documents || [];
    timings.semantic = Date.now() - t4;

    // --- PASO 5: RERANKING ---
    const t5 = Date.now();
    const rerankData = await apiCall("gemini-rerank", {
      userQuery,
      documents: foundDocuments,
    });
    const topDocuments = rerankData.documents || [];
    timings.reranking = Date.now() - t5;

    // --- PASO 6: CHAT FINAL ---
    const t6 = Date.now();
    const chatData = await apiCall("gemini-chat", {
      userQuery,
      documents: topDocuments,
    }, 20000); // Damos más tiempo al chat final (20s)
    timings.generation = Date.now() - t6;

    timings.total = Date.now() - startTotal;

    // RESPUESTA EXITOSA
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response: chatData.response,
          documents: topDocuments,
          metadata: { ...timings }
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("❌ [Orchestrator Error]:", error.message);
    
    // IMPORTANTE: Incluso si hay error, devolvemos headers CORS y un JSON válido
    // para que el frontend pueda leer el mensaje de error.
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, // O 500 para errores del servidor
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}