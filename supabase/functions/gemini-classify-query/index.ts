// supabase/functions/gemini-classify-query/index.ts

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userQuery } = await req.json();

    if (!userQuery) {
      return new Response(
        JSON.stringify({ error: "userQuery required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // @ts-ignore
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    console.log("[classify] GEMINI_API_KEY exists:", !!geminiKey);
    console.log("[classify] userQuery:", userQuery);

    console.log("[classify] Fetching Gemini API...");
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this query and extract metadata.

Available tags: copas, bebidas, comida, precios, horarios, ubicacion, menu, promociones

Query: "${userQuery}"

Return ONLY valid JSON:
{
  "intent": "pricing_query|hours_query|location_query|general_query",
  "tags": ["tag1"],
  "metadata_filters": {
    "source": "menu/copas",
    "is_public": true
  },
  "confidence": 0.95
}`
            }]
          }],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 200,
          }
        })
      }
    );
    console.log("[classify] Gemini API responded, status:", response.status);

    const data = await response.json();
    console.log("[classify] Gemini API data:", JSON.stringify(data));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const jsonString = text.replaceAll(/```json\n?/g, "").replaceAll(/```\n?/g, "").trim();
    const result = JSON.parse(jsonString);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: corsHeaders
    });
  }
}