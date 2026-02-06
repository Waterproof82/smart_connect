// supabase/functions/gemini-rag-orchestrator/index.ts

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTotal = Date.now();
  const timings: Record<string, number> = {};

  try {
    let userQuery: string | undefined;
    try {
      const body = await req.json();
      userQuery = body.userQuery;
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!userQuery) {
      return new Response(
        JSON.stringify({ success: false, error: "userQuery required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🚀 RAG Orchestrator started");
    console.log(`Query: "${userQuery}"`);

    // ✅ Obtén la URL base del servidor
    const baseUrl = new URL(req.url).origin;

    // ============================================================================
    // PASO 1: CLASIFICAR QUERY
    // ============================================================================
    console.log("📊 Step 1: Classifying query...");
    let t = Date.now();

    const classifyRes = await fetch(`${baseUrl}/functions/v1/gemini-classify-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userQuery }),
    });

    const classification = await classifyRes.json();
    timings.classification = Date.now() - t;

    console.log("✅ Classification:", classification.intent);

    // ============================================================================
    // PASO 2: FILTRAR DOCUMENTOS
    // ============================================================================
    console.log("🔍 Step 2: Filtering documents...");
    t = Date.now();

    const filterRes = await fetch(`${baseUrl}/functions/v1/filter-documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata_filters: classification.metadata_filters }),
    });

    const filterData = await filterRes.json();
    const filteredDocuments = filterData.documents || [];
    const documentIds = filteredDocuments.map((d: any) => d.id);
    timings.filtering = Date.now() - t;

    console.log(`✅ Filtered: ${filteredDocuments.length} documents`);

    // ============================================================================
    // PASO 3: GENERAR EMBEDDING
    // ============================================================================
    console.log("🔄 Step 3: Generating embedding...");
    t = Date.now();

    const embeddingRes = await fetch(`${baseUrl}/functions/v1/gemini-embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userQuery }),
    });

    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.embedding || [];
    timings.embedding = Date.now() - t;

    console.log("✅ Embedding generated");

    // ============================================================================
    // PASO 4: BÚSQUEDA SEMÁNTICA
    // ============================================================================
    console.log("🔎 Step 4: Semantic search...");
    t = Date.now();

    const semanticRes = await fetch(`${baseUrl}/functions/v1/semantic-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embedding: embedding,
        document_ids: documentIds,
      }),
    });

    const semanticData = await semanticRes.json();
    const semanticDocuments = semanticData.documents || [];
    timings.semantic = Date.now() - t;

    console.log(`✅ Semantic search: ${semanticDocuments.length} results`);

    // ============================================================================
    // PASO 5: RERANKING
    // ============================================================================
    console.log("🎯 Step 5: Reranking...");
    t = Date.now();

    const rerankRes = await fetch(`${baseUrl}/functions/v1/gemini-rerank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userQuery,
        documents: semanticDocuments,
      }),
    });

    const rerankData = await rerankRes.json();
    const topDocuments = rerankData.documents || [];
    timings.reranking = Date.now() - t;

    console.log(`✅ Reranking: ${topDocuments.length} top documents`);

    // ============================================================================
    // PASO 6: GENERAR RESPUESTA
    // ============================================================================
    console.log("💬 Step 6: Generating response...");
    t = Date.now();

    const chatRes = await fetch(`${baseUrl}/functions/v1/gemini-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userQuery,
        documents: topDocuments,
      }),
    });

    const chatData = await chatRes.json();
    const finalResponse = chatData.response || "No response";
    timings.generation = Date.now() - t;

    timings.total = Date.now() - startTotal;

    console.log("✅ All steps complete");
    console.log("⏱️ Timings:", timings);

    // ============================================================================
    // RETORNA RESPUESTA COMPLETA
    // ============================================================================
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response: finalResponse,
          documents: topDocuments.map((d: any) => ({
            source: d.source,
            content: d.content,
            relevance_score: d.relevance_score,
          })),
          metadata: {
            ...timings,
            documents_filtered: filteredDocuments.length,
            documents_semantic: semanticDocuments.length,
            documents_reranked: topDocuments.length,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    let msg = "Unknown error";
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === "string") {
      msg = error;
    }
    console.error("❌ Error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: corsHeaders }
    );
  }
}