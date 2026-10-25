import fs from "node:fs";
import path from "node:path";
import { PRERENDERED_PATHS } from "../../src/shared/routing/prerenderedRoutes";
import { PRERENDERED_ROUTES } from "../../src/clientRoutes";

/**
 * D5 guard (design.md): "/tarjetas-nfc" needs FOUR registration points, not
 * two. Missing any one produces a route that passes tsc/lint/Jest but
 * serves a blank/broken page (or zero prerendered HTML) in production.
 * This test asserts all four points, plus the redirect retarget.
 *
 * Points 1-2 were rewritten (design.md shared-app-shell) to import-based
 * checks: both entries now build their <Route> elements from the shared
 * PRERENDERED_PATHS table via prerenderedRouteElements(), so there is no
 * more per-page source-text pattern to regex-match in entry-client.tsx or
 * entry-server.tsx. The server-side component identity
 * (SERVER_PAGES["/tarjetas-nfc"] === TapReviewPage) is asserted in
 * src/__tests__/pageMaps.test.tsx (Vitest) — Jest must not import
 * serverPages.ts, a page-map module.
 */
const SRC = path.resolve(__dirname, "../../src");
const ROOT = path.resolve(__dirname, "../..");

const read = (absPath: string) => fs.readFileSync(absPath, "utf-8");

describe("/tarjetas-nfc route registration (D5 — four points)", () => {
  it("1) /tarjetas-nfc is registered in the shared prerendered path table, and the client route loader exposes a working preload()", async () => {
    expect(PRERENDERED_PATHS).toContain("/tarjetas-nfc");
    expect(PRERENDERED_ROUTES["/tarjetas-nfc"]).toBeDefined();
    await expect(
      PRERENDERED_ROUTES["/tarjetas-nfc"].preload(),
    ).resolves.toBeUndefined();
  });

  it("2) entry-server.tsx builds its <Routes> from the shared table (server-side TapReviewPage identity is asserted in pageMaps.test.tsx, Vitest)", () => {
    const source = read(path.join(SRC, "entry-server.tsx"));
    expect(source).toMatch(/prerenderedRouteElements\(SERVER_PAGES\)/);
  });

  it("3) scripts/site-routes.json: includes /tarjetas-nfc in the prerendered route table", () => {
    // seo-geo-p0-fixes PR#2 (design.md §1.2): prerender.mjs no longer hardcodes
    // a `const routes = [...]` literal — it reads scripts/site-routes.json,
    // the single source of truth also consumed by sitemap generation and
    // routeParity.test.ts. This assertion now targets that file instead.
    const siteRoutes = JSON.parse(
      read(path.join(ROOT, "scripts", "site-routes.json")),
    );
    const paths = siteRoutes.routes.map((r: { path: string }) => r.path);
    expect(paths).toContain("/tarjetas-nfc");
  });

  it("4) vercel.json: has a rewrite for /tarjetas-nfc → /tarjetas-nfc/index.html", () => {
    const vercelJson = JSON.parse(read(path.join(ROOT, "vercel.json")));
    const rewrite = vercelJson.rewrites.find(
      (r: { source: string; destination: string }) =>
        r.source === "/tarjetas-nfc",
    );
    expect(rewrite).toBeDefined();
    expect(rewrite.destination).toBe("/tarjetas-nfc/index.html");
  });

  it("4b) vercel.json: /(|about) cache-header matcher also covers /tarjetas-nfc", () => {
    const vercelJson = JSON.parse(read(path.join(ROOT, "vercel.json")));
    const cacheHeaderEntry = vercelJson.headers.find(
      (h: { source: string }) => h.source.includes("tarjetas-nfc"),
    );
    expect(cacheHeaderEntry).toBeDefined();
  });

  it("retargets the /tap-review redirect from '/' to '/tarjetas-nfc' (preserves link equity)", () => {
    const vercelJson = JSON.parse(read(path.join(ROOT, "vercel.json")));
    const redirect = vercelJson.redirects.find(
      (r: { source: string }) => r.source === "/tap-review",
    );
    expect(redirect).toBeDefined();
    expect(redirect.destination).toBe("/tarjetas-nfc");
  });
});
