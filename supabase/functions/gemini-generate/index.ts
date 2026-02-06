// ============================================================================
// SUPABASE EDGE FUNCTION: gemini-generate
// ============================================================================
// Genera respuestas de IA con contexto RAG
// Con CORS correctamente implementado

// ============================================================================
// TIPOS
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

function validateGenerationRequest(data: unknown): {
  valid: boolean;
  error?: string;
  contents?: unknown;
  generationConfig?: unknown;
} {
  try {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Request must be an object" };
    }

    const obj = data as Record<string, unknown>;

    // Validate contents exists
    if (!obj.contents || !Array.isArray(obj.contents)) {
      return { valid: false, error: "contents is required and must be an array" };
    }

    if (obj.contents.length === 0) {
      return { valid: false, error: "contents array cannot be empty" };
    }

    // Basic validation of contents structure
    for (let i = 0; i < obj.contents.length; i++) {
      const content = obj.contents[i];
      if (!content || typeof content !== "object") {
        return { valid: false, error: `contents[${i}] must be an object` };
      }

      const contentObj = content as Record<string, unknown>;
      if (!contentObj.parts || !Array.isArray(contentObj.parts)) {
        return { valid: false, error: `contents[${i}].parts must be an array` };
      }
    }

    return {
      valid: true,
      contents: obj.contents,
      generationConfig: obj.generationConfig,
    };
  } catch {
    return { valid: false, error: "Invalid request format" };
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  let record = rateLimitMap.get(userId);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(userId, record);
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// ============================================================================
// EXTRACT USER ID
// ============================================================================

function extractUserId(req: Request): string {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return "anon";
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || "anon";
    }
  } catch {
    // Fall back to anon
  }

  return "anon";
}

// ============================================================================
// CORS HELPERS
// ============================================================================

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders();

  // ✅ CRITICAL: CORS preflight with status 200
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // Extract user ID
    const userId = extractUserId(req);

    // Parse request body
    let bodyData;
    try {
      bodyData = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Validate input
    const validation = validateGenerationRequest(bodyData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 60),
          },
        }
      );
    }

    console.log(
      `Generation request from user: ${userId} - Rate limit remaining: ${rateLimit.remaining}`
    );

    // Get Gemini API key
    // @ts-ignore
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call Gemini API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let geminiResponse;
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify({
            contents: validation.contents,
            generationConfig: validation.generationConfig,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      geminiResponse = await response.json();

      // Validate response structure
      if (!geminiResponse.candidates || !Array.isArray(geminiResponse.candidates)) {
        throw new Error("Invalid Gemini API response");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Gemini API error:", errorMsg);

      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // ✅ Return success with CORS headers
    return new Response(JSON.stringify(geminiResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Unhandled error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}