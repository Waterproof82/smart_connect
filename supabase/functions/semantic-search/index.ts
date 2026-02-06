// supabase/functions/semantic-search/index.ts

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
    const { embedding, document_ids } = await req.json();

    if (!embedding || !document_ids || document_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "embedding and document_ids required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/match_documents_filtered`,
      {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query_embedding: embedding,
          document_ids: document_ids,
          match_threshold: 0.5,
          match_count: 10,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`RPC error: ${response.statusText}`);
    }

    const data = await response.json();
    const sorted = (data || []).sort(
      (a: any, b: any) => (b.similarity || 0) - (a.similarity || 0)
    );

    return new Response(JSON.stringify({ documents: sorted }), {
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