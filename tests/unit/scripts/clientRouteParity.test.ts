import fs from "node:fs";
import path from "node:path";
import { PRERENDERED_ROUTES } from "../../../src/clientRoutes";
import { PRERENDERED_PATHS } from "../../../src/shared/routing/prerenderedRoutes";

// design.md (shared-app-shell, rev 2): the client route-loader map
// (src/clientRoutes.tsx) must stay in lockstep with the shared
// `PRERENDERED_PATHS` table, which is itself checked against
// scripts/site-routes.json by routeParity.test.ts — one source of truth
// instead of three hand-copied lists.
const ROOT = path.resolve(__dirname, "../../../");

describe("client route loader parity (design.md shared-app-shell)", () => {
  it("PRERENDERED_ROUTES keys equal PRERENDERED_PATHS minus '/'", () => {
    const loaderPaths = new Set(Object.keys(PRERENDERED_ROUTES));
    const expected = new Set(
      PRERENDERED_PATHS.filter((p): boolean => p !== "/"),
    );

    expect(loaderPaths).toEqual(expected);
    // Sanity check the comparison isn't vacuously matching zero routes.
    expect(loaderPaths.size).toBe(PRERENDERED_PATHS.length - 1);
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
