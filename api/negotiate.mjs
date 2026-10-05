import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";
import siteRoutes from "../scripts/site-routes.json" with { type: "json" };

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  linkStyle: "inlined",
});

/**
 * Single source of truth for the agent-surface route allowlist (design.md
 * D3/D7/D8, agent-surface-drift). Kept in sync with the other 3 consumers
 * (middleware.ts, vite-plugin-md-negotiation.ts, src/WebMCP.ts) by
 * tests/unit/agentSurfaceParity.test.ts and tests/unit/scripts/negotiateApi.test.ts.
 */
export const MARKDOWN_ROUTES = siteRoutes.routes.map((r) => r.path);

export const isMarkdownRoute = (requestedPath) =>
  MARKDOWN_ROUTES.includes(requestedPath);

function linkLabel(routePath) {
  if (routePath === "/") return "Inicio";
  return routePath
    .split("/")
    .filter(Boolean)
    .join(" / ");
}

function buildQuickLinks() {
  return MARKDOWN_ROUTES.map(
    (routePath) =>
      `- [${linkLabel(routePath)}](https://digitalizatenerife.es${routePath})`,
  ).join("\n");
}

function buildNotFoundMarkdown(requestedPath) {
  return [
    `# SmartConnect AI`,
    ``,
    `> IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.`,
    ``,
    `La ruta ${requestedPath} no existe o ya no está disponible.`,
    ``,
    `## Enlaces rápidos`,
    ``,
    buildQuickLinks(),
  ].join("\n");
}

/**
 * Vercel Serverless Function — content negotiation for text/markdown.
 *
 * Reads the prerendered HTML from disk, extracts the #root content,
 * converts it to clean Markdown, and returns with text/markdown content-type.
 *
 * Any `?path=` not present in MARKDOWN_ROUTES (derived from
 * scripts/site-routes.json) is rejected with a 404 markdown body before any
 * filesystem access — this also closes a path-traversal vector (OWASP A01).
 */
export default function handler(req, res) {
  const rawPath = typeof req.query.path === "string" ? req.query.path : "/";
  const cleanPath = rawPath || "/";

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");

  if (!isMarkdownRoute(cleanPath)) {
    res.status(404).send(buildNotFoundMarkdown(cleanPath));
    return;
  }

  try {
    // Resolve the dist directory (same level as api/ in the Vercel deployment)
    const distDir = path.resolve(process.cwd(), "dist");
    const filePath =
      cleanPath === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, cleanPath.replace(/^\//, ""), "index.html");

    const html = fs.readFileSync(filePath, "utf-8");

    // --- Extract metadata ---
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/);
    const title = titleMatch?.[1] || "SmartConnect AI";

    const descMatch = html.match(
      /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
    );
    const description = descMatch?.[1] || "";

    // --- Extract content from #root div ---
    // Capture everything between <div id="root"...> and the next <script or <style tag
    const rootMatch = html.match(/<div\s+id="root"[^>]*>([\s\S]*?)<\/div>\s*</);
    const rootContent = rootMatch?.[1] || html;

    // Clean React hydration markers and SSR comments
    const cleanContent = rootContent
      .replace(/<!--\s*\?|\?\s*-->/g, "")
      .replace(/<!--ssr-outlet-->/g, "")
      .replace(/<!--\$-->/g, "")
      .replace(/<!--\/\$-->/g, "")
      .replace(/<!--\[-->/g, "")
      .replace(/<!--\]-->/g, "")
      .replace(/\s*$/, "")
      .trim();

    // --- Convert to Markdown ---
    const markdownBody = turndownService.turndown(cleanContent);

    const markdown = [
      `# ${title}`,
      description ? `> ${description}\n` : "",
      markdownBody,
      "",
      `---\n_Source: [https://digitalizatenerife.es${cleanPath}](https://digitalizatenerife.es${cleanPath})_`,
    ]
      .filter(Boolean)
      .join("\n");

    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    // The markdown body is a non-canonical representation of the HTML page
    // (design.md D5, http-surface-hardening) — point back at the HTML
    // canonical URL and keep this response itself out of the index.
    res.setHeader(
      "Link",
      `<https://digitalizatenerife.es${cleanPath}>; rel="canonical"`,
    );
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader("Vary", "Accept");
    res.status(200).send(markdown);
  } catch (err) {
    console.error("[negotiate] Conversion failed:", err);

    // Known route, but the prerendered file is missing or unreadable (e.g.
    // dist/ not built yet in a local/dev run). Graceful minimal markdown —
    // never the removed _spa.html fallback (design.md D7).
    res
      .status(200)
      .send(
        [
          `# SmartConnect AI`,
          ``,
          `> IA, automatización y hardware inteligente para negocios locales en Tenerife y Canarias.`,
          ``,
          `Error generando contenido completo para ${cleanPath}.`,
          `Visita la página original: https://digitalizatenerife.es${cleanPath}`,
          ``,
          `## Enlaces rápidos`,
          ``,
          buildQuickLinks(),
        ].join("\n"),
      );
  }
}
