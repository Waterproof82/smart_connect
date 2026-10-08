/**
 * Source-tag builders and route filtering for the knowledge-base ingestion
 * pipeline (design.md rag-knowledge-base-refresh D9). No fs/Deno/network
 * imports — the orchestrator (Unit 7) reads `scripts/site-routes.json` and
 * passes the parsed `routes` array in here.
 */

const LEGAL_PATH_PREFIX = "/legal/";

/** @param {string} route */
export function buildSiteSource(route) {
  return `site:${route}`;
}

/** @param {string} route */
export function buildFaqSource(route) {
  return `faq:${route}`;
}

/** @param {string} file */
export function buildCuratedSource(file) {
  return `curated:${file}`;
}

/**
 * Excludes `/legal/*` routes from ingestion (privacy/cookies/terms pages are
 * redirected to by the chatbot's prompt rules, never answered from KB text).
 * @param {{ path: string }[]} routes
 */
export function filterIngestableRoutes(routes) {
  return routes.filter((route) => !route.path.startsWith(LEGAL_PATH_PREFIX));
}
