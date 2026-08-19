import postcss from "postcss";
import Beasties from "beasties";

// Per-route critical CSS extraction — see design.md
// (sdd/landing-render-blocking-css/design) for the full rationale.
//
// PR 1 of 2 (stacked-to-main): this module exports ONLY pure, independently
// testable functions. It is NOT imported/wired into scripts/prerender.mjs
// yet — that wiring, plus the index.html light-mode fallback and the dist/
// output regression guards, ships in PR 2. Nothing here has any build-time
// side effect when unused.
//
// Beasties is used strictly as a DATA SOURCE, never as an HTML transformer:
// we hand it a throwaway probe document (buildProbeDocument), let it decide
// which rules are "critical" for that markup, and extract only the <style>
// text it emits (extractCriticalCss). The real, already-rendered route HTML
// is never re-parsed/re-serialized by beasties — it is mutated with a single
// exact-string `.replace()` (deferStylesheetLink) so the <body> region can
// never change, which assertBodyUnchanged verifies rather than assumes.

/**
 * Tailwind v4's compiled sheet emits cascade layers by first-appearance
 * order (no explicit `@layer a,b,c;` statement in the source). Any critical
 * CSS snippet that itself contains an `@layer base { ... }` block MUST be
 * preceded by this declaration, or the browser would register `base` as the
 * FIRST known layer — winning cascade priority over `properties`/`theme`
 * once the deferred stylesheet loads and re-declares the real order.
 * See design.md "Verified Facts" + Decision 1.
 */
export const LAYER_PREAMBLE =
  "@layer properties,theme,base,components,utilities;";

/**
 * Builds a minimal throwaway HTML document used only to ask beasties which
 * rules are "critical" for a given route's rendered markup. This document
 * is NEVER written to disk or shipped — only its beasties-emitted <style>
 * output is kept (see extractCriticalCss). Keeping it minimal (no scripts,
 * no unrelated head tags) avoids beasties keying off anything but the CSS
 * link and the rendered app markup.
 *
 * @param {{ cssHref: string, appHtml: string }} params
 * @returns {string} a full HTML document string
 */
export function buildProbeDocument({ cssHref, appHtml }) {
  if (!cssHref) {
    throw new Error("critical-css: buildProbeDocument requires a cssHref");
  }
  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    `<link rel="stylesheet" href="${cssHref}">`,
    "</head>",
    "<body>",
    `<div id="root">${appHtml ?? ""}</div>`,
    "</body>",
    "</html>",
  ].join("");
}

/**
 * Runs beasties against a probe document and returns ONLY the CSS text it
 * emitted inside the <style> tag it inlines — the probe's own HTML output is
 * discarded entirely; it is never written anywhere or merged with the real
 * route document.
 *
 * Fails loudly (throws) if beasties errors, or if it produces no <style>
 * block / empty CSS — per design.md's "fail loudly on extraction error"
 * rule, this function never returns a silent empty-string fallback.
 *
 * @param {string} probeHtml - output of buildProbeDocument()
 * @param {{ distDir: string, publicPath?: string, routeName?: string }} options
 * @returns {Promise<string>} the extracted critical CSS, trimmed
 */
export async function extractCriticalCss(
  probeHtml,
  { distDir, publicPath = "/", routeName = "(unknown route)" } = {},
) {
  if (!distDir) {
    throw new Error("critical-css: extractCriticalCss requires distDir");
  }

  const beasties = new Beasties({
    path: distDir,
    publicPath,
    pruneSource: false,
    preload: false,
    inlineFonts: false,
    reduceInlineStyles: false,
    logLevel: "warn",
  });

  let processed;
  try {
    processed = await beasties.process(probeHtml);
  } catch (err) {
    throw new Error(
      `critical-css: beasties failed to extract critical CSS for ${routeName}: ${err.message}`,
      { cause: err },
    );
  }

  const styleMatch = processed.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const criticalCss = styleMatch?.[1]?.trim();

  if (!criticalCss) {
    throw new Error(
      `critical-css: beasties produced no critical CSS for ${routeName} — refusing to ship a route with no inlined <style>.`,
    );
  }

  return criticalCss;
}

const THEME_SELECTOR_RE = /^\.light\b/;

/**
 * A postcss Rule matches the theme-token surface if ANY of its (top-level,
 * comma-separated) selectors is exactly `:root` or starts with `.light`
 * (covers `.light`, `.light body`, `.light .glass-card`, compound
 * descendant/combinator selectors, etc). Uses postcss's `rule.selectors`
 * (not a manual `.split(",")`) so nested-paren selectors like
 * `:is(a, b)` are not mis-split.
 *
 * @param {import("postcss").Rule} rule
 * @returns {boolean}
 */
function ruleMatchesTheme(rule) {
  return rule.selectors.some((selector) => {
    const trimmed = selector.trim();
    return trimmed === ":root" || THEME_SELECTOR_RE.test(trimmed);
  });
}

/**
 * Slices the theme-token CSS surface (`:root` + all `.light*` rules) out of
 * the REAL BUILT stylesheet (not `src/index.css` source) using postcss, and
 * prepends the cascade-layer-order preamble. This is force-included in every
 * route's critical CSS regardless of what beasties decides is "used" for
 * that route's static markup, because the SSR HTML always renders
 * theme-neutral (dark-default) and `.light` is applied client-side,
 * pre-paint, by a script beasties cannot see — see design.md Decision 1.
 *
 * Rules nested inside `@layer base { ... }` in the built CSS are re-wrapped
 * in `@layer base { ... }` in the output, preserving cascade-layer
 * membership. Rules matching the same selectors OUTSIDE any layer (e.g.
 * `.light body`, `.light .glass-card`) are kept unlayered, exactly as
 * authored in the built sheet.
 *
 * @param {string} builtCss - the full contents of the built/minified stylesheet
 * @returns {string} `${LAYER_PREAMBLE}\n@layer base{...}\n<unlayered rules>`
 */
export function collectThemeTokenCss(builtCss) {
  if (!builtCss || !builtCss.trim()) {
    throw new Error(
      "critical-css: collectThemeTokenCss requires non-empty built CSS",
    );
  }

  const root = postcss.parse(builtCss);
  const baseLayerRules = [];
  const unlayeredRules = [];

  root.each((node) => {
    if (node.type === "atrule" && node.name === "layer") {
      const isBaseLayer = node.params.trim() === "base";
      if (isBaseLayer) {
        node.each((child) => {
          if (child.type === "rule" && ruleMatchesTheme(child)) {
            baseLayerRules.push(child.clone());
          }
        });
      }
      return;
    }
    if (node.type === "rule" && ruleMatchesTheme(node)) {
      unlayeredRules.push(node.clone());
    }
  });

  if (baseLayerRules.length === 0 && unlayeredRules.length === 0) {
    throw new Error(
      "critical-css: no :root/.light theme token rules found in built CSS — refusing to omit theme tokens (would cause a theme-flash regression).",
    );
  }

  const parts = [LAYER_PREAMBLE];

  if (baseLayerRules.length > 0) {
    const wrapper = postcss.atRule({ name: "layer", params: "base" });
    wrapper.append(baseLayerRules);
    parts.push(wrapper.toString());
  }

  for (const rule of unlayeredRules) {
    parts.push(rule.toString());
  }

  return parts.join("\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DEFERRED_MARKER = "onload=\"this.media='all'\"";

/**
 * Rewrites the ONE stylesheet `<link>` in `html` whose `href` matches
 * `cssHref` from a render-blocking link into the non-blocking
 * `media="print" onload="this.media='all'"` swap pattern, and appends a
 * matching `<noscript>` fallback (a plain, still-blocking copy of the
 * original tag) immediately after it — so users without JS still get the
 * stylesheet.
 *
 * Only the link matching `cssHref` is touched. Any other `<link>` in the
 * document (e.g. the Google Fonts stylesheet link, which already ships its
 * own independent `media="print"` swap) is left byte-for-byte untouched,
 * because the match is scoped to that exact href.
 *
 * Idempotent: if the matched link has already been deferred by a prior call
 * (detected via the exact onload marker this function writes), `html` is
 * returned unchanged rather than double-wrapping it.
 *
 * @param {string} html
 * @param {string} cssHref
 * @returns {string}
 */
export function deferStylesheetLink(html, cssHref) {
  if (!cssHref) {
    throw new Error("critical-css: deferStylesheetLink requires a cssHref");
  }

  const linkRegex = new RegExp(
    `<link\\b[^>]*\\bhref=["']${escapeRegExp(cssHref)}["'][^>]*>`,
  );
  const match = html.match(linkRegex);

  if (!match) {
    throw new Error(
      `critical-css: deferStylesheetLink could not find a <link> with href "${cssHref}"`,
    );
  }

  const originalTag = match[0];

  if (originalTag.includes(DEFERRED_MARKER)) {
    // Already deferred by a previous call — no-op, not a double-wrap.
    return html;
  }

  const selfClosing = /\/>\s*$/.test(originalTag);
  const withoutClose = originalTag.replace(/\s*\/?>\s*$/, "");
  const deferredTag = `${withoutClose} media="print" ${DEFERRED_MARKER}${selfClosing ? " />" : ">"}`;
  const noscriptTag = `<noscript>${originalTag}</noscript>`;

  return html.replace(originalTag, `${deferredTag}\n${noscriptTag}`);
}

/**
 * Extracts the `<body ...>...</html>` (or, failing that, `<body ...>...`)
 * region of an HTML document string for comparison. Internal helper for
 * assertBodyUnchanged — not exported, since it is only meaningful paired
 * with the assertion, not as a standalone utility.
 *
 * @param {string} html
 * @returns {string}
 */
function extractBodyRegion(html) {
  const withClosingHtml = html.match(/<body[\s\S]*<\/html>/i);
  if (withClosingHtml) return withClosingHtml[0];

  const bodyOnly = html.match(/<body[\s\S]*/i);
  if (bodyOnly) return bodyOnly[0];

  throw new Error(
    "critical-css: assertBodyUnchanged could not locate a <body> region in one of the documents",
  );
}

/**
 * Self-verifying guard: asserts that critical-CSS <head> processing did NOT
 * change anything in the `<body>` region (including the `#root` markup and
 * the React Suspense `<!--$-->` marker) between the pre- and
 * post-processing versions of a route's HTML. Throws on any diff; silent
 * (no return value) when the body regions are byte-identical.
 *
 * This exists because SSR/hydration parity is a hard, spec-level
 * requirement (see spec.md "SSR/Hydration Parity Non-Regression") — the
 * transform must never re-parse/re-serialize the body, and this assertion
 * catches a regression BY CONSTRUCTION rather than by code review alone.
 *
 * @param {string} beforeHtml - HTML before critical-CSS head processing
 * @param {string} afterHtml - HTML after critical-CSS head processing
 * @returns {void}
 */
export function assertBodyUnchanged(beforeHtml, afterHtml) {
  const beforeBody = extractBodyRegion(beforeHtml);
  const afterBody = extractBodyRegion(afterHtml);

  if (beforeBody !== afterBody) {
    throw new Error(
      "critical-css: <body> region changed during critical CSS head processing — refusing to write this route (SSR/hydration parity would break).",
    );
  }
}
