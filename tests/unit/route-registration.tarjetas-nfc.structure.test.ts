import fs from "node:fs";
import path from "node:path";

/**
 * D5 guard (design.md): "/tarjetas-nfc" needs FOUR registration points, not
 * two. Missing any one produces a route that passes tsc/lint/Jest but
 * serves a blank/broken page (or zero prerendered HTML) in production.
 * This test asserts all four points, plus the redirect retarget, via
 * source-text checks (no jest-environment-jsdom in this repo).
 */
const SRC = path.resolve(__dirname, "../../src");
const ROOT = path.resolve(__dirname, "../..");

const read = (absPath: string) => fs.readFileSync(absPath, "utf-8");

describe("/tarjetas-nfc route registration (D5 — four points)", () => {
  it("1) entry-client.tsx: lazy-imports TapReviewPage and registers the route (mirrors /about)", () => {
    const source = read(path.join(SRC, "entry-client.tsx"));
    expect(source).toMatch(
      /const TapReviewPage = lazy\(\s*\(\)\s*=>\s*\n?\s*import\(["']@features\/tap-review\/presentation\/TapReviewPage["']\)/,
    );
    expect(source).toMatch(
      /<Route path="\/tarjetas-nfc" element={<TapReviewPage \/>} \/>/,
    );
  });

  it("2) entry-server.tsx: eager-imports TapReviewPage and registers the route (mirrors /about)", () => {
    const source = read(path.join(SRC, "entry-server.tsx"));
    expect(source).toMatch(
      /import TapReviewPage from ["']\.\/features\/tap-review\/presentation\/TapReviewPage["']/,
    );
    expect(source).toMatch(
      /<Route path="\/tarjetas-nfc" element={<TapReviewPage \/>} \/>/,
    );
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
