import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.resolve(distDir, "index.html");

// Routes to prerender (landing/public routes only — NOT dashboard/admin)
const routes = ["/", "/servicios", "/contacto"];

async function prerender() {
  if (!fs.existsSync(templatePath)) {
    console.error(
      `Template not found at ${templatePath}. Run "vite build" first.`,
    );
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");

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
