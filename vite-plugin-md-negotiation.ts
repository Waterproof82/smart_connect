import type { Plugin, ViteDevServer } from "vite";
import TurndownService from "turndown";
import { isAgentPagePath } from "./src/shared/config/agentRoutes.ts";

/**
 * Vite plugin: content negotiation for text/markdown in dev mode.
 * When a request includes Accept: text/markdown, SSR-renders the page
 * and returns a clean Markdown version for AI/LLM consumption.
 */
export function markdownNegotiationPlugin(): Plugin {
  return {
    name: "markdown-negotiation",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const accept = req.headers["accept"] || "";
          if (!accept.includes("text/markdown")) return next();

          const url = req.url || "/";
          const pathname = new URL(url, "http://localhost").pathname;

          // Only handle prerendered page routes (scripts/site-routes.json is
          // the single source of truth — design.md D4, agent-surface-drift)
          if (!isAgentPagePath(pathname)) return next();

          try {
            // SSR-render the page via the server entry
            const entryModule = await server.ssrLoadModule(
              "/src/entry-server.tsx",
            );
            const { render } = entryModule;
            const { html, head } = render(pathname);

            // Extract metadata from Helmet head
            const title =
              head.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ||
              "SmartConnect AI";
            const description =
              head.match(
                /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
              )?.[1] || "";

            // Convert to Markdown
            const turndownService = new TurndownService({
              headingStyle: "atx",
              codeBlockStyle: "fenced",
              emDelimiter: "*",
              linkStyle: "inlined",
            });

            const markdownBody = turndownService.turndown(html);
            const markdown = [
              `# ${title}`,
              description ? `> ${description}\n` : "",
              markdownBody,
              "",
              `---\n_Source: [https://digitalizatenerife.es${pathname}](https://digitalizatenerife.es${pathname})_`,
            ]
              .filter(Boolean)
              .join("\n");

            res.writeHead(200, {
              "Content-Type": "text/markdown; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(markdown);
          } catch (err) {
            console.error("[markdown-negotiation] SSR render failed:", err);
            next();
          }
        });
      };
    },
  };
}
