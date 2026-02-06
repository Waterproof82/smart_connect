// supabase/functions/filter-documents/index.ts

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
    const { metadata_filters } = await req.json();

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let queryParams = new URLSearchParams();
    queryParams.append("select", "id,content,source,embedding,is_public,created_at");
    queryParams.append("is_public", "eq.true");

    if (metadata_filters?.source) {
      queryParams.append("source", `ilike.%${metadata_filters.source}%`);
    }

    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    queryParams.append("created_at", `gte.${thirtyDaysAgo}`);
    queryParams.append("limit", "20");

    const response = await fetch(
      `${supabaseUrl}/rest/v1/documents?${queryParams.toString()}`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    const documents = await response.json();

    return new Response(JSON.stringify({ documents }), {
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