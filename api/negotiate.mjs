import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  linkStyle: "inlined",
});

// Fallback titles for routes where SSR metadata is embedded in JS
const PAGE_TITLES = {
  "/": "SmartConnect AI — Automatización e IA para Negocios Locales",
  "/servicios": "Servicios — SmartConnect AI",
  "/contacto": "Contacto — SmartConnect AI",
  "/carta-digital": "Carta Digital Premium — SmartConnect AI",
  "/tap-review": "Tap-to-Review NFC — SmartConnect AI",
  "/about": "Sobre SmartConnect AI",
};

/**
 * Vercel Serverless Function — content negotiation for text/markdown.
 *
 * Reads the prerendered HTML from disk, extracts the #root content,
 * converts it to clean Markdown, and returns with text/markdown content-type.
 */
export default function handler(req, res) {
  const rawPath = typeof req.query.path === "string" ? req.query.path : "/";
  const cleanPath = rawPath || "/";

  try {
    // Resolve the dist directory (same level as api/ in the Vercel deployment)
    const distDir = path.resolve(process.cwd(), "dist");
    let html;
    let filePath;

    // Map route to HTML file
    if (cleanPath === "/") {
      filePath = path.join(distDir, "index.html");
    } else {
      const routeDir = cleanPath.replace(/^\//, "") || "";
      filePath = path.join(distDir, routeDir, "index.html");

      // Fallback to SPA shell if the specific page doesn't exist
      if (!fs.existsSync(filePath)) {
        filePath = path.join(distDir, "_spa.html");
      }
    }

    try {
      html = fs.readFileSync(filePath, "utf-8");
    } catch {
      // Last resort fallback
      html = fs.readFileSync(path.join(distDir, "_spa.html"), "utf-8");
    }

    // --- Extract metadata ---
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/);
    const title =
      titleMatch?.[1] || PAGE_TITLES[cleanPath] || "SmartConnect AI";

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

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(markdown);
  } catch (err) {
    console.error("[negotiate] Conversion failed:", err);

    // Graceful fallback — return minimal markdown
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
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
          `- [Inicio](https://digitalizatenerife.es/)`,
          `- [Servicios](https://digitalizatenerife.es/servicios)`,
          `- [Contacto](https://digitalizatenerife.es/contacto)`,
          `- [Sobre nosotros](https://digitalizatenerife.es/about)`,
        ].join("\n"),
      );
  }
}
