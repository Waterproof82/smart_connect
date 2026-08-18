/**
 * index.html Consent Mode v2 structure test.
 *
 * `index.html` is copied verbatim into every SSG page and `_spa.html` by
 * `scripts/prerender.mjs` (design.md), so one edit here covers every
 * served HTML file. Source-text assertions (not a DOM parse) mirror the
 * repo's `.structure.test.ts` convention — this is the pre-hydration
 * inline script gate that determines whether GA4 fires at all.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../");
const INDEX_HTML_PATH = path.join(ROOT, "index.html");
const VERCEL_JSON_PATH = path.join(ROOT, "vercel.json");
const ANALYTICS_SCOPE_PATH = path.join(
  ROOT,
  "src/shared/utils/analyticsScope.ts",
);

describe("index.html — Consent Mode v2 (RGPD art.6 / LSSI-CE art.22.2)", () => {
  const readSource = () => fs.readFileSync(INDEX_HTML_PATH, "utf-8");

  it("calls gtag('consent','default',...) BEFORE gtag('config',...)", () => {
    const source = readSource();
    const defaultIndex = source.indexOf('"consent", "default"');
    const configIndex = source.indexOf('gtag("config"');
    expect(defaultIndex).toBeGreaterThan(-1);
    expect(configIndex).toBeGreaterThan(-1);
    expect(defaultIndex).toBeLessThan(configIndex);
  });

  it("denies all 4 ad/analytics signals by default", () => {
    const source = readSource();
    const defaultBlock = source.slice(
      source.indexOf('"consent", "default"'),
      source.indexOf('"consent", "default"') + 400,
    );
    expect(defaultBlock).toMatch(/ad_storage:\s*"denied"/);
    expect(defaultBlock).toMatch(/ad_user_data:\s*"denied"/);
    expect(defaultBlock).toMatch(/ad_personalization:\s*"denied"/);
    expect(defaultBlock).toMatch(/analytics_storage:\s*"denied"/);
  });

  it("grants functionality_storage and security_storage by default (non-consent-gated categories)", () => {
    const source = readSource();
    const defaultBlock = source.slice(
      source.indexOf('"consent", "default"'),
      source.indexOf('"consent", "default"') + 400,
    );
    expect(defaultBlock).toMatch(/functionality_storage:\s*"granted"/);
    expect(defaultBlock).toMatch(/security_storage:\s*"granted"/);
  });

  it("does NOT use wait_for_update (design.md A3 — sync restore instead)", () => {
    const source = readSource();
    expect(source).not.toMatch(/wait_for_update/);
  });

  it("restores a prior grant from localStorage sc_consent_v1 before gtag config, guarded by try/catch", () => {
    const source = readSource();
    expect(source).toMatch(/sc_consent_v1/);
    expect(source).toMatch(/try\s*\{[\s\S]*?sc_consent_v1[\s\S]*?\}\s*catch/);
  });

  it("sets window.__scAnalyticsScope from a path-guard regex excluding /admin, /panel, /login", () => {
    const source = readSource();
    expect(source).toMatch(/window\.__scAnalyticsScope/);
    expect(source).toMatch(/admin\|panel\|login/);
  });

  it("only calls gtag('config',...) when __scAnalyticsScope is true", () => {
    const source = readSource();
    expect(source).toMatch(
      /if\s*\(\s*window\.__scAnalyticsScope\s*\)\s*gtag\("config"/,
    );
  });

  it("the path-guard regex matches every /admin, /panel, /login rewrite prefix declared in vercel.json", () => {
    const source = readSource();
    const vercelSource = fs.readFileSync(VERCEL_JSON_PATH, "utf-8");
    const regexMatch = source.match(
      /\/\^\\\/\(([a-z|]+)\)\(\\\/\|\$\)\//,
    );
    expect(regexMatch).not.toBeNull();
    const guardedPrefixes = regexMatch![1].split("|");

    const vercelRewrites = JSON.parse(vercelSource).rewrites as {
      source: string;
    }[];
    const gatedRewritePrefixes = vercelRewrites
      .map((r) => r.source)
      .filter((s) => /^\/(admin|panel|login)\//.test(s))
      .map((s) => s.replace(/^\//, "").split("/")[0]);

    for (const prefix of gatedRewritePrefixes) {
      expect(guardedPrefixes).toContain(prefix);
    }
  });

  it("mirrors the exact regex from the pure, independently-testable isPublicAnalyticsPath() guard", () => {
    // index.html can't import a TS module (it's plain HTML evaluated before
    // React/Vite touch anything), so the path-guard regex is necessarily
    // duplicated here. This test is what makes that duplication safe: if
    // either copy drifts from the other, it fails loudly instead of silently
    // reintroducing the un-anchored-prefix bug analyticsScope.test.ts guards
    // against (see src/shared/utils/analyticsScope.ts for the real logic and
    // its behavioral tests).
    const htmlSource = readSource();
    const htmlRegexMatch = htmlSource.match(
      /window\.__scAnalyticsScope = !(\/\^\\\/\([a-z|]+\)\(\\\/\|\$\)\/)\.test/,
    );
    expect(htmlRegexMatch).not.toBeNull();

    const utilSource = fs.readFileSync(ANALYTICS_SCOPE_PATH, "utf-8");
    const utilRegexMatch = utilSource.match(
      /EXCLUDED_PATH_PREFIXES = (\/\^\\\/\([a-z|]+\)\(\\\/\|\$\)\/);/,
    );
    expect(utilRegexMatch).not.toBeNull();

    expect(htmlRegexMatch![1]).toBe(utilRegexMatch![1]);
  });
});
