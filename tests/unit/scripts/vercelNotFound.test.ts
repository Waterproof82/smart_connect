import fs from "node:fs";
import path from "node:path";

// Real HTTP 404 for unknown URLs (Search Console "crawled, not indexed"
// fix, 2026-10). Unknown paths used to hit a catch-all rewrite to
// _spa.html and answer 200 with a JS-only noindex (soft 404). Now
// vercel.json has no catch-all, so Vercel serves dist/404.html with a 404
// status — which makes an explicit rewrite mandatory for every page.
const ROOT = path.resolve(__dirname, "../../../");
const vercel = JSON.parse(
  fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"),
) as {
  trailingSlash?: boolean;
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};
const siteRoutes = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
) as { routes: Array<{ path: string }> };

describe("vercel.json — real 404 instead of a soft-404 SPA catch-all", () => {
  it("has no catch-all rewrite to _spa.html", () => {
    const catchAll = vercel.rewrites.filter(
      (r) => r.source === "/:path*" || r.source === "/(.*)",
    );
    expect(catchAll).toHaveLength(0);
  });

  it("every prerendered route has an explicit rewrite to its index.html", () => {
    for (const { path: route } of siteRoutes.routes) {
      const expected = route === "/" ? "/index.html" : `${route}/index.html`;
      const rewrite = vercel.rewrites.find((r) => r.source === route);
      expect(rewrite?.destination).toBe(expected);
    }
  });

  it("redirects trailing-slash URLs to the canonical form", () => {
    expect(vercel.trailingSlash).toBe(false);
  });

  it("serves admin/panel/login with X-Robots-Tag noindex and never marks them index", () => {
    const robotsRules = vercel.headers.filter((h) =>
      h.headers.some((x) => x.key === "X-Robots-Tag"),
    );
    const noindex = robotsRules.find((h) =>
      h.headers.some((x) => x.value === "noindex, nofollow"),
    );
    expect(noindex?.source).toMatch(/admin/);
    expect(noindex?.source).toMatch(/panel/);
    expect(noindex?.source).toMatch(/login/);
    const index = robotsRules.find((h) =>
      h.headers.some((x) => x.value === "index, follow"),
    );
    expect(index?.source).not.toBe("/(.*)");
    expect(index?.source).toMatch(/\?!admin\|panel\|login/);
  });
});

describe("prerender — writes dist/404.html from the NotFound page", () => {
  it("prerender.mjs renders the notFound variant into 404.html", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "scripts/prerender.mjs"),
      "utf-8",
    );
    expect(source).toMatch(/render\("\/404", \{ notFound: true \}\)/);
    expect(source).toMatch(/"404\.html"/);
  });

  it("entry-server.tsx exposes the notFound option and renders <NotFound />", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/entry-server.tsx"),
      "utf-8",
    );
    expect(source).toMatch(/notFound\?: boolean/);
    expect(source).toMatch(/<NotFound \/>/);
  });

  it("NotFound declares noindex", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/features/landing/presentation/components/NotFound.tsx"),
      "utf-8",
    );
    expect(source).toMatch(/name="robots" content="noindex/);
  });
});
