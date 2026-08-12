import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeSitemap } from "./sitemap.mjs";

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

async function prerender() {
  if (!fs.existsSync(templatePath)) {
    console.error(
      `Template not found at ${templatePath}. Run "vite build" first.`,
    );
    process.exit(1);
  }

  // Save the original SPA shell before overwriting it with prerendered content.
  // This is used by Vercel for non-prerendered routes (tap-review, admin, etc.).
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

  const renderedRoutes = [];
  for (const route of routes) {
    const { html: appHtml, head } = render(route);

    // Inject rendered HTML into #root, and helmet head tags before </head>
    let result = template
      .replace("<!--ssr-outlet-->", appHtml)
      .replace("</head>", `${head}\n</head>`);

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

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
