import fs from "node:fs";
import path from "node:path";

// S5 (seo-audit-followups): design.md D5 — Vercel header-rule precedence
// and header-vs-rewrite matching are UNVERIFIED (see design.md Appendix),
// so the config alone cannot be trusted to keep a config-level Link/
// X-Robots-Tag off a markdown response under every ordering. The handler
// (api/negotiate.mjs, see negotiateApi.test.ts) is the only header source
// these tests rely on for the markdown response itself; this file only
// checks that the config-level rules are *structured* per D5 (api/ excluded
// from "index, follow", the ai-readable Link rule carries the same
// `missing` condition, and /api/(.*) gets its own noindex rule).

const ROOT = path.resolve(__dirname, "../../../");

interface HeaderRule {
  source: string;
  missing?: Array<{ type: string; key?: string; value?: string }>;
  headers: Array<{ key: string; value: string }>;
}

const vercel = JSON.parse(
  fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8"),
) as { headers: HeaderRule[] };

const MARKDOWN_MISSING = {
  type: "header",
  key: "accept",
  value: ".*text/markdown.*",
};

describe("vercel.json — header rules exclude /api/ and markdown requests (design.md D5)", () => {
  it("the index, follow rule source excludes admin/panel/login/_spa AND api/", () => {
    const indexFollowRule = vercel.headers.find((h) =>
      h.headers.some(
        (header) => header.key === "X-Robots-Tag" && header.value === "index, follow",
      ),
    );
    expect(indexFollowRule).toBeDefined();
    expect(indexFollowRule!.source).toBe(
      "/((?!admin|panel|login|_spa|api/).*)",
    );
  });

  it("the index, follow rule does not apply to markdown-negotiated requests", () => {
    const indexFollowRule = vercel.headers.find((h) =>
      h.headers.some(
        (header) => header.key === "X-Robots-Tag" && header.value === "index, follow",
      ),
    );
    expect(indexFollowRule!.missing).toContainEqual(MARKDOWN_MISSING);
  });

  it("a dedicated /api/(.*) rule sends X-Robots-Tag: noindex", () => {
    const apiRule = vercel.headers.find((h) => h.source === "/api/(.*)");
    expect(apiRule).toBeDefined();
    expect(apiRule!.headers).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex",
    });
  });

  it("the ai-readable Link rule does not apply to markdown-negotiated requests", () => {
    const linkRule = vercel.headers.find(
      (h) =>
        h.headers.some((header) => header.key === "Link") &&
        h.missing?.some(
          (m) => m.type === "header" && m.key === "accept",
        ),
    );
    expect(linkRule).toBeDefined();
    expect(linkRule!.missing).toContainEqual(MARKDOWN_MISSING);
  });

  it("the Link header no longer advertises rel=\"api-catalog\"", () => {
    const allLinkValues = vercel.headers
      .flatMap((h) => h.headers)
      .filter((h) => h.key === "Link")
      .map((h) => h.value);
    expect(allLinkValues.some((v) => v.includes('rel="api-catalog"'))).toBe(
      false,
    );
  });

  it("the Link header still advertises rel=\"ai-readable\" for /llms.txt", () => {
    const allLinkValues = vercel.headers
      .flatMap((h) => h.headers)
      .filter((h) => h.key === "Link")
      .map((h) => h.value);
    expect(
      allLinkValues.some(
        (v) => v.includes("</llms.txt>") && v.includes('rel="ai-readable"'),
      ),
    ).toBe(true);
  });

  it("the global security-headers rule (/(.*), unconditional) no longer carries Link", () => {
    const globalRule = vercel.headers.find(
      (h) => h.source === "/(.*)" && !h.missing,
    );
    expect(globalRule).toBeDefined();
    expect(globalRule!.headers.some((header) => header.key === "Link")).toBe(
      false,
    );
    // Security headers stay unconditional (always sent, markdown or not).
    expect(
      globalRule!.headers.some((header) => header.key === "Content-Security-Policy"),
    ).toBe(true);
    expect(
      globalRule!.headers.some((header) => header.key === "Content-Signal"),
    ).toBe(true);
  });
});
