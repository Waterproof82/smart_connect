// supabase/functions/gemini-rag-orchestrator/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const startTotal = Date.now();
  const timings: Record<string, number> = {};
  const authHeader = req.headers.get("Authorization")!;

  try {
    const { userQuery } = await req.json();
    if (!userQuery) throw new Error("userQuery required");

    const baseUrl = new URL(req.url).origin;

    // Helper centralizado para llamadas internas
    const apiCall = async (endpoint: string, body: object, timeout = 8000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      const res = await fetch(`${baseUrl}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader // Importante para llamadas entre funciones
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(id);
      if (!res.ok) throw new Error(`Error en ${endpoint}: ${res.statusText}`);
      return res.json();
    };

    // --- PASO 1: CLASIFICAR ---
    const t1 = Date.now();
    const classification = await apiCall("gemini-classify-query", { userQuery });
    timings.classification = Date.now() - t1;

    // --- PASOS 2 Y 3: FILTRADO Y EMBEDDING EN PARALELO ---
    // Ganamos tiempo ejecutando ambos procesos simultáneamente
    const t23 = Date.now();
    const [filterData, embeddingData] = await Promise.all([
      apiCall("filter-documents", { metadata_filters: classification.metadata_filters }),
      apiCall("gemini-embedding", { text: userQuery })
    ]);
    timings.filter_and_embedding = Date.now() - t23;

    // --- PASO 4: BÚSQUEDA SEMÁNTICA ---
// --- PASO 4: BÚSQUEDA SEMÁNTICA ---
    const t4 = Date.now();
    const semanticData = await apiCall("semantic-search", {
      embedding: embeddingData.embedding,
      document_ids: filterData.documents?.map((d: any) => d.id) || [],
    });
    // Extraemos los documentos aquí para usarlos en el siguiente paso
    const foundDocuments = semanticData.documents || []; 
    timings.semantic = Date.now() - t4;

    // --- PASO 5: RERANKING ---
    const t5 = Date.now();
    const rerankData = await apiCall("gemini-rerank", {
      userQuery,
      documents: foundDocuments, // CORREGIDO: Antes decía semanticDocuments
    });
    const topDocuments = rerankData.documents || [];
    timings.reranking = Date.now() - t5;

    // --- PASO 6: GENERAR RESPUESTA ---
    const t6 = Date.now();
    const chatData = await apiCall("gemini-chat", {
      userQuery,
      documents: topDocuments,
    }, 15000); // Más tiempo para la generación final
    timings.generation = Date.now() - t6;

    timings.total = Date.now() - startTotal;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response: chatData.response,
          documents: topDocuments,
          metadata: { ...timings }
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Orchestrator Error:", error.message);
    const status = error.name === 'AbortError' ? 408 : 500;
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}