import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// See design.md §4.7 for the full rationale (seo-geo-p0-fixes, PR#1).
//
// PR#2 (design.md §6, revert-independence ADR): LIVE_ROUTES is now read from
// scripts/site-routes.json — the single source of truth also consumed by
// prerender.mjs and routeParity.test.ts — instead of PR#1's literal
// placeholder array. This is the one line the ADR expected to change across
// the two PRs; every other assertion in this file is untouched.

const ROOT = path.resolve(__dirname, "../../../");

const read = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

const LIVE_ROUTES: string[] = JSON.parse(
  read("scripts/site-routes.json"),
).routes.map((r: { path: string }) => r.path);

// Files scanned for dead/redirected URLs (design.md §4.7 guard #2).
const SURFACE_FILES = [
  "public/llms.txt",
  "public/.well-known/llms.txt",
  "public/.well-known/agent-skills/index.json",
  "public/robots.txt",
];

function extractDigitalizaUrls(source: string): string[] {
  return source.match(/https:\/\/digitalizatenerife\.es[^\s"')\]]*/g) ?? [];
}

function pathOf(url: string): string {
  const rest = url.replace("https://digitalizatenerife.es", "");
  return rest === "" ? "/" : rest;
}

// S6 (seo-audit-followups): agent-surface-routes spec ("Agent Surfaces
// Match Live Site") + organization-identity spec ("llms.txt and Agent
// Skills Hash Consistency") — llms.txt must list the live 4-service
// product set in design.md's order, drop the unverified WCAG claim, state
// the real installed stack majors (React 18.3.1, Tailwind 4.3.3 per
// node_modules), and the real live route count (9, from site-routes.json).
describe("geoSurfaces guard (design.md Interfaces/Contracts) — live service list, stack, route count, registerTool wording", () => {
  const llmsTxt = read("public/llms.txt");
  const agentSkills = JSON.parse(
    read("public/.well-known/agent-skills/index.json"),
  );

  it("lists the 4 live services, in design.md's order", () => {
    const servicesSection = llmsTxt
      .split("## Servicios principales")[1]
      ?.split(/\n## /)[0];
    expect(servicesSection).toBeTruthy();

    const expectedOrder = [
      "Carta Digital",
      "Tarjetas NFC",
      "TPV",
      "Chatbots IA",
    ];
    const indices = expectedOrder.map((label) => servicesSection!.indexOf(label));
    expect(indices.every((i) => i !== -1)).toBe(true);
    expect([...indices].sort((a, b) => a - b)).toEqual(indices);
  });

  // design.md's Interfaces/Contracts copy for this line is itself
  // "Diseñado siguiendo WCAG 2.1 AA (sin auditoría externa)" — the point
  // of the fix is the qualifier, not banning the string "WCAG 2.1 AA"
  // outright (the old text made it an unqualified conformance claim).
  it("does not claim unverified WCAG conformance", () => {
    expect(llmsTxt).toMatch(/WCAG 2\.1 AA \(sin auditoría externa\)/);
  });

  it("states the real installed React/Vite/TypeScript/Tailwind majors", () => {
    expect(llmsTxt).toMatch(/React 18/);
    expect(llmsTxt).toMatch(/Vite 8/);
    expect(llmsTxt).toMatch(/TypeScript 5/);
    expect(llmsTxt).toMatch(/Tailwind CSS 4/);
  });

  it("states the real live route count (9 rutas)", () => {
    expect(llmsTxt).toMatch(/9 rutas/);
  });

  it("webmcp-tools wording uses registerTool(), not the stale provideContext()", () => {
    const webmcpTools = agentSkills.skills.find(
      (s: { name: string }) => s.name === "webmcp-tools",
    );
    expect(webmcpTools).toBeDefined();
    expect(webmcpTools.description).toMatch(/registerTool\(\)/);
    expect(webmcpTools.description).not.toMatch(/provideContext\(\)/);
  });
});

describe("geoSurfaces guard (design.md §4.7) — no dead URLs, honest hashes, valid JSON", () => {
  it("product-information sha256 matches the LF-normalized hash of public/llms.txt", () => {
    const llmsTxt = read("public/llms.txt").replace(/\r\n/g, "\n");
    const expectedHash = crypto
      .createHash("sha256")
      .update(llmsTxt)
      .digest("hex");

    const agentSkills = JSON.parse(
      read("public/.well-known/agent-skills/index.json"),
    );
    const productInfo = agentSkills.skills.find(
      (s: { name: string }) => s.name === "product-information",
    );

    expect(productInfo).toBeDefined();
    expect(productInfo.sha256).toBe(expectedHash);
  });

  it("contact-request, markdown-negotiation, and webmcp-tools carry no sha256 field", () => {
    const agentSkills = JSON.parse(
      read("public/.well-known/agent-skills/index.json"),
    );

    for (const name of [
      "contact-request",
      "markdown-negotiation",
      "webmcp-tools",
    ]) {
      const skill = agentSkills.skills.find(
        (s: { name: string }) => s.name === name,
      );
      expect(skill).toBeDefined();
      expect(skill.sha256).toBeUndefined();
    }
  });

  it("contact-request points at the live #contacto anchor, not the dead /contacto route", () => {
    const agentSkills = JSON.parse(
      read("public/.well-known/agent-skills/index.json"),
    );
    const contactRequest = agentSkills.skills.find(
      (s: { name: string }) => s.name === "contact-request",
    );

    expect(contactRequest.url).toBe("https://digitalizatenerife.es/#contacto");
  });

  it("no static surface references a dead, redirected, or unknown digitalizatenerife.es URL", () => {
    const vercelConfig = JSON.parse(read("vercel.json"));
    const redirectSources: string[] = vercelConfig.redirects.map(
      (r: { source: string }) => r.source,
    );

    const violations: string[] = [];

    for (const file of SURFACE_FILES) {
      const source = read(file);
      for (const url of extractDigitalizaUrls(source)) {
        const fullPath = pathOf(url);
        const [basePath] = fullPath.split("#");
        const normalizedBase = basePath === "" ? "/" : basePath;

        const isWellKnown = normalizedBase.startsWith("/.well-known");
        const isDiscoveryFile = ["/robots.txt", "/sitemap.xml", "/llms.txt"].includes(
          normalizedBase,
        );
        const isLiveRoute = LIVE_ROUTES.includes(normalizedBase);
        const isRedirectSource = redirectSources.includes(normalizedBase);

        if (isRedirectSource || !(isWellKnown || isDiscoveryFile || isLiveRoute)) {
          violations.push(`${file}: ${url}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
