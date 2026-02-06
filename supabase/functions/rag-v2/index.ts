// supabase/functions/gemini-rag-orchestrator/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userQuery } = await req.json();
    if (!userQuery) throw new Error("userQuery required");

    // @ts-ignore
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!geminiKey || !supabaseUrl || !supabaseKey) throw new Error("Faltan variables de entorno");

    console.log(`🚀 [Orchestrator] Procesando: "${userQuery}"`);

    // 1. CLASIFICACIÓN (Gemini)
    const classifyRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Return JSON. Query: "${userQuery}". Format: {"intent": "general", "metadata_filters": {}}` }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    // 2. EMBEDDING (Gemini)
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: userQuery }] }
      })
    });

    const [classData, embedData] = await Promise.all([classifyRes.json(), embedRes.json()]);
    const classification = JSON.parse(classData.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    const embedding = embedData.embedding.values;

    // 3. BÚSQUEDA (Supabase RPC)
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
      body: JSON.stringify({
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 6,
        filter: classification.metadata_filters || {}
      })
    });

    let documents = [];
    if (dbRes.ok) documents = await dbRes.json();
    else {
        // Fallback texto simple
        console.warn("⚠️ Fallback texto simple");
        const textRes = await fetch(`${supabaseUrl}/rest/v1/documents?select=content,source&content=ilike.%${userQuery}%&limit=5`, {
             headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
        });
        if (textRes.ok) documents = await textRes.json();
    }

    // 4. CHAT (Gemini)
    const context = documents.map((d: any) => d.content).join("\n\n");
    const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Context: ${context}\nUser: "${userQuery}"\nAnswer (be helpful, use markdown):` }] }]
      })
    });
    const chatData = await chatRes.json();
    
    return new Response(JSON.stringify({ 
        response: chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Error", 
        documents 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}