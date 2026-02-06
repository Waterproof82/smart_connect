// supabase/functions/gemini-rerank/index.ts

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
    const { userQuery, documents } = await req.json();

    if (!userQuery || !documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: "userQuery and documents required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // @ts-ignore
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    const docsToRerank = documents.slice(0, 10);
    const documentsText = docsToRerank
      .map((doc: any, idx: number) => `Document ${idx + 1}:\n${doc.content}`)
      .join("\n\n---\n\n");

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
              text: `You are a document relevance scorer. Score how well each document answers the user's question.

Question: "${userQuery}"

Documents:
${documentsText}

For each document, provide:
1. Relevance score (0.0 to 1.0)
2. Brief reasoning

IMPORTANT: Return ONLY valid JSON:
{
  "rankings": [
    { "document_index": 0, "relevance_score": 0.98, "reasoning": "..." },
    { "document_index": 1, "relevance_score": 0.85, "reasoning": "..." }
  ]
}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          }
        })
      }
    );

    const data = await response.json();
    const responseText = data.candidates[0]?.content?.parts[0]?.text || "{}";
    const jsonString = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(jsonString);

    const ranked = (parsed.rankings || [])
      .filter((rank: any) => rank.relevance_score > 0.5)
      .slice(0, 3)
      .map((rank: any) => ({
        ...docsToRerank[rank.document_index],
        relevance_score: rank.relevance_score,
        rerank_reason: rank.reasoning,
      }));

    return new Response(JSON.stringify({ documents: ranked }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}