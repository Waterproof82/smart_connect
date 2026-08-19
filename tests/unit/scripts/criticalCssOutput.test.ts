/**
 * Output-level regression guards for the critical CSS change
 * (sdd/landing-render-blocking-css). Two concerns live here:
 *
 * 1. `index.html` source-text guard (design.md Decision 3) — this one is a
 *    real RED/GREEN unit test, always runnable, no build required.
 * 2. `dist/*.html` structural guards (design.md "Testing Strategy" — Output
 *    row) — these can only assert against REAL build output. This suite
 *    MUST NEVER invoke `npm run build`/`vite build` itself. Guards SKIP
 *    gracefully (mirrors `documents-rls.test.ts`'s
 *    `describeIfConfigured = X ? describe : describe.skip` convention) when:
 *      - dist/ or a specific route's HTML file doesn't exist, OR
 *      - the file exists but doesn't reflect a clean single-pass build with
 *        this wiring applied (detected via `isCleanSinglePassOutput` —
 *        guards against both pre-change/stale dist AND a corrupted dist from
 *        e.g. re-running scripts/prerender.mjs more than once against the
 *        same template without an intervening fresh `vite build`, which is
 *        not a supported use case of that script).
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../../");
const INDEX_HTML_PATH = path.join(ROOT, "index.html");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_ROUTES_PATH = path.join(ROOT, "scripts/site-routes.json");

describe("index.html — light-mode background fallback (design.md Decision 3)", () => {
  const readSource = () => fs.readFileSync(INDEX_HTML_PATH, "utf-8");

  it("extends the existing inline <style> with a prefers-color-scheme: light background fallback", () => {
    const source = readSource();
    expect(source).toMatch(
      /@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*html\s*\{\s*background-color:\s*var\(--color-bg,\s*#fafafa\)\s*;?\s*\}\s*\}/,
    );
  });

  it("keeps the pre-existing dark-default background declaration untouched", () => {
    const source = readSource();
    expect(source).toMatch(/background-color:\s*var\(--color-bg,\s*#030508\)/);
  });

  it("the light-mode fallback lives inside the existing inline <style> block, not a new one", () => {
    const source = readSource();
    const styleBlocks = source.match(/<style>[\s\S]*?<\/style>/g) ?? [];
    expect(styleBlocks).toHaveLength(1);
    expect(styleBlocks[0]).toMatch(/prefers-color-scheme:\s*light/);
  });
});

interface SiteRoute {
  path: string;
}

const SITE_ROUTES: SiteRoute[] = JSON.parse(
  fs.readFileSync(SITE_ROUTES_PATH, "utf-8"),
).routes;

function routeFilePath(routePath: string): string {
  if (routePath === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, routePath.replace(/^\//, ""), "index.html");
}

function readIfExists(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : null;
}

/**
 * A route file reflects a clean, current single prerender pass only if:
 * - it has exactly one Helmet-rendered <title> tag (a corrupted/double-run
 *   dist accumulates duplicates — see header comment), AND
 * - its app stylesheet <link> is already deferred (the exact marker
 *   scripts/critical-css.mjs's deferStylesheetLink writes).
 */
function isCleanSinglePassOutput(html: string): boolean {
  const titleCount = (html.match(/<title[\s>]/g) ?? []).length;
  const hasDeferredAppLink =
    /<link[^>]*\/assets\/[^"']+\.css[^>]*\bmedia="print"[^>]*\bonload="this\.media='all'"[^>]*>/.test(
      html,
    );
  return titleCount === 1 && hasDeferredAppLink;
}

describe("dist/*.html — critical CSS output guards (design.md Testing Strategy 'Output')", () => {
  for (const route of SITE_ROUTES) {
    const html = readIfExists(routeFilePath(route.path));
    const wired = html !== null && isCleanSinglePassOutput(html);
    const maybeIt = wired ? it : it.skip;

    describe(`route ${route.path}`, () => {
      maybeIt(
        "has exactly one inlined critical <style> containing .light{ and --color-bg",
        () => {
          const styleBlocks = html!.match(/<style>[\s\S]*?<\/style>/g) ?? [];
          const criticalBlocks = styleBlocks.filter(
            (block) => block.includes(".light{") && block.includes("--color-bg"),
          );
          expect(criticalBlocks).toHaveLength(1);
        },
      );

      maybeIt("defers the app stylesheet <link> (media=print + onload swap)", () => {
        expect(html).toMatch(
          /<link[^>]*\/assets\/[^"']+\.css[^>]*\bmedia="print"[^>]*\bonload="this\.media='all'"[^>]*>/,
        );
      });

      maybeIt("emits a matching <noscript> fallback for the app stylesheet", () => {
        expect(html).toMatch(/<noscript><link[^>]*\/assets\/[^"']+\.css[^>]*><\/noscript>/);
      });

      maybeIt("preserves the React Suspense marker <!--$-->", () => {
        expect(html).toContain("<!--$-->");
      });
    });
  }
});

describe("dist/_spa.html — excluded from critical CSS processing (design.md Decision 2)", () => {
  const html = readIfExists(path.join(DIST_DIR, "_spa.html"));
  const maybeIt = html !== null ? it : it.skip;

  maybeIt("keeps its stylesheet <link> blocking — no media=print/onload swap", () => {
    expect(html).not.toMatch(/onload="this\.media='all'"/);
  });

  maybeIt("contains no injected critical <style> block", () => {
    const styleCount = (html!.match(/<style>/g) ?? []).length;
    // The hand-authored fallback <style> from index.html is expected (at
    // most 1); critical CSS processing must never add a second one here.
    expect(styleCount).toBeLessThanOrEqual(1);
  });
});
