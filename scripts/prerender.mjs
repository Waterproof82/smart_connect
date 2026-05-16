import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.resolve(distDir, "index.html");

// Routes to prerender (public product pages only — NOT dashboard/admin)
const routes = [
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
];

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
  }

  console.log("\n🎉 SSG complete! Routes prerendered:", routes.join(", "));
}

prerender().catch(console.error);
