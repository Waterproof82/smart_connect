import fs from "node:fs";
import path from "node:path";

// design.md U4 — light-mode `--color-primary` / `--color-success-text`
// darkened to clear WCAG AA (4.5:1) on their worst-case real-usage
// background (`--color-accent-subtle` / `--color-success-bg`, both L90%),
// not just the lightest surface the original proposal audited.
const CSS_PATH = path.resolve(__dirname, "../../src/index.css");

/**
 * OKLCH -> OKLab -> linear-sRGB, Björn Ottosson's CSS Color 4 matrices.
 * Same math as tests/unit/accentTokens.contrast.test.ts (kept local/
 * duplicated intentionally — no shared test-utils module exists yet).
 */
function oklchToLinearSrgb(
  L: number,
  C: number,
  hueDeg: number,
): [number, number, number] {
  const h = (hueDeg * Math.PI) / 180;
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

function relativeLuminance(L: number, C: number, hueDeg: number): number {
  const [r, g, b] = oklchToLinearSrgb(L, C, hueDeg);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(y1: number, y2: number): number {
  const lighter = Math.max(y1, y2);
  const darker = Math.min(y1, y2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface ParsedVar {
  L: number; // 0-1
  C: number;
  H: number; // degrees
}

function extractBraceBlock(css: string, selector: RegExp): string {
  const match = css.match(selector);
  if (!match) return "";
  return match[1];
}

function parseOklchVars(blockCss: string): Map<string, ParsedVar> {
  const re =
    /(--[a-z0-9-]+):\s*oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  const map = new Map<string, ParsedVar>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(blockCss)) !== null) {
    map.set(m[1], { L: Number(m[2]) / 100, C: Number(m[3]), H: Number(m[4]) });
  }
  return map;
}

function luminanceOf(map: Map<string, ParsedVar>, name: string): number {
  const v = map.get(name);
  if (!v) {
    throw new Error(`Missing CSS custom property ${name}`);
  }
  return relativeLuminance(v.L, v.C, v.H);
}

const css = fs.readFileSync(CSS_PATH, "utf-8");
const rootBlock = extractBraceBlock(css, /:root\s*\{([^}]*)\}/);
const lightBlock = extractBraceBlock(css, /\.light\s*\{([^}]*)\}/);

const darkVars = parseOklchVars(rootBlock);
const lightVars = parseOklchVars(lightBlock);

describe("light-mode contrast tokens (design.md U4)", () => {
  describe("exact authored values (.light block)", () => {
    it("--color-primary is oklch(47% 0.18 250)", () => {
      const v = lightVars.get("--color-primary")!;
      expect(v.L).toBeCloseTo(0.47, 5);
      expect(v.C).toBeCloseTo(0.18, 5);
      expect(v.H).toBeCloseTo(250, 5);
    });

    it("--color-success-text is oklch(45% 0.15 150)", () => {
      const v = lightVars.get("--color-success-text")!;
      expect(v.L).toBeCloseTo(0.45, 5);
      expect(v.C).toBeCloseTo(0.15, 5);
      expect(v.H).toBeCloseTo(150, 5);
    });
  });

  describe("WCAG AA (>=4.5:1) on worst-case real-usage background", () => {
    it("--color-primary vs --color-accent-subtle (L90%, chips: SeoSchema, CartaDigitalBBDDSection) clears AA", () => {
      const y1 = luminanceOf(lightVars, "--color-primary");
      const y2 = luminanceOf(lightVars, "--color-accent-subtle");
      expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-success-text vs --color-success-bg (L90%) clears AA", () => {
      const y1 = luminanceOf(lightVars, "--color-success-text");
      const y2 = luminanceOf(lightVars, "--color-success-bg");
      expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-primary also clears AA on --color-bg, --color-bg-alt, --color-surface", () => {
      const y1 = luminanceOf(lightVars, "--color-primary");
      for (const bg of ["--color-bg", "--color-bg-alt", "--color-surface"]) {
        const y2 = luminanceOf(lightVars, bg);
        expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(4.5);
      }
    });
  });

  describe("hover-state perceptible delta (AboutPage.tsx L199/214)", () => {
    it("--color-primary and --color-accent-hover remain visually distinct (>=2 L points)", () => {
      const primary = lightVars.get("--color-primary")!;
      const hover = lightVars.get("--color-accent-hover")!;
      expect(Math.abs(primary.L - hover.L)).toBeGreaterThanOrEqual(0.019);
    });
  });

  describe("unchanged scope guards", () => {
    it("--color-error-text is untouched (already passes AA, out of scope)", () => {
      const v = lightVars.get("--color-error-text")!;
      expect(v.L).toBeCloseTo(0.5, 5);
      expect(v.C).toBeCloseTo(0.18, 5);
      expect(v.H).toBeCloseTo(25, 5);
    });

    it("dark mode :root --color-primary is untouched (65% 0.18 250)", () => {
      const v = darkVars.get("--color-primary")!;
      expect(v.L).toBeCloseTo(0.65, 5);
      expect(v.C).toBeCloseTo(0.18, 5);
      expect(v.H).toBeCloseTo(250, 5);
    });

    it("dark mode :root --color-success-text is untouched (70% 0.15 150)", () => {
      const v = darkVars.get("--color-success-text")!;
      expect(v.L).toBeCloseTo(0.7, 5);
      expect(v.C).toBeCloseTo(0.15, 5);
      expect(v.H).toBeCloseTo(150, 5);
    });
  });
});
