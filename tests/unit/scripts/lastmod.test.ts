import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

// See design.md (seo-nap-eeat-fixes) D6-D9 + Interfaces/Contracts, and the
// existing convention in tests/unit/scripts/sitemapGeneration.test.ts:
// scripts/lastmod.mjs is plain ESM. ts-jest's CJS-oriented transform for
// .test.ts files cannot import() a .mjs directly, so these tests spawn a
// real `node --input-type=module` subprocess that imports the script and
// exercises it with a fake, injected `exec` — genuine behavioral coverage
// of pure ESM with zero real `git` process ever spawned.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runLastmodScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

const route = (overrides: Record<string, unknown>) => ({
  path: "/about",
  priority: "0.7",
  changefreq: "monthly",
  lastmod: "2026-01-01",
  sources: ["AboutPage.tsx"],
  ...overrides,
});

describe("scripts/lastmod.mjs — resolveRouteLastmods (design.md D6-D9)", () => {
  it("success: git date newer than the floor wins, and 'sources' is stripped from the output", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = (args) => {
        if (args[0] === "rev-parse") return "false";
        return "2026-09-01";
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ lastmod: "2026-01-01" }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("git");
    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].lastmod).toBe("2026-09-01");
    expect(result.routes[0].sources).toBeUndefined();
    expect(result.routes[0].path).toBe("/about");
  });

  it("floor-wins: a stale git date never overrides the newer hardcoded floor", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = (args) => {
        if (args[0] === "rev-parse") return "false";
        return "2025-01-01";
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ lastmod: "2026-01-01" }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("git");
    expect(result.routes[0].lastmod).toBe("2026-01-01");
  });

  it("git missing: exec throws ENOENT on the shallow-check call -> fallback mode, floor used for every route", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = () => {
        const err = new Error("spawn git ENOENT");
        err.code = "ENOENT";
        throw err;
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ lastmod: "2026-01-01" }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("fallback");
    expect(typeof result.reason).toBe("string");
    expect(result.routes[0].lastmod).toBe("2026-01-01");
  });

  it("shallow clone: rev-parse reports 'true' -> fallback mode, floor used, never reports a falsely fresh date", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = (args) => {
        if (args[0] === "rev-parse") return "true";
        return "2026-09-01";
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ lastmod: "2026-01-01" }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("fallback");
    expect(result.routes[0].lastmod).toBe("2026-01-01");
  });

  it("git command errors for one route's 'git log' call: that route falls back to its floor without breaking others", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = (args) => {
        if (args[0] === "rev-parse") return "false";
        if (args.includes("Broken.tsx")) {
          throw new Error("git log exited with code 128");
        }
        return "2026-09-01";
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ path: "/about", lastmod: "2026-01-01", sources: ["Broken.tsx"] }),
        route({ path: "/ok", lastmod: "2026-01-01", sources: ["Ok.tsx"] }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("git");
    expect(result.routes.find((r: { path: string }) => r.path === "/about")?.lastmod).toBe(
      "2026-01-01",
    );
    expect(result.routes.find((r: { path: string }) => r.path === "/ok")?.lastmod).toBe(
      "2026-09-01",
    );
  });

  it("malformed git output: a non-date string is never treated as a valid lastmod, floor is used", () => {
    const out = runLastmodScript(`
      import { resolveRouteLastmods } from "./lastmod.mjs";
      const fakeExec = (args) => {
        if (args[0] === "rev-parse") return "false";
        return "not-a-date";
      };
      const result = resolveRouteLastmods(${JSON.stringify([
        route({ lastmod: "2026-01-01" }),
      ])}, { exec: fakeExec });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.mode).toBe("git");
    expect(result.routes[0].lastmod).toBe("2026-01-01");
  });

  it("build never throws regardless of combination (success/missing/error/shallow across routes)", () => {
    expect(() =>
      runLastmodScript(`
        import { resolveRouteLastmods } from "./lastmod.mjs";
        const fakeExec = (args) => {
          if (args[0] === "rev-parse") return "false";
          if (args.includes("A.tsx")) return "2026-09-01";
          if (args.includes("B.tsx")) throw new Error("boom");
          return "garbage";
        };
        resolveRouteLastmods(${JSON.stringify([
          route({ path: "/a", lastmod: "2026-01-01", sources: ["A.tsx"] }),
          route({ path: "/b", lastmod: "2026-01-01", sources: ["B.tsx"] }),
          route({ path: "/c", lastmod: "2026-01-01", sources: ["C.tsx"] }),
        ])}, { exec: fakeExec });
      `),
    ).not.toThrow();
  });
});

describe("scripts/lastmod.mjs — hasFullHistory / gitLastmod (design.md Injectable Git Execution)", () => {
  it("hasFullHistory: true only when the injected exec returns exactly 'false'; any throw -> false", () => {
    const out = runLastmodScript(`
      import { hasFullHistory } from "./lastmod.mjs";
      const results = [
        hasFullHistory(() => "false"),
        hasFullHistory(() => "true"),
        hasFullHistory(() => { throw new Error("nope"); }),
      ];
      process.stdout.write(JSON.stringify(results));
    `);
    expect(JSON.parse(out)).toEqual([true, false, false]);
  });

  it("gitLastmod: returns a validated YYYY-MM-DD or null (empty sources, throw, malformed output)", () => {
    const out = runLastmodScript(`
      import { gitLastmod } from "./lastmod.mjs";
      const results = [
        gitLastmod(["A.tsx"], () => "2026-09-01"),
        gitLastmod([], () => "2026-09-01"),
        gitLastmod(["A.tsx"], () => { throw new Error("boom"); }),
        gitLastmod(["A.tsx"], () => "not-a-date"),
      ];
      process.stdout.write(JSON.stringify(results));
    `);
    expect(JSON.parse(out)).toEqual(["2026-09-01", null, null, null]);
  });
});

describe("scripts/lastmod.mjs — every site-routes.json route has 'sources' and each path exists", () => {
  it("declares a non-empty sources array per route, and every source file exists on disk", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(SCRIPTS_DIR, "site-routes.json"), "utf-8"),
    );
    for (const r of data.routes) {
      expect(Array.isArray(r.sources)).toBe(true);
      expect(r.sources.length).toBeGreaterThan(0);
      for (const sourcePath of r.sources) {
        const abs = path.resolve(ROOT, sourcePath);
        expect(fs.existsSync(abs)).toBe(true);
      }
    }
  });
});

describe("scripts/prerender.mjs wires resolveRouteLastmods before writeSitemap (design.md Data Flow)", () => {
  const readScript = (name: string): string =>
    fs.readFileSync(path.join(SCRIPTS_DIR, name), "utf-8");

  it("imports resolveRouteLastmods from ./lastmod.mjs and calls it before writeSitemap(", () => {
    const source = readScript("prerender.mjs");
    expect(source).toMatch(
      /import\s*\{\s*resolveRouteLastmods\s*\}\s*from\s*["']\.\/lastmod\.mjs["']/,
    );
    const resolveIdx = source.indexOf("resolveRouteLastmods(");
    const writeIdx = source.indexOf("writeSitemap(");
    expect(resolveIdx).toBeGreaterThan(-1);
    expect(writeIdx).toBeGreaterThan(resolveIdx);
  });

  it("logs the resolved lastmod mode", () => {
    const source = readScript("prerender.mjs");
    expect(source).toMatch(/lastmod:\s*mode=/);
  });

  it("scripts/sitemap.mjs stays git-free (no git invocation of any kind)", () => {
    const source = readScript("sitemap.mjs");
    expect(source).not.toMatch(/\bgit\b/i);
    expect(source).not.toContain("execFileSync");
  });
});
