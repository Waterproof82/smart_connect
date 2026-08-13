import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

// See design.md §1 (seo-geo-p0-fixes, PR#2) for the full rationale.
//
// scripts/sitemap.mjs is plain ESM (no TS/JSX). ts-jest's CJS-oriented
// transform for these .test.ts files cannot `import()` it directly —
// confirmed empirically ("Cannot use import statement outside a module";
// jest.config.js's transform only covers .ts(x)/.js(x), and `npm test` runs
// without --experimental-vm-modules). Rather than fall back to weaker
// source-text regex assertions (the project's existing convention for
// untestable TSX, e.g. TpvModulesSection.structure.test.ts), these tests
// spawn a real `node --input-type=module` subprocess to import and execute
// the script's exports directly — genuine behavioral coverage of pure ESM,
// with zero Jest transform involvement. prerender.mjs itself is NOT
// imported/spawned (it has build-time side effects — reads dist/, calls
// process.exit) — its exit-code fix and site-routes.json wiring are
// verified via source-text regex instead.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

const readScript = (name: string): string =>
  fs.readFileSync(path.join(SCRIPTS_DIR, name), "utf-8");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runSitemapScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/site-routes.json (design.md §1.2 — single source of truth)", () => {
  it("exists and parses as JSON", () => {
    const raw = fs.readFileSync(
      path.join(SCRIPTS_DIR, "site-routes.json"),
      "utf-8",
    );
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it("has origin https://digitalizatenerife.es and exactly the 6 prerendered routes", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(SCRIPTS_DIR, "site-routes.json"), "utf-8"),
    );
    expect(data.origin).toBe("https://digitalizatenerife.es");
    const paths = data.routes.map((r: { path: string }) => r.path);
    expect(paths).toEqual([
      "/",
      "/tarjetas-nfc",
      "/about",
      "/legal/aviso",
      "/legal/privacidad",
      "/legal/cookies",
    ]);
  });

  it("every route has priority and changefreq; lastmod is optional but present today", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(SCRIPTS_DIR, "site-routes.json"), "utf-8"),
    );
    for (const route of data.routes) {
      expect(typeof route.priority).toBe("string");
      expect(typeof route.changefreq).toBe("string");
    }
  });
});

describe("scripts/sitemap.mjs — buildSitemapXml (design.md §1.4)", () => {
  it("emits one <url> per route with <loc>, <lastmod>, <changefreq>, <priority>", () => {
    const xml = runSitemapScript(`
      import { buildSitemapXml } from "./sitemap.mjs";
      process.stdout.write(buildSitemapXml("https://example.com", [
        { path: "/", priority: "1.0", changefreq: "monthly", lastmod: "2026-01-01" },
      ]));
    `);
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<lastmod>2026-01-01</lastmod>");
    expect(xml).toContain("<changefreq>monthly</changefreq>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml.match(/<url>/g) ?? []).toHaveLength(1);
  });

  it("omits <lastmod> when a route has no lastmod (never fabricates a date)", () => {
    const xml = runSitemapScript(`
      import { buildSitemapXml } from "./sitemap.mjs";
      process.stdout.write(buildSitemapXml("https://example.com", [
        { path: "/about", priority: "0.7", changefreq: "monthly" },
      ]));
    `);
    expect(xml).not.toContain("<lastmod>");
  });

  it("preserves the trailing-slash convention: '/' gets a trailing slash, other paths do not", () => {
    const xml = runSitemapScript(`
      import { buildSitemapXml } from "./sitemap.mjs";
      process.stdout.write(buildSitemapXml("https://example.com", [
        { path: "/", priority: "1.0", changefreq: "monthly" },
        { path: "/about", priority: "0.7", changefreq: "monthly" },
      ]));
    `);
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/about</loc>");
    expect(xml).not.toContain("https://example.com/about/");
    expect(xml).not.toContain("https://example.com//about");
  });

  it("G1: throws when the route table is empty — never emits a valid-but-empty <urlset>", () => {
    expect(() =>
      runSitemapScript(`
        import { buildSitemapXml } from "./sitemap.mjs";
        buildSitemapXml("https://example.com", []);
      `),
    ).toThrow();
  });
});

describe("scripts/sitemap.mjs — writeSitemap guards (design.md §1.5 G1-G4)", () => {
  it("G2: writes an artifact whose <loc> count matches the route count", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-test-"));
    const tmpDirEscaped = JSON.stringify(tmpDir);
    runSitemapScript(`
      import { writeSitemap } from "./sitemap.mjs";
      writeSitemap(${tmpDirEscaped}, "https://digitalizatenerife.es", [
        { path: "/", priority: "1.0", changefreq: "monthly" },
        { path: "/about", priority: "0.7", changefreq: "monthly" },
      ]);
    `);
    const written = fs.readFileSync(path.join(tmpDir, "sitemap.xml"), "utf-8");
    expect(written.match(/<loc>/g) ?? []).toHaveLength(2);
    expect(Buffer.byteLength(written, "utf-8")).toBeGreaterThan(200);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("G3: every <loc> is well-formed (origin prefix, no '//', no whitespace, no '#')", () => {
    expect(() =>
      runSitemapScript(`
        import { buildSitemapXml, validateSitemapXml } from "./sitemap.mjs";
        const origin = "https://digitalizatenerife.es";
        const routes = [{ path: "/about", priority: "0.7", changefreq: "monthly" }];
        const xml = buildSitemapXml(origin, routes);
        validateSitemapXml(xml, routes, origin);
      `),
    ).not.toThrow();
  });
});

describe("scripts/prerender.mjs (design.md §1.5 D4 — silent-failure fix)", () => {
  it("the top-level catch handler exits the process non-zero, not just logs", () => {
    const source = readScript("prerender.mjs");
    // Top-level await + try/catch (preferred over a .catch() promise chain — SonarQube S7785).
    expect(source).toMatch(
      /try\s*\{\s*await\s+prerender\(\)[\s\S]*?\}\s*catch\s*\(\s*(err|e|error)\s*\)\s*\{[^}]*process\.exit\(1\)/,
    );
    // Guard against a regression back to the old console.error-only form.
    expect(source).not.toMatch(/prerender\(\)\.catch\(console\.error\)/);
  });

  it("reads scripts/site-routes.json and writes the sitemap after the render loop", () => {
    const source = readScript("prerender.mjs");
    expect(source).toMatch(/site-routes\.json/);
    expect(source).toMatch(/writeSitemap\(/);
  });
});

describe("public/sitemap.xml is deleted (design.md §1.6 — generated, not hand-maintained)", () => {
  it("does not exist in the repository", () => {
    const staticSitemapPath = path.resolve(ROOT, "public/sitemap.xml");
    expect(fs.existsSync(staticSitemapPath)).toBe(false);
  });
});
