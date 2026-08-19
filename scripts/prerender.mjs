import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeSitemap } from "./sitemap.mjs";
import {
  buildProbeDocument,
  extractCriticalCss,
  collectThemeTokenCss,
  deferStylesheetLink,
  assertBodyUnchanged,
} from "./critical-css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.resolve(distDir, "index.html");
const siteRoutesPath = path.resolve(__dirname, "site-routes.json");

// Single source of truth for the prerendered/sitemap route set — see
// scripts/site-routes.json and design.md §1.2 (seo-geo-p0-fixes, PR#2).
const { origin, routes: routeTable } = JSON.parse(
  fs.readFileSync(siteRoutesPath, "utf-8"),
);
const routes = routeTable.map((route) => route.path);

// PR 2 of 2 (stacked-to-main) — per-route critical CSS inlining, see
// design.md (sdd/landing-render-blocking-css/design). Set CRITICAL_CSS=0 to
// disable this pass entirely; output is then byte-identical to the
// pre-change build (rollback lever 1 of 2 — see design.md "Rollback /
// Kill-Switch").
const CRITICAL_CSS_ENABLED = process.env.CRITICAL_CSS !== "0";

/**
 * Resolves the single built CSS asset Vite emitted under dist/assets/.
 * There must be exactly one (design.md "Verified Facts"). Fails loudly
 * (throws) rather than guessing if zero or more than one is found.
 *
 * @returns {{ cssHref: string, cssPath: string }}
 */
function resolveBuiltCssAsset() {
  const assetsDir = path.resolve(distDir, "assets");
  const cssFiles = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).filter((file) => file.endsWith(".css"))
    : [];
  if (cssFiles.length !== 1) {
    throw new Error(
      `critical-css: expected exactly 1 built CSS file in ${assetsDir}, found ${cssFiles.length} (${cssFiles.join(", ")}). Cannot resolve the critical CSS asset.`,
    );
  }
  return {
    cssHref: `/assets/${cssFiles[0]}`,
    cssPath: path.join(assetsDir, cssFiles[0]),
  };
}

/**
 * Finds the exact Vite-injected stylesheet <link> tag matching cssHref in
 * html, used as the anchor for a single atomic string replacement (style
 * injection). Intentionally NOT imported from critical-css.mjs — that
 * module owns pure CSS extraction only; prerender.mjs owns HTML assembly.
 * Keeping this local preserves the PR 1 module boundary.
 *
 * @param {string} html
 * @param {string} cssHref
 * @returns {string}
 */
function findStylesheetTag(html, cssHref) {
  const escaped = cssHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`<link\\b[^>]*\\bhref=["']${escaped}["'][^>]*>`),
  );
  if (!match) {
    throw new Error(
      `critical-css: could not find the stylesheet <link> for "${cssHref}" in the rendered document.`,
    );
  }
  return match[0];
}

async function prerender() {
  if (!fs.existsSync(templatePath)) {
    console.error(
      `Template not found at ${templatePath}. Run "vite build" first.`,
    );
    process.exit(1);
  }

  // Save the original SPA shell before overwriting it with prerendered content.
  // This is used by Vercel for non-prerendered routes (tap-review, admin, etc.).
  // NOTE: intentionally BEFORE the per-route critical-CSS pass below, and
  // never touched by it — _spa.html has no rendered body to extract critical
  // CSS from (design.md Decision 2). Its stylesheet <link> stays blocking,
  // unchanged from pre-change behavior.
  const spaFallbackPath = path.resolve(distDir, "_spa.html");
  const template = fs.readFileSync(templatePath, "utf-8");
  // Remove the ssr-outlet comment so the SPA shell shows nothing on first paint
  const spaHtml = template.replace("<!--ssr-outlet-->", "");
  fs.writeFileSync(spaFallbackPath, spaHtml);
  console.log(`💾 SPA fallback saved: ${spaFallbackPath}`);

  // Dynamically import the server build
  let render;
  try {
    const serverEntry = await import("../dist/server/entry-server.js");
    render = serverEntry.render;
  } catch (err) {
    console.error(
      "Failed to load server entry. Did you run the SSR build?",
      err,
    );
    process.exit(1);
  }

  // Critical CSS pre-work, done ONCE (not per-route): resolve the built CSS
  // asset and slice out the always-force-included theme-token layer. See
  // design.md Decision 1 — force-include, never trust the extractor for
  // :root/.light tokens, because SSR always renders theme-neutral and
  // .light is applied client-side, pre-paint, invisibly to beasties.
  let cssAsset = null;
  let themeTokenCss = "";
  if (CRITICAL_CSS_ENABLED) {
    cssAsset = resolveBuiltCssAsset();
    const builtCss = fs.readFileSync(cssAsset.cssPath, "utf-8");
    themeTokenCss = collectThemeTokenCss(builtCss);
  } else {
    console.log("⏭️  CRITICAL_CSS=0 — skipping critical CSS inlining pass.");
  }

  const renderedRoutes = [];
  for (const route of routes) {
    const { html: appHtml, head } = render(route);

    // Inject rendered HTML into #root, and helmet head tags before </head>
    let result = template
      .replace("<!--ssr-outlet-->", appHtml)
      .replace("</head>", `${head}\n</head>`);

    if (CRITICAL_CSS_ENABLED) {
      const beforeHeadPass = result;

      // Probe document: beasties decides what's critical for THIS route's
      // rendered markup. It is never written to disk — only its emitted
      // <style> text is kept; the real `result` document is never
      // re-parsed/re-serialized by beasties (design.md "Technical Approach").
      const probeHtml = buildProbeDocument({
        cssHref: cssAsset.cssHref,
        appHtml,
      });
      const criticalCss = await extractCriticalCss(probeHtml, {
        distDir,
        publicPath: "/",
        routeName: route,
      });

      // themeTokenCss already starts with LAYER_PREAMBLE (its own contract —
      // see critical-css.mjs collectThemeTokenCss), which satisfies design.md
      // Decision 1's "emit the preamble as the first line of the inline
      // <style>" requirement without duplicating it.
      const mergedCss = `${themeTokenCss}\n${criticalCss}`;

      // Single atomic replacement keyed on the exact Vite-generated <link>
      // tag: splice the critical <style> in immediately before it, then
      // defer the original link. Never touches the <body> region.
      const originalTag = findStylesheetTag(result, cssAsset.cssHref);
      const withStyle = result.replace(
        originalTag,
        `<style>${mergedCss}</style>\n${originalTag}`,
      );
      result = deferStylesheetLink(withStyle, cssAsset.cssHref);

      // Build-time self-check, not an assumption: fails loudly if head
      // processing ever mutated the <body> region.
      assertBodyUnchanged(beforeHeadPass, result);
    }

    const routeDir = path.resolve(
      distDir,
      route === "/" ? "." : route.slice(1),
    );
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.resolve(routeDir, "index.html"), result);
    console.log(`✅ Prerendered: ${route} → ${routeDir}/index.html`);
    renderedRoutes.push(route);
  }

  console.log("\n🎉 SSG complete! Routes prerendered:", routes.join(", "));

  // G4 — prerender/sitemap set identity. Trivially true today (both read
  // routeTable), but this assertion keeps it true if either side is later
  // filtered independently. See design.md §1.5.
  const sitemapPaths = routeTable.map((route) => route.path);
  const setsMatch =
    renderedRoutes.length === sitemapPaths.length &&
    renderedRoutes.every((r) => sitemapPaths.includes(r));
  if (!setsMatch) {
    throw new Error(
      `sitemap: rendered route set does not match site-routes.json. Rendered: ${renderedRoutes.join(", ")}. Table: ${sitemapPaths.join(", ")}.`,
    );
  }

  const sitemapPath = writeSitemap(distDir, origin, routeTable);
  console.log(`🗺️  Sitemap written: ${sitemapPath}`);
}

try {
  await prerender();
} catch (err) {
  console.error(err);
  process.exit(1);
}
