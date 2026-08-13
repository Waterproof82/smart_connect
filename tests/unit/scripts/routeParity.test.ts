import fs from "node:fs";
import path from "node:path";

// design.md §1.7 (seo-geo-p0-fixes, PR#2) — the piece that makes the fix
// permanent: adding an SSR route without a matching sitemap entry, or vice
// versa, fails CI. Deliberately excludes entry-client.tsx: that file
// legitimately carries extra non-prerendered routes (/admin, *).
const ROOT = path.resolve(__dirname, "../../../");

function extractServerRoutePaths(): string[] {
  const source = fs.readFileSync(
    path.join(ROOT, "src/entry-server.tsx"),
    "utf-8",
  );
  const matches = [...source.matchAll(/<Route\s+path="([^"]+)"/g)];
  return matches.map((m) => m[1]);
}

function readSiteRoutePaths(): string[] {
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
  );
  return data.routes.map((r: { path: string }) => r.path);
}

describe("route parity — entry-server.tsx <-> scripts/site-routes.json (design.md §1.7)", () => {
  it("entry-server.tsx declares exactly 6 <Route> paths (extraction sanity check)", () => {
    // R4: assert length before comparing sets, so a broken regex extraction
    // (e.g. entry-server.tsx switching to a route map) fails loudly instead
    // of silently matching zero routes and passing a vacuous set-equality.
    const serverPaths = extractServerRoutePaths();
    expect(serverPaths).toHaveLength(6);
  });

  it("the set of SSR routes exactly equals the set of routes in site-routes.json", () => {
    const serverPaths = extractServerRoutePaths();
    const sitePaths = readSiteRoutePaths();

    expect(new Set(serverPaths)).toEqual(new Set(sitePaths));
    expect(serverPaths).toHaveLength(sitePaths.length);
  });
});
