/**
 * Shared OKLCH -> WCAG contrast-ratio math for tests/unit/a11y/ (S7,
 * design.md D7). tests/unit/accentTokens.contrast.test.ts and
 * lightModeContrast.tokens.test.ts keep their own older, unclamped local
 * copies on purpose and are left untouched. This module clamps linear-sRGB
 * to [0,1] (gamut-mapping, like a real browser) before computing luminance
 * — verified to reproduce design.md D7's own cited ratios exactly.
 */

export interface OklchColor {
  /** Lightness, 0-1 (design/CSS authors it as a 0-100% value). */
  L: number;
  /** Chroma. */
  C: number;
  /** Hue, in degrees. */
  H: number;
}

/** Björn Ottosson's CSS Color 4 OKLab -> linear-sRGB matrices. */
export function oklchToLinearSrgb({
  L,
  C,
  H,
}: OklchColor): [number, number, number] {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, bl];
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** WCAG relative luminance, gamut-mapped (clamped) to [0,1] per channel. */
export function relativeLuminance(color: OklchColor): number {
  const [r, g, b] = oklchToLinearSrgb(color).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two relative luminances. */
export function contrastRatio(y1: number, y2: number): number {
  const lighter = Math.max(y1, y2);
  const darker = Math.min(y1, y2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Convenience: contrast ratio directly between two OKLCH colors. */
export function oklchContrastRatio(a: OklchColor, b: OklchColor): number {
  return contrastRatio(relativeLuminance(a), relativeLuminance(b));
}

function extractBraceBlock(css: string, selector: RegExp): string {
  const match = css.match(selector);
  if (!match) return "";
  return match[1];
}

/** Parses every `--token: oklch(L% C H)` declaration inside a CSS block. */
export function parseOklchVars(blockCss: string): Map<string, OklchColor> {
  const re =
    /(--[a-z0-9-]+):\s*oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  const map = new Map<string, OklchColor>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(blockCss)) !== null) {
    map.set(m[1], {
      L: Number(m[2]) / 100,
      C: Number(m[3]),
      H: Number(m[4]),
    });
  }
  return map;
}

/** Parses the `:root` (dark) and `.light` blocks out of `src/index.css`. */
export function parseThemeTokens(css: string): {
  dark: Map<string, OklchColor>;
  light: Map<string, OklchColor>;
} {
  const rootBlock = extractBraceBlock(css, /:root\s*\{([^}]*)\}/);
  const lightBlock = extractBraceBlock(css, /\.light\s*\{([^}]*)\}/);
  return {
    dark: parseOklchVars(rootBlock),
    light: parseOklchVars(lightBlock),
  };
}

