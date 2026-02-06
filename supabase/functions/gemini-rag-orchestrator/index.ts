// supabase/functions/gemini-rag-orchestrator/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  // 1. Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userQuery } = await req.json();
    if (!userQuery) throw new Error("userQuery required");

    // Variables de entorno (Sin imports raros)
    // @ts-ignore
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // O la Anon Key

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Faltan variables de entorno");
    }

    console.log(`🚀 [Orchestrator] Iniciando con fetch puro: "${userQuery}"`);

    // ========================================================================
    // PASO 1: CLASIFICACIÓN (Fetch a Gemini)
    // ========================================================================
    const classifyUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    // Lanzamos clasificación y embedding en paralelo
    const classifyPromise = fetch(`${classifyUrl}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 
          `Analyze query. Return JSON only.
           Tags: copas, bebidas, comida, precios, horarios, ubicacion, menu.
           Query: "${userQuery}"
           Format: {"intent": "general", "tags": [], "metadata_filters": {"source": "menu"}}` 
        }]}],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    // ========================================================================
    // PASO 2: EMBEDDING (Fetch a Gemini)
    // ========================================================================
    const embeddingUrl = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";
    const embeddingPromise = fetch(`${embeddingUrl}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: userQuery }] }
      })
    });

    const [classifyRes, embeddingRes] = await Promise.all([classifyPromise, embeddingPromise]);

    if (!classifyRes.ok || !embeddingRes.ok) throw new Error("Error conectando con Gemini");

    // Parsear resultados
    const classifyData = await classifyRes.json();
    const classification = JSON.parse(classifyData.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    
    const embeddingData = await embeddingRes.json();
    const embeddingValues = embeddingData.embedding.values;

    // ========================================================================
    // PASO 3: BÚSQUEDA EN BASE DE DATOS (Usando Fetch a Supabase REST)
    // ========================================================================
    // En lugar de usar la librería, llamamos a la API REST directamente.
    // Endpoint para RPC: /rest/v1/rpc/nombre_funcion
    
    console.log("🔍 Buscando en Supabase vía REST...");
    
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query_embedding: embeddingValues,
        match_threshold: 0.5,
        match_count: 8,
        filter: classification.metadata_filters || {}
      })
    });

    let documents = [];
    if (dbResponse.ok) {
      documents = await dbResponse.json();
    } else {
      // Fallback: Si falla el RPC (ej. no existe), hacemos búsqueda de texto simple
      console.warn("⚠️ Fallback a búsqueda de texto simple (RPC error)");
      const textSearchUrl = new URL(`${supabaseUrl}/rest/v1/documents`);
      textSearchUrl.searchParams.append("select", "content,source");
      textSearchUrl.searchParams.append("content", `ilike.%${userQuery}%`); // Búsqueda simple
      textSearchUrl.searchParams.append("limit", "5");
      
      const fallbackRes = await fetch(textSearchUrl.toString(), {
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
      });
      if (fallbackRes.ok) documents = await fallbackRes.json();
    }

    console.log(`✅ Documentos encontrados: ${documents.length}`);

    // ========================================================================
    // PASO 4: GENERAR RESPUESTA FINAL (Fetch a Gemini)
    // ========================================================================
    const contextText = documents.length > 0
      ? documents.map((d: any) => `[FUENTE: ${d.source || 'General'}]: ${d.content}`).join("\n\n")
      : "No hay información específica en la base de datos.";

    const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    const chatResponse = await fetch(`${classifyUrl}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `Eres un asistente de restaurante experto. Fecha: ${now}.
          Usa el CONTEXTO para responder. Si no sabes, dilo. No inventes precios.` }]
        },
        contents: [
          { role: "user", parts: [{ text: `CONTEXTO:\n${contextText}\n\nPREGUNTA: "${userQuery}"` }] }
        ],
        generationConfig: { temperature: 0.3 }
      })
    });

    const chatData = await chatResponse.json();
    const finalResponse = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Error generando respuesta.";

    return new Response(JSON.stringify({ 
      response: finalResponse,
      documents: documents 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}