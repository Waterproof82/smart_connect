// supabase/functions/gemini-chat/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userQuery, documents } = await req.json();

    if (!userQuery) throw new Error("userQuery is required");

    const geminiKey = (globalThis as any).Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY missing");

    // Construcción del contexto enriquecido
    const context = documents && documents.length > 0
      ? documents.map((d: any) => `[FUENTE: ${d.source || 'General'}]: ${d.content}`).join("\n\n")
      : "No hay información específica disponible en el menú o base de datos.";

    const systemInstruction = `Eres un asistente virtual experto de un restaurante de alta calidad. 
    Tu objetivo es ayudar a los clientes con información sobre platos, bebidas, precios y logística.
    
    INSTRUCCIONES DE RESPUESTA:
    1. Si hay contexto disponible, úsalo para responder de forma precisa.
    2. Si el contexto no contiene la respuesta, di amablemente que no tienes ese detalle específico pero ofrece ayuda en lo que sí sepas.
    3. Mantén un tono elegante, servicial y conciso.
    4. No inventes precios ni ingredientes que no estén en el contexto.
    
    CONTEXTO DEL RESTAURANTE:
    ${context}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Entendido. Soy el asistente del restaurante. ¿En qué puedo ayudarle hoy?" }] },
            { role: "user", parts: [{ text: `Pregunta del cliente: "${userQuery}"` }] }
          ],
          generationConfig: {
            temperature: 0.7, // Un poco de creatividad para que suene humano
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chat] Gemini Error:", errorText);
      throw new Error(`Gemini Chat failed: ${response.status}`);
    }

    const data = await response.json();
    const finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Lo siento, he tenido un problema técnico al procesar tu respuesta.";

    return new Response(JSON.stringify({ response: finalResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[chat] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}