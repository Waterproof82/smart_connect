import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  // 1. GESTIÓN DE PERMISOS (CORS) - ¡Esto arregla el error del Chat!
  if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userQuery } = await req.json();
    console.log(`🚀 [1] Chat pregunta: "${userQuery}"`);

    // --- CONFIGURACIÓN A FUEGO (HARDCODED) ---
    // Usamos host.docker.internal para conectar Docker con tu PC
    const supabaseUrl = "http://host.docker.internal:54321";
    
    // 👇👇👇 PEGA AQUÍ TU CLAVE 'SERVICE_ROLE' (La que empieza por eyJ...) 👇👇👇
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU0MTk2MiwiZXhwIjoyMDg1MTE3OTYyfQ.dvFZakaCz8ZXVM1iSHI3o314UFVkExz8AX1U-GMWTiw";

    // 👇👇👇 PEGA AQUÍ TU CLAVE DE GOOGLE GEMINI (AIzaSy...) 👇👇👇
    const geminiKey = "AIzaSyBXsqQ4Py0DR9Zh5NmQImwyc28EDObMg1M";

    // Chequeo de seguridad para que no se te olvide
    if (supabaseKey.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2plZHZ1anZzbXJ6enJtZXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU0MTk2MiwiZXhwIjoyMDg1MTE3OTYyfQ.dvFZakaCz8ZXVM1iSHI3o314UFVkExz8AX1U-GMWTiw") || geminiKey.includes("AIzaSyBXsqQ4Py0DR9Zh5NmQImwyc28EDObMg1M")) {
        throw new Error("⚠️ ¡FALTAN LAS CLAVES EN EL CÓDIGO! Edita el archivo index.ts");
    }

    // Inicializamos cliente
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- PASO A: EMBEDDING (GEMINI) ---
    console.log("🧠 [2] Llamando a Gemini...");
    const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: userQuery }] }
      })
    });
    
    if (!embedRes.ok) {
        const errText = await embedRes.text();
        throw new Error(`Error Gemini Embedding: ${embedRes.status} - ${errText}`);
    }
    
    const embedData = await embedRes.json();
    const embedding = embedData.embedding.values;
    console.log("✅ [3] Embedding OK.");

    // --- PASO B: SUPABASE ---
    console.log("🗄️ [4] Buscando en base de datos...");
    const { data: documents, error: dbError } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
    });

    if (dbError) throw new Error(`Error Base de Datos: ${dbError.message}`);
    console.log(`✅ [5] Encontrados: ${documents?.length || 0} docs.`);

    // --- PASO C: RESPUESTA FINAL ---
    const context = documents?.map((d: any) => d.content).join("\n\n") || "No info";
    
    console.log("🤖 [6] Generando respuesta...");
    const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Contexto:\n${context}\n\nPregunta: "${userQuery}"\nRespuesta útil:` }] }]
      })
    });

    const chatData = await chatRes.json();
    const finalText = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Error generando texto";

    console.log("🏁 [7] ¡EXITO! Respondiendo al chat.");

    return new Response(JSON.stringify({ 
        response: finalText, 
        documents 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    console.error("🔥 [ERROR]:", e.message);
    return new Response(JSON.stringify({ response: `Error técnico: ${e.message}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}