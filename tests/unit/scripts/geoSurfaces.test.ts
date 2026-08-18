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
  "public/.well-known/api-catalog",
  "public/.well-known/oauth-protected-resource",
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

  it("both .well-known JSON surfaces parse cleanly", () => {
    expect(() =>
      JSON.parse(read("public/.well-known/api-catalog")),
    ).not.toThrow();
    expect(() =>
      JSON.parse(read("public/.well-known/oauth-protected-resource")),
    ).not.toThrow();
  });

  it("api-catalog and oauth-protected-resource have no reference to /docs/api or /privacy", () => {
    const apiCatalog = read("public/.well-known/api-catalog");
    const oauthResource = read("public/.well-known/oauth-protected-resource");

    expect(apiCatalog).not.toMatch(/\/docs\/api/);
    expect(oauthResource).not.toMatch(/\/docs\/api/);
    expect(apiCatalog).not.toMatch(
      /https:\/\/digitalizatenerife\.es\/privacy(?!\w)/,
    );

    const parsedCatalog = JSON.parse(apiCatalog);
    const privacyLink = parsedCatalog.linkset[0].links.find(
      (l: { rel: string }) => l.rel === "privacy-policy",
    );
    expect(privacyLink.href).toBe(
      "https://digitalizatenerife.es/legal/privacidad",
    );
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
