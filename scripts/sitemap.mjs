import fs from "node:fs";
import path from "node:path";

// Sitemap generator — see design.md §1 (seo-geo-p0-fixes, PR#2).
//
// Data-driven: reads from scripts/site-routes.json (single source of truth,
// also consumed by prerender.mjs and tests/unit/scripts/routeParity.test.ts).
// Every failure mode THROWS (never calls process.exit directly) so the
// caller's `.catch((err) => { console.error(err); process.exit(1); })`
// (see prerender.mjs) is what turns a broken sitemap into a failed build —
// consistent with the D4 fix that made that catch handler meaningful again.

/**
 * Builds the sitemap.xml document for a set of routes.
 * @param {string} origin - e.g. "https://digitalizatenerife.es" (no trailing slash)
 * @param {Array<{path: string, priority?: string, changefreq?: string, lastmod?: string}>} routes
 * @returns {string} well-formed sitemap XML
 */
export function buildSitemapXml(origin, routes) {
  // G1 — table non-empty. An empty-but-valid <urlset> is accepted by Search
  // Console and would silently deindex the site.
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error(
      "sitemap: route table is empty — refusing to write an empty <urlset>.",
    );
  }

  const loc = (p) => (p === "/" ? `${origin}/` : `${origin}${p}`);

  const body = routes
    .map((route) => {
      if (!route || typeof route.path !== "string" || route.path === "") {
        throw new Error(
          `sitemap: route entry missing a valid "path": ${JSON.stringify(route)}`,
        );
      }
      return [
        "  <url>",
        `    <loc>${loc(route.path)}</loc>`,
        route.lastmod ? `    <lastmod>${route.lastmod}</lastmod>` : null,
        route.changefreq
          ? `    <changefreq>${route.changefreq}</changefreq>`
          : null,
        route.priority ? `    <priority>${route.priority}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/**
 * Validates a generated sitemap XML string against its source routes.
 * Throws on any violation — never returns false, always throws or returns true.
 * @param {string} xml
 * @param {Array<{path: string}>} routes
 * @param {string} origin
 * @returns {true}
 */
export function validateSitemapXml(xml, routes, origin) {
  // G2 — artifact non-empty + <loc> count matches route count.
  if (!xml || Buffer.byteLength(xml, "utf-8") <= 200) {
    throw new Error(
      "sitemap: generated artifact is suspiciously small (<=200 bytes) — refusing to write it.",
    );
  }
  const locCount = (xml.match(/<loc>/g) ?? []).length;
  if (locCount !== routes.length) {
    throw new Error(
      `sitemap: <loc> count (${locCount}) does not match route count (${routes.length}).`,
    );
  }

  // G3 — every <loc> is well-formed: origin prefix, no double slash after
  // origin, no whitespace, no fragment. Anchors belong in llms.txt, never
  // in a sitemap.
  const locValues = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  for (const locValue of locValues) {
    if (!locValue.startsWith(`${origin}/`)) {
      throw new Error(
        `sitemap: malformed <loc> (missing origin prefix "${origin}/"): ${locValue}`,
      );
    }
    const rest = locValue.slice(origin.length);
    if (rest.includes("//") || /\s/.test(locValue) || locValue.includes("#")) {
      throw new Error(`sitemap: malformed <loc>: ${locValue}`);
    }
  }

  return true;
}

/**
 * Builds, validates, and writes dist/sitemap.xml.
 * @param {string} distDir - absolute path to the build output directory
 * @param {string} origin
 * @param {Array<{path: string, priority?: string, changefreq?: string, lastmod?: string}>} routes
 * @returns {string} absolute path of the written sitemap.xml
 */
export function writeSitemap(distDir, origin, routes) {
  const xml = buildSitemapXml(origin, routes);
  validateSitemapXml(xml, routes, origin);
  const sitemapPath = path.join(distDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml);
  return sitemapPath;
}
