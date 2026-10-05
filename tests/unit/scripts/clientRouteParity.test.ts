import fs from "node:fs";
import path from "node:path";
import { PRERENDERED_ROUTES } from "../../../src/clientRoutes";

// design.md D1/D2 (seo-audit-followups, S1): the client route-loader map
// (src/clientRoutes.tsx) must stay in lockstep with scripts/site-routes.json
// and entry-server.tsx's <Routes> table, or a route can silently stop being
// preloaded on the client (regressing React error #421) or stop being
// prerendered on the server without anyone noticing.
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

describe("client route loader parity (design.md D1/D2, S1)", () => {
  it("loader map keys ∪ {'/'} equals site-routes.json paths equals entry-server.tsx <Routes> paths", () => {
    const loaderPaths = new Set([...Object.keys(PRERENDERED_ROUTES), "/"]);
    const sitePaths = new Set(readSiteRoutePaths());
    const serverPaths = new Set(extractServerRoutePaths());

    expect(loaderPaths).toEqual(sitePaths);
    expect(loaderPaths).toEqual(serverPaths);
    // Sanity check the extraction itself isn't vacuously matching zero
    // routes (same guard rationale as routeParity.test.ts).
    expect(loaderPaths.size).toBe(9);
  });

  it("entry-client.tsx has no lazy( calls besides the admin chunk", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/entry-client.tsx"),
      "utf-8",
    );
    const lazyMatches = [...source.matchAll(/\blazy\(/g)];

    expect(lazyMatches).toHaveLength(1);
    expect(source).toMatch(/const AdminPanel = lazy\(/);
  });
});
