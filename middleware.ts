import { next, rewrite } from "@vercel/edge";

/**
 * Vercel Edge Middleware — content negotiation for text/markdown.
 *
 * When a request includes `Accept: text/markdown`, rewrites to
 * /api/negotiate?path=... which returns the page as clean Markdown
 * for AI/LLM consumption.
 *
 * Normal requests pass through to static files (no added latency).
 */
export const config = {
  matcher: [
    "/",
    "/servicios",
    "/contacto",
    "/carta-digital",
    "/tap-review",
    "/automatizacion-restaurantes-n8n",
    "/automatizacion-whatsapp-restaurante",
    "/software-restaurantes-canarias",
    "/digitalizacion-hosteleria-tenerife",
    "/about",
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
