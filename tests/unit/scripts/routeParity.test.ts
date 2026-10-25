import fs from "node:fs";
import path from "node:path";
import { PRERENDERED_PATHS } from "../../../src/shared/routing/prerenderedRoutes";

// design.md (shared-app-shell, rev 2) — PRERENDERED_PATHS is now the single
// source of truth both entries build their <Routes> from (via
// prerenderedRouteElements). It must still stay in lockstep with
// scripts/site-routes.json, which also feeds the sitemap.
const ROOT = path.resolve(__dirname, "../../../");

function readSiteRoutePaths(): string[] {
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
  );
  return data.routes.map((r: { path: string }) => r.path);
}

describe("route parity — PRERENDERED_PATHS <-> scripts/site-routes.json (design.md shared-app-shell)", () => {
  it("PRERENDERED_PATHS has no duplicate paths", () => {
    expect(new Set(PRERENDERED_PATHS).size).toBe(PRERENDERED_PATHS.length);
  });

  it("the set of PRERENDERED_PATHS exactly equals the set of routes in site-routes.json", () => {
    const sitePaths = readSiteRoutePaths();
    expect(new Set(PRERENDERED_PATHS)).toEqual(new Set(sitePaths));
  });

  it("PRERENDERED_PATHS length equals site-routes.json length (never a hardcoded count)", () => {
    const sitePaths = readSiteRoutePaths();
    expect(PRERENDERED_PATHS.length).toBe(sitePaths.length);
  });
});
