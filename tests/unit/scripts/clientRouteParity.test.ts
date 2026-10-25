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

  // The client tree moved from entry-client.tsx into ClientApp.tsx
  // (shared-app-shell PR2), so the admin chunk is the only lazy( across both.
  it("ClientApp.tsx has no lazy( calls besides the admin chunk", () => {
    const read = (rel: string) =>
      fs.readFileSync(path.join(ROOT, rel), "utf-8");
    const clientApp = read("src/ClientApp.tsx");

    expect([...clientApp.matchAll(/\blazy\(/g)]).toHaveLength(1);
    expect(clientApp).toMatch(/const AdminPanel = lazy\(/);
    expect(read("src/entry-client.tsx")).not.toMatch(/\blazy\(/);
  });
});
