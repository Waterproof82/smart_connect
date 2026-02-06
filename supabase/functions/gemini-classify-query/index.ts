// supabase/functions/gemini-classify-query/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  // 1. Manejo de OPTIONS inmediato y limpio
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const { userQuery } = await req.json();

    if (!userQuery) {
      return new Response(JSON.stringify({ error: "userQuery required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = (globalThis as any).Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }

    // CORRECCIÓN: El modelo 'gemini-2.5-flash' no existe (aún). Usamos 'gemini-1.5-flash'.
    // La URL correcta usa el parámetro key en la query string o el header específico.
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    console.log("[classify] Fetching Gemini API for query:", userQuery.substring(0, 20) + "...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this query and extract metadata. Return ONLY valid JSON.
            Available tags: copas, bebidas, comida, precios, horarios, ubicacion, menu, promociones
            Query: "${userQuery}"
            JSON Structure:
            {
              "intent": "pricing_query|hours_query|location_query|general_query",
              "tags": ["tag1"],
              "metadata_filters": { "source": "menu/copas", "is_public": true },
              "confidence": 0.95
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.1, // Un poco más de 0 ayuda a evitar bucles si el prompt es ambiguo
          maxOutputTokens: 250,
          responseMimeType: "application/json", // Forzamos a Gemini a responder en JSON
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[classify] Gemini Error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Limpieza de Markdown si Gemini ignora el responseMimeType
    const cleanJson = text.replaceAll(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    
    console.error("[classify] Catch Block:", error.name, error.message);

    const status = error.name === 'AbortError' ? 408 : 500;
    const errorMsg = error.name === 'AbortError' ? 'Timeout: Gemini took too long' : error.message;

    return new Response(JSON.stringify({ error: errorMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}