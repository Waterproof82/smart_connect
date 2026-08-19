import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

// See design.md §"Testing Strategy" (sdd/landing-render-blocking-css) for the
// full rationale.
//
// scripts/critical-css.mjs is plain ESM (no TS/JSX), same constraint as
// scripts/sitemap.mjs (see sitemapGeneration.test.ts's header comment for
// why ts-jest can't `import()` it directly). These tests spawn a real
// `node --input-type=module` subprocess to import and execute the module's
// pure exports directly — genuine behavioral coverage, zero Jest transform
// involvement. PR 1 of 2 (stacked-to-main): this module is NOT yet wired
// into scripts/prerender.mjs — that wiring + regression guards ship in PR 2.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

function mkTmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe("scripts/critical-css.mjs — buildProbeDocument", () => {
  it("builds a minimal document containing only the route CSS link and rendered appHtml in #root", () => {
    const out = runScript(`
      import { buildProbeDocument } from "./critical-css.mjs";
      process.stdout.write(buildProbeDocument({
        cssHref: "/assets/index-abc123.css",
        appHtml: "<main><h1>Hello</h1></main>",
      }));
    `);
    expect(out).toContain('<link rel="stylesheet" href="/assets/index-abc123.css">');
    expect(out).toContain('<div id="root"><main><h1>Hello</h1></main></div>');
    // Minimal — no scripts, no unrelated head tags.
    expect(out).not.toContain("<script");
  });

  it("throws when cssHref is missing", () => {
    expect(() =>
      runScript(`
        import { buildProbeDocument } from "./critical-css.mjs";
        buildProbeDocument({ appHtml: "<div>x</div>" });
      `),
    ).toThrow();
  });
});

describe("scripts/critical-css.mjs — extractCriticalCss (beasties wrapper)", () => {
  it("returns only the beasties-emitted <style> content, and probe output is discarded", () => {
    const distDir = mkTmpDir("critical-css-extract-");
    fs.writeFileSync(
      path.join(distDir, "app.css"),
      "h1{color:red}p{color:blue}",
    );
    const out = runScript(`
      import { buildProbeDocument, extractCriticalCss } from "./critical-css.mjs";
      const probe = buildProbeDocument({
        cssHref: "/app.css",
        appHtml: "<h1>Hello</h1>",
      });
      const css = await extractCriticalCss(probe, {
        distDir: ${JSON.stringify(distDir)},
        publicPath: "/",
        routeName: "/",
      });
      process.stdout.write(css);
    `);
    expect(out).toContain("color:red");
    // p{} is not present in the probe's rendered markup — beasties should
    // not consider it critical for this document.
    expect(out).not.toContain("color:blue");
    fs.rmSync(distDir, { recursive: true, force: true });
  });

  it("fails loudly (throws) when the css asset cannot be resolved — no silent empty fallback", () => {
    const distDir = mkTmpDir("critical-css-extract-fail-");
    expect(() =>
      runScript(`
        import { buildProbeDocument, extractCriticalCss } from "./critical-css.mjs";
        const probe = buildProbeDocument({
          cssHref: "/does-not-exist.css",
          appHtml: "<h1>Hello</h1>",
        });
        await extractCriticalCss(probe, {
          distDir: ${JSON.stringify(distDir)},
          publicPath: "/",
          routeName: "/missing",
        });
      `),
    ).toThrow();
    fs.rmSync(distDir, { recursive: true, force: true });
  });

  it("throws when distDir is missing", () => {
    expect(() =>
      runScript(`
        import { extractCriticalCss } from "./critical-css.mjs";
        await extractCriticalCss("<html></html>", {});
      `),
    ).toThrow();
  });
});

describe("scripts/critical-css.mjs — collectThemeTokenCss", () => {
  const FIXTURE_CSS = `
    @layer properties;
    @layer theme;
    @layer base{:root{--color-bg:#030508;--color-fg:#fff}.light{--color-bg:#fafafa;--color-fg:#030508}h1{margin:0}}
    @layer components{.btn{padding:1rem}}
    .light body{background:var(--color-bg)}
    .light .glass-card{backdrop-filter:blur(8px)}
  `;

  it("slices :root and .light rules from @layer base, preserving the @layer base wrapper", () => {
    const out = runScript(`
      import { collectThemeTokenCss } from "./critical-css.mjs";
      process.stdout.write(collectThemeTokenCss(${JSON.stringify(FIXTURE_CSS)}));
    `);
    expect(out).toContain("@layer base");
    expect(out).toContain(":root");
    expect(out).toContain("--color-bg:#030508");
    expect(out).toContain(".light");
    expect(out).toContain("--color-bg:#fafafa");
    // Non-theme rule inside @layer base must NOT leak through.
    expect(out).not.toContain("h1{margin:0}");
    // Non-theme layer must not leak through either.
    expect(out).not.toContain(".btn{padding:1rem}");
  });

  it("includes unlayered compound .light selectors (.light body, .light .glass-card)", () => {
    const out = runScript(`
      import { collectThemeTokenCss } from "./critical-css.mjs";
      process.stdout.write(collectThemeTokenCss(${JSON.stringify(FIXTURE_CSS)}));
    `);
    expect(out).toContain(".light body");
    expect(out).toContain("background:var(--color-bg)");
    expect(out).toContain(".light .glass-card");
    expect(out).toContain("backdrop-filter:blur(8px)");
  });

  it("prepends the layer-order preamble matching first-appearance order (properties,theme,base,components,utilities)", () => {
    const out = runScript(`
      import { collectThemeTokenCss, LAYER_PREAMBLE } from "./critical-css.mjs";
      const css = collectThemeTokenCss(${JSON.stringify(FIXTURE_CSS)});
      process.stdout.write(JSON.stringify({ css, LAYER_PREAMBLE }));
    `);
    const { css, LAYER_PREAMBLE } = JSON.parse(out) as {
      css: string;
      LAYER_PREAMBLE: string;
    };
    expect(LAYER_PREAMBLE).toBe(
      "@layer properties,theme,base,components,utilities;",
    );
    expect(css.startsWith(LAYER_PREAMBLE)).toBe(true);
  });

  it("throws when no :root/.light rules are found — never silently omits theme tokens", () => {
    expect(() =>
      runScript(`
        import { collectThemeTokenCss } from "./critical-css.mjs";
        collectThemeTokenCss("@layer base{h1{margin:0}}");
      `),
    ).toThrow();
  });

  it("throws on empty input", () => {
    expect(() =>
      runScript(`
        import { collectThemeTokenCss } from "./critical-css.mjs";
        collectThemeTokenCss("");
      `),
    ).toThrow();
  });
});

describe("scripts/critical-css.mjs — deferStylesheetLink", () => {
  const HTML = `<!doctype html><html><head>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Test" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Test" media="print" onload="this.media = 'all'" />
    <link rel="stylesheet" crossorigin href="/assets/index-abc123.css">
    </head><body><div id="root"></div></body></html>`;

  it("rewrites only the app <link>, leaves the Google Fonts link byte-for-byte untouched", () => {
    const out = runScript(`
      import { deferStylesheetLink } from "./critical-css.mjs";
      process.stdout.write(deferStylesheetLink(${JSON.stringify(HTML)}, "/assets/index-abc123.css"));
    `);
    // Google Fonts stylesheet link: its own pre-existing print/onload swap,
    // untouched, still present exactly once.
    expect(out).toContain(
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Test" media="print" onload="this.media = 'all'" />`,
    );
    // App link: rewritten to the deferred pattern.
    expect(out).toMatch(
      /<link rel="stylesheet" crossorigin href="\/assets\/index-abc123\.css" media="print" onload="this\.media='all'">/,
    );
  });

  it("emits a matching <noscript> fallback with the original (blocking) tag", () => {
    const out = runScript(`
      import { deferStylesheetLink } from "./critical-css.mjs";
      process.stdout.write(deferStylesheetLink(${JSON.stringify(HTML)}, "/assets/index-abc123.css"));
    `);
    expect(out).toContain(
      `<noscript><link rel="stylesheet" crossorigin href="/assets/index-abc123.css"></noscript>`,
    );
  });

  it("is idempotent — calling it twice produces the same output as calling it once", () => {
    const out = runScript(`
      import { deferStylesheetLink } from "./critical-css.mjs";
      const once = deferStylesheetLink(${JSON.stringify(HTML)}, "/assets/index-abc123.css");
      const twice = deferStylesheetLink(once, "/assets/index-abc123.css");
      process.stdout.write(JSON.stringify({ same: once === twice, once }));
    `);
    const { same } = JSON.parse(out) as { same: boolean; once: string };
    expect(same).toBe(true);
  });

  it("throws when the target href is not found in the document", () => {
    expect(() =>
      runScript(`
        import { deferStylesheetLink } from "./critical-css.mjs";
        deferStylesheetLink(${JSON.stringify(HTML)}, "/assets/does-not-exist.css");
      `),
    ).toThrow();
  });
});

describe("scripts/critical-css.mjs — assertBodyUnchanged", () => {
  const BASE_HTML = `<!doctype html><html><head><title>x</title></head><body class="bg-sc-dark"><div id="root"><!--$--><main>Hello</main><!--/$--></div><script defer type="module" src="/src/entry-client.tsx"></script></body></html>`;

  it("is silent (does not throw) when the body regions are byte-identical", () => {
    expect(() =>
      runScript(`
        import { assertBodyUnchanged } from "./critical-css.mjs";
        const before = ${JSON.stringify(BASE_HTML)};
        const after = before.replace("<title>x</title>", "<title>x</title><style>h1{color:red}</style>");
        assertBodyUnchanged(before, after);
      `),
    ).not.toThrow();
  });

  it("throws when the <body> region (including #root / <!--$-->) differs", () => {
    expect(() =>
      runScript(`
        import { assertBodyUnchanged } from "./critical-css.mjs";
        const before = ${JSON.stringify(BASE_HTML)};
        const after = before.replace("<main>Hello</main>", "<main>Goodbye</main>");
        assertBodyUnchanged(before, after);
      `),
    ).toThrow();
  });

  it("throws when neither document has a <body> region", () => {
    expect(() =>
      runScript(`
        import { assertBodyUnchanged } from "./critical-css.mjs";
        assertBodyUnchanged("<html><head></head></html>", "<html><head></head></html>");
      `),
    ).toThrow();
  });
});
