import siteRoutes from "../../../scripts/site-routes.json";

/**
 * Single source of truth for agent-surface routes (markdown negotiation,
 * WebMCP page enum). Derived from scripts/site-routes.json so every
 * consumer (middleware.ts, the dev Vite plugin, api/negotiate.mjs,
 * src/WebMCP.ts) stays in sync — see design.md (agent-surface-drift).
 */
export const AGENT_PAGE_PATHS: readonly string[] = siteRoutes.routes.map(
  (r) => r.path,
);

export const isAgentPagePath = (p: string): boolean =>
  AGENT_PAGE_PATHS.includes(p);
