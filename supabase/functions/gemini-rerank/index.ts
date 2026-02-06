// supabase/functions/gemini-rerank/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userQuery, documents } = await req.json();

    if (!userQuery || !documents || documents.length === 0) {
      return new Response(JSON.stringify({ documents: [] }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const geminiKey = (globalThis as any).Deno.env.get("GEMINI_API_KEY");
    
    // Limitamos a los top 10 de la búsqueda semántica para no exceder la ventana de contexto
    const docsToRerank = documents.slice(0, 10);
    const documentsText = docsToRerank
      .map((doc: any, idx: number) => `ID: ${idx}\nContent: ${doc.content}`)
      .join("\n\n---\n\n");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey!,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a Reranking expert. Your task is to evaluate the relevance of documents to a query.
              
              Query: "${userQuery}"
              
              Documents to evaluate:
              ${documentsText}
              
              Instructions:
              - Assign a relevance_score (0.0 to 1.0).
              - Provide a very brief reasoning.
              - Return valid JSON with the exact structure below.`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                rankings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      document_index: { type: "number" },
                      relevance_score: { type: "number" },
                      reasoning: { type: "string" }
                    },
                    required: ["document_index", "relevance_score", "reasoning"]
                  }
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[rerank] Gemini API error:", err);
      // Fallback: Si Gemini falla, devolvemos los documentos originales sin rerank
      return new Response(JSON.stringify({ documents: documents.slice(0, 3), fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(result || '{"rankings":[]}');

    // Mapeo y ordenación por score
    const ranked = (parsed.rankings || [])
      .map((rank: any) => ({
        ...docsToRerank[rank.document_index],
        relevance_score: rank.relevance_score,
        rerank_reason: rank.reasoning,
      }))
      .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
      .filter((doc: any) => doc.relevance_score > 0.4) // Filtro de calidad
      .slice(0, 5); // Nos quedamos con los 5 mejores para el chat final

    return new Response(JSON.stringify({ documents: ranked }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[rerank] Error fatal:", error.message);
    return new Response(JSON.stringify({ error: error.message, documents: [] }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}