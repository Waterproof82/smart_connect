import { packageNameFromId, vendorChunkFor } from "../../../vite-manual-chunks";

// design.md D7 (sdd/core-web-vitals-perf): manualChunks substring matching
// (`id.includes("react")`) pulls lucide-react, react-router-dom,
// react-helmet-async, react-hook-form, react-icons, and @hookform/resolvers
// into vendor-react by accident. These tests lock in exact package-name
// matching instead, using the LAST "/node_modules/" segment so pnpm's
// nested ".pnpm/<pkg>@<version>/node_modules/<pkg>/..." paths resolve to
// the real package, and so scoped packages (@supabase/*) keep their scope.

describe("packageNameFromId", () => {
  it("extracts the package name from a POSIX node_modules id", () => {
    expect(
      packageNameFromId("/repo/node_modules/react-dom/index.js"),
    ).toBe("react-dom");
  });

  it("normalizes Windows backslashes before extracting the package name", () => {
    expect(
      packageNameFromId(
        "C:\\Users\\dev\\repo\\node_modules\\react\\index.js",
      ),
    ).toBe("react");
  });

  it("resolves pnpm's nested .pnpm/<pkg>@<version>/node_modules/<pkg> id to the real package", () => {
    expect(
      packageNameFromId(
        "/repo/node_modules/.pnpm/react-dom@18.2.0/node_modules/react-dom/index.js",
      ),
    ).toBe("react-dom");
  });

  it("resolves pnpm ids with Windows backslashes", () => {
    expect(
      packageNameFromId(
        "C:\\repo\\node_modules\\.pnpm\\lucide-react@0.300.0\\node_modules\\lucide-react\\dist\\esm\\index.js",
      ),
    ).toBe("lucide-react");
  });

  it("keeps the scope for scoped packages", () => {
    expect(
      packageNameFromId(
        "/repo/node_modules/@supabase/supabase-js/dist/module/index.js",
      ),
    ).toBe("@supabase/supabase-js");
  });

  it("keeps the scope for scoped pnpm ids", () => {
    expect(
      packageNameFromId(
        "/repo/node_modules/.pnpm/@supabase+supabase-js@2.0.0/node_modules/@supabase/supabase-js/dist/module/index.js",
      ),
    ).toBe("@supabase/supabase-js");
  });

  it("returns undefined for ids with no node_modules segment", () => {
    expect(packageNameFromId("/repo/src/App.tsx")).toBeUndefined();
  });
});

describe("vendorChunkFor", () => {
  it("maps react to vendor-react", () => {
    expect(vendorChunkFor("/repo/node_modules/react/index.js")).toBe(
      "vendor-react",
    );
  });

  it("maps react-dom to vendor-react", () => {
    expect(vendorChunkFor("/repo/node_modules/react-dom/index.js")).toBe(
      "vendor-react",
    );
  });

  it("maps scheduler to vendor-react", () => {
    expect(vendorChunkFor("/repo/node_modules/scheduler/index.js")).toBe(
      "vendor-react",
    );
  });

  it("maps @supabase/supabase-js to vendor-supabase", () => {
    expect(
      vendorChunkFor(
        "/repo/node_modules/@supabase/supabase-js/dist/module/index.js",
      ),
    ).toBe("vendor-supabase");
  });

  it("maps @supabase/postgrest-js to vendor-supabase", () => {
    expect(
      vendorChunkFor(
        "/repo/node_modules/@supabase/postgrest-js/dist/index.js",
      ),
    ).toBe("vendor-supabase");
  });

  it("maps lucide-react to vendor-lucide", () => {
    expect(
      vendorChunkFor("/repo/node_modules/lucide-react/dist/esm/index.js"),
    ).toBe("vendor-lucide");
  });

  // Substring-collision regressions — the bug this PR fixes.
  it.each([
    "react-router-dom",
    "react-helmet-async",
    "react-hook-form",
    "react-icons",
    "@hookform/resolvers",
    "recharts",
    "react-redux",
  ])("does NOT map %s to vendor-react (substring collision)", (pkg) => {
    expect(
      vendorChunkFor(`/repo/node_modules/${pkg}/index.js`),
    ).toBeUndefined();
  });

  it("returns undefined for non-node_modules ids (app source)", () => {
    expect(vendorChunkFor("/repo/src/App.tsx")).toBeUndefined();
  });
});
