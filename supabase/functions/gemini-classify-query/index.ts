// supabase/functions/gemini-rag-orchestrator/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para forzar un error si el fetch tarda más de X segundos
const fetchWithTimeout = async (url: string, options: any, timeout = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export default async function handler(req: Request): Promise<Response> {
  // 1. Preflight CORS
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    console.log("🚀 [Inicio] Recibiendo petición...");

    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("El cuerpo de la petición no es JSON válido");
    }
    
    const { userQuery } = body;
    if (!userQuery) throw new Error("Falta userQuery");

    console.log(`📝 Query recibida: "${userQuery}"`);

    // Carga de variables con logs de seguridad
    // @ts-ignore
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!geminiKey) throw new Error("Falta GEMINI_API_KEY");
    if (!supabaseUrl) throw new Error("Falta SUPABASE_URL");
    if (!supabaseKey) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");

    // URLs
    const urlGen = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const urlEmbed = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    // ========================================================================
    // PASO 1: CLASIFICACIÓN
    // ========================================================================
    console.log("⏳ [Paso 1] Llamando a Gemini (Clasificación)...");
    
    type Classification = { intent?: string; metadata_filters: Record<string, any> };
    let classification: Classification = { intent: "general", metadata_filters: {} }; // Valor por defecto
    try {
        const classRes = await fetchWithTimeout(`${urlGen}?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Return JSON only. Query: "${userQuery}". Format: {"intent": "general", "metadata_filters": {}}` }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (classRes.ok) {
            const classData = await classRes.json();
            const txt = classData.candidates?.[0]?.content?.parts?.[0]?.text;
            classification = JSON.parse(txt || "{}");
            console.log("✅ [Paso 1] Clasificado:", classification.intent || "unknown");
        } else {
            console.error(`❌ Error Gemini Clasificación: ${classRes.status}`);
        }
    } catch (err) {
        console.error("⚠️ [Paso 1] Falló o Timeout, continuamos sin filtros:", err);
    }

    // ========================================================================
    // PASO 2: EMBEDDING
    // ========================================================================
    console.log("⏳ [Paso 2] Generando Embedding...");
    
    let embeddingValues = [];
    try {
        const embedRes = await fetchWithTimeout(`${urlEmbed}?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: userQuery }] }
          })
        });

        if (!embedRes.ok) throw new Error(`Status ${embedRes.status}`);
        const embedData = await embedRes.json();
        embeddingValues = embedData.embedding.values;
        console.log("✅ [Paso 2] Embedding generado.");
    } catch (err) {
        console.error("❌ [Paso 2] Error crítico en embedding:", err);
        throw new Error("No se pudo conectar con Gemini Embedding");
    }

    // ========================================================================
    // PASO 3: BÚSQUEDA SUPABASE
    // ========================================================================
    console.log("⏳ [Paso 3] Buscando en Supabase RPC...");
    
    let documents = [];
    try {
        const rpcRes = await fetchWithTimeout(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                query_embedding: embeddingValues,
                match_threshold: 0.3,
                match_count: 5,
                filter: classification.metadata_filters || {}
            })
        }, 4000); // 4 segundos timeout para la DB

        if (rpcRes.ok) {
            documents = await rpcRes.json();
            console.log(`✅ [Paso 3] RPC OK. Documentos: ${documents.length}`);
        } else {
            console.warn(`⚠️ [Paso 3] RPC falló (${rpcRes.status}). Probando búsqueda texto...`);
            // Fallback búsqueda texto
            const textUrl = new URL(`${supabaseUrl}/rest/v1/documents`);
            textUrl.searchParams.append("select", "content,source");
            textUrl.searchParams.append("content", `ilike.%${userQuery}%`);
            textUrl.searchParams.append("limit", "3");
            
            const textRes = await fetchWithTimeout(textUrl.toString(), {
                headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
            });
            if (textRes.ok) documents = await textRes.json();
        }
    } catch (err) {
        console.error("⚠️ [Paso 3] Error DB:", err);
        // No lanzamos error, seguimos con 0 documentos
    }

    // ========================================================================
    // PASO 4: CHAT FINAL
    // ========================================================================
    console.log("⏳ [Paso 4] Generando respuesta final...");

    const contextText = documents.map((d: any) => d.content).join("\n\n");
    const chatRes = await fetchWithTimeout(`${urlGen}?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Context: ${contextText}\n\nUser: ${userQuery}\n\nAnswer:` }] }]
        })
    });
    
    const chatData = await chatRes.json();
    const finalResponse = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Error.";
    
    console.log("✅ [Fin] Respuesta generada.");

    return new Response(JSON.stringify({ response: finalResponse, documents }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("🔥 ERROR FATAL:", error.message || error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}