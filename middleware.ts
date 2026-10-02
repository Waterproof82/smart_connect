import { next, rewrite } from "@vercel/functions";

/**
 * Vercel Node.js Middleware — content negotiation for text/markdown.
 *
 * When a request includes `Accept: text/markdown`, rewrites to
 * /api/negotiate?path=... which returns the page as clean Markdown
 * for AI/LLM consumption.
 *
 * Normal requests pass through to static files (no added latency).
 *
 * The matcher below is a static literal array — Vercel extracts `config`
 * via static analysis, so it MUST NOT be computed at runtime from
 * scripts/site-routes.json. It is kept in sync by
 * tests/unit/agentSurfaceParity.test.ts (design.md D1, agent-surface-drift).
 */
export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/tarjetas-nfc",
    "/carta-digital",
    "/ia-chatbots-tenerife",
    "/tpv-restaurantes",
    "/about",
    "/legal/aviso",
    "/legal/privacidad",
    "/legal/cookies",
  ],
};

export default function middleware(request: Request): Response {
  const accept = request.headers.get("accept") || "";

  if (accept.includes("text/markdown")) {
    const url = new URL(request.url);
    return rewrite(
      new URL(
        `/api/negotiate?path=${encodeURIComponent(url.pathname)}`,
        request.url,
      ),
    );
  }

  return next();
}
