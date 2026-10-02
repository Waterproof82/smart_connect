import fs from "node:fs";
import path from "node:path";
import { AGENT_PAGE_PATHS } from "@shared/config/agentRoutes";

// design.md (agent-surface-drift) — scripts/site-routes.json is the single
// source of truth for every agent surface (middleware.ts, the dev Vite
// plugin, api/negotiate.mjs, src/WebMCP.ts). This test guards all 4
// consumers against drift in either direction (missing live route or
// lingering dead route).
const ROOT = path.resolve(__dirname, "../../");

const readSiteRoutePaths = (): string[] => {
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
  );
  return data.routes.map((r: { path: string }) => r.path);
};

describe("agentRoutes.ts — AGENT_PAGE_PATHS matches site-routes.json (Phase 1)", () => {
  it("has exactly 9 entries (extraction sanity check)", () => {
    expect(AGENT_PAGE_PATHS).toHaveLength(9);
  });

  it("deep-equals scripts/site-routes.json paths, in order", () => {
    const sitePaths = readSiteRoutePaths();
    expect(AGENT_PAGE_PATHS).toEqual(sitePaths);
  });
});

describe("middleware.ts — matcher parity and runtime (Phase 2, design.md D1/D2)", () => {
  const readMiddlewareSource = (): string =>
    fs.readFileSync(path.join(ROOT, "middleware.ts"), "utf-8");

  function extractMatcherPaths(source: string): string[] {
    const matcherBlock = source.match(/matcher\s*:\s*\[([\s\S]*?)\]/);
    if (!matcherBlock) return [];
    return [...matcherBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }

  it("matcher is a static literal array with exactly 9 paths (extraction sanity check)", () => {
    const matcherPaths = extractMatcherPaths(readMiddlewareSource());
    expect(matcherPaths).toHaveLength(9);
  });

  it("matcher path set exactly equals scripts/site-routes.json, ignoring order", () => {
    const matcherPaths = extractMatcherPaths(readMiddlewareSource());
    const sitePaths = readSiteRoutePaths();
    expect(new Set(matcherPaths)).toEqual(new Set(sitePaths));
  });

  it("declares runtime: \"nodejs\" in the exported config", () => {
    const source = readMiddlewareSource();
    expect(source).toMatch(/runtime\s*:\s*["']nodejs["']/);
  });

  it("imports next/rewrite from @vercel/functions, not the deprecated @vercel/edge", () => {
    const source = readMiddlewareSource();
    expect(source).toMatch(/from\s+["']@vercel\/functions["']/);
    expect(source).not.toMatch(/@vercel\/edge/);
  });
});

describe("src/WebMCP.ts — get_page_content_markdown enum parity (Phase 4, design.md D4)", () => {
  const readWebMcpSource = (): string =>
    fs.readFileSync(path.join(ROOT, "src/WebMCP.ts"), "utf-8");

  it("references AGENT_PAGE_PATHS instead of a hand-written enum", () => {
    const source = readWebMcpSource();
    expect(source).toMatch(/AGENT_PAGE_PATHS/);
  });

  it("no longer contains the dead /contacto or /servicios route literals anywhere in the file", () => {
    const source = readWebMcpSource();
    // The 2 get_contact_info literals point at the live #contacto anchor
    // (https://digitalizatenerife.es/#contacto, guarded separately by
    // napAndAgentSurfaces.test.ts) — never the bare dead route.
    expect(source).not.toMatch(/"\/contacto"/);
    expect(source).not.toMatch(/"\/servicios"/);
  });
});

describe("vite.config.ts — explicit .ts import extension (Phase 5, design.md D6)", () => {
  it("imports the md-negotiation plugin with an explicit .ts extension", () => {
    const source = fs.readFileSync(path.join(ROOT, "vite.config.ts"), "utf-8");
    expect(source).toMatch(
      /from\s+["']\.\/vite-plugin-md-negotiation\.ts["']/,
    );
  });
});

describe("vite-plugin-md-negotiation.ts — route parity (Phase 4, design.md D4)", () => {
  const readPluginSource = (): string =>
    fs.readFileSync(path.join(ROOT, "vite-plugin-md-negotiation.ts"), "utf-8");

  it("references isAgentPagePath instead of an inline pageRoutes literal", () => {
    const source = readPluginSource();
    expect(source).toMatch(/isAgentPagePath/);
    expect(source).not.toMatch(/const\s+pageRoutes\s*=\s*\[/);
  });

  it("no longer contains the dead /contacto or /servicios route literals", () => {
    const source = readPluginSource();
    expect(source).not.toMatch(/"\/contacto"/);
    expect(source).not.toMatch(/"\/servicios"/);
  });
});
