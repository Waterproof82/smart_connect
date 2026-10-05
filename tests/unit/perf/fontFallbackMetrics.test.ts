import fs from "node:fs";
import path from "node:path";

/**
 * Guards the metric-matched "DM Sans Fallback"/"Space Grotesk Fallback"
 * `@font-face` rules in tokens.css (added in 8ce8df0) against drift.
 *
 * Formula (next/font / fontaine / Capsize). xWidthAvg is in font units, so it
 * is normalized by each font's own unitsPerEm — Arial uses 2048, the web
 * fonts 1000. Skipping that normalization yields a bogus ~51% size-adjust,
 * which shipped briefly in seo-audit-followups S9 and was reverted:
 *   sizeAdjust = (webfont.xWidthAvg / webfont.unitsPerEm)
 *              / (fallback.xWidthAvg / fallback.unitsPerEm)
 *   ascentOverride = (webfont.ascent / webfont.unitsPerEm) / sizeAdjust
 *   descentOverride = |webfont.descent / webfont.unitsPerEm| / sizeAdjust
 *   lineGapOverride = (webfont.lineGap / webfont.unitsPerEm) / sizeAdjust
 *
 * Metric source: `@capsizecss/metrics` v4.3.0 (`npx -y @capsizecss/metrics`
 * data bundle, accessed 2026-10-03) for "Arial", "DM Sans", "Space
 * Grotesk" — the same metrics collection next/font and fontaine both use.
 */
const METRICS = {
  arial: {
    ascent: 1854,
    descent: -434,
    lineGap: 67,
    unitsPerEm: 2048,
    xWidthAvg: 913,
  },
  dmSans: {
    ascent: 992,
    descent: -310,
    lineGap: 0,
    unitsPerEm: 1000,
    xWidthAvg: 466,
  },
  spaceGrotesk: {
    ascent: 984,
    descent: -292,
    lineGap: 0,
    unitsPerEm: 1000,
    xWidthAvg: 489,
  },
};

function computeOverrides(
  webfont: {
    ascent: number;
    descent: number;
    lineGap: number;
    unitsPerEm: number;
    xWidthAvg: number;
  },
  fallback: { unitsPerEm: number; xWidthAvg: number },
) {
  // xWidthAvg is in font units, so each font must be normalized by its own
  // unitsPerEm first (Arial uses 2048, DM Sans/Space Grotesk use 1000).
  const sizeAdjust =
    webfont.xWidthAvg / webfont.unitsPerEm /
    (fallback.xWidthAvg / fallback.unitsPerEm);
  const ascentOverride = webfont.ascent / webfont.unitsPerEm / sizeAdjust;
  const descentOverride =
    Math.abs(webfont.descent / webfont.unitsPerEm) / sizeAdjust;
  const lineGapOverride = webfont.lineGap / webfont.unitsPerEm / sizeAdjust;
  const pct = (v: number) =>
    v === 0 ? "0%" : `${parseFloat((v * 100).toFixed(2))}%`;
  return {
    sizeAdjust: pct(sizeAdjust),
    ascentOverride: pct(ascentOverride),
    descentOverride: pct(descentOverride),
    lineGapOverride: pct(lineGapOverride),
  };
}

const ROOT = path.resolve(__dirname, "../../../");
const TOKENS_CSS_PATH = path.join(ROOT, "tokens.css");
const TAILWIND_CONFIG_PATH = path.join(ROOT, "tailwind.config.js");

function readSource(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

/** Extracts a single `@font-face { ... }` block by its font-family name. */
function extractFontFace(source: string, familyName: string): string | null {
  const re = new RegExp(
    `@font-face\\s*\\{[^}]*font-family:\\s*["']${familyName}["'][^}]*\\}`,
    "s",
  );
  const m = source.match(re);
  return m ? m[0] : null;
}

describe("Font fallback @font-face declarations (tokens.css, CLS fix seo-audit-followups S9)", () => {
  const cssSource = readSource(TOKENS_CSS_PATH);

  it("tailwind.config.js's font stacks still reference both fallback face names (regression guard)", () => {
    const tailwindSource = readSource(TAILWIND_CONFIG_PATH);
    expect(tailwindSource).toMatch(/['"]DM Sans Fallback['"]/);
    expect(tailwindSource).toMatch(/['"]Space Grotesk Fallback['"]/);
  });

  it('declares @font-face "DM Sans Fallback" as local("Arial") with the correctly-ordered override metrics', () => {
    const block = extractFontFace(cssSource, "DM Sans Fallback");
    expect(block).not.toBeNull();
    const expected = computeOverrides(METRICS.dmSans, METRICS.arial);
    expect(block).toMatch(/src:\s*local\(["']Arial["']\)/);
    expect(block).toContain(`size-adjust: ${expected.sizeAdjust}`);
    expect(block).toContain(`ascent-override: ${expected.ascentOverride}`);
    expect(block).toContain(`descent-override: ${expected.descentOverride}`);
    expect(block).toContain(`line-gap-override: ${expected.lineGapOverride}`);
  });

  it('declares @font-face "Space Grotesk Fallback" as local("Arial") with the correctly-ordered override metrics', () => {
    const block = extractFontFace(cssSource, "Space Grotesk Fallback");
    expect(block).not.toBeNull();
    const expected = computeOverrides(METRICS.spaceGrotesk, METRICS.arial);
    expect(block).toMatch(/src:\s*local\(["']Arial["']\)/);
    expect(block).toContain(`size-adjust: ${expected.sizeAdjust}`);
    expect(block).toContain(`ascent-override: ${expected.ascentOverride}`);
    expect(block).toContain(`descent-override: ${expected.descentOverride}`);
    expect(block).toContain(`line-gap-override: ${expected.lineGapOverride}`);
  });

  it("src/index.css does not duplicate the fallback @font-face declarations (single source of truth)", () => {
    const indexCssPath = path.join(ROOT, "src", "index.css");
    const indexCssSource = readSource(indexCssPath);
    expect(indexCssSource).not.toMatch(/@font-face/);
  });
});
