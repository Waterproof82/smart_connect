import fs from "node:fs";
import path from "node:path";
import { TPV_MODULES } from "@shared/config/tpvModules";

// design.md D3/D4 — 8 new module accent tokens + WCAG 2.1 SC 1.4.11 (3:1
// non-text) contrast contract, verified by real OKLCH math (no deps).
const CSS_PATH = path.resolve(__dirname, "../../src/index.css");

/**
 * OKLCH -> OKLab -> linear-sRGB, Björn Ottosson's CSS Color 4 matrices.
 * Deliberately does NOT clip to the sRGB gamut (design.md D4's documented
 * limitation) — authored values are compared as-is.
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

/** WCAG relative luminance computed directly from linear-light RGB. */
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
  name: string;
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
    map.set(m[1], {
      name: m[1],
      L: Number(m[2]) / 100,
      C: Number(m[3]),
      H: Number(m[4]),
    });
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

const darkIconTokens = [...darkVars.keys()].filter((k) =>
  k.startsWith("--color-icon-"),
);
const lightIconTokens = [...lightVars.keys()].filter((k) =>
  k.startsWith("--color-icon-"),
);

// The 8 tokens introduced by this change (design.md D3).
const NEW_TOKENS = [
  "--color-icon-coral",
  "--color-icon-orange",
  "--color-icon-lime",
  "--color-icon-green",
  "--color-icon-jade",
  "--color-icon-cyan",
  "--color-icon-indigo",
  "--color-icon-magenta",
];

// Pre-existing tokens. --color-icon-amber is the named, documented
// exemption from the new tokens' extra ≥4:1 headroom floor (design.md D4:
// "reference point for the legacy token" — amber light vs bg-alt ≈ 3.61:1,
// already below the 4:1 headroom bar while still clearing the 3:1 SC
// 1.4.11 floor every token must meet).
const LEGACY_TOKENS = [
  "--color-icon-blue",
  "--color-icon-purple",
  "--color-icon-emerald",
  "--color-icon-amber",
  "--color-icon-rose",
];
const LEGACY_AMBER_EXEMPT_FROM_HEADROOM_FLOOR = "--color-icon-amber";

const ALL_TOKENS = [...LEGACY_TOKENS, ...NEW_TOKENS];
const BACKGROUNDS = ["--color-bg", "--color-bg-alt", "--color-surface"];

// design.md D5 — frozen module -> accent assignment table.
const D5_MODULE_ACCENTS: Record<string, string> = {
  "tpv-cobro": "--color-icon-coral",
  "comandero-movil": "--color-icon-jade",
  "kds-cocina": "--color-icon-purple",
  "gestion-reservas": "--color-icon-amber",
  "fichajes-control-horario": "--color-icon-blue",
  "delivery-takeaway": "--color-icon-rose",
  "stock-inventario": "--color-icon-green",
  "multi-iva-igic": "--color-icon-indigo",
  "rbac-roles": "--color-icon-orange",
  "food-cost-avanzado": "--color-icon-cyan",
  "sistema-alergenos": "--color-icon-magenta",
  "compras-sialti": "--color-icon-lime",
  "tienda-carta-digital": "--color-icon-emerald",
};

function tokenFromIconColor(iconColor: string): string | null {
  const m = iconColor.match(/--color-icon-[a-z]+/);
  return m ? m[0] : null;
}

describe("accent token system (design.md D3/D4)", () => {
  it("declares all 13 --color-icon-* tokens in :root (dark)", () => {
    expect(new Set(darkIconTokens).size).toBe(13);
  });

  it("declares all 13 --color-icon-* tokens in .light", () => {
    expect(new Set(lightIconTokens).size).toBe(13);
  });

  it("dark/light token name sets are identical (parity)", () => {
    expect([...darkIconTokens].sort()).toEqual([...lightIconTokens].sort());
  });

  it("the 8 new tokens are present alongside the 5 legacy tokens", () => {
    for (const token of [...NEW_TOKENS, ...LEGACY_TOKENS]) {
      expect(darkVars.has(token)).toBe(true);
      expect(lightVars.has(token)).toBe(true);
    }
  });

  it("hues are pairwise distinct with a minimum circular separation of 20 degrees", () => {
    const hues = ALL_TOKENS.map((t) => darkVars.get(t)!.H).sort(
      (a, b) => a - b,
    );
    expect(hues.length).toBe(13);
    expect(new Set(hues).size).toBe(13);
    for (let i = 0; i < hues.length; i++) {
      const next = hues[(i + 1) % hues.length];
      const diff =
        i === hues.length - 1 ? 360 - hues[i] + next : next - hues[i];
      expect(diff).toBeGreaterThanOrEqual(20);
    }
  });

  it("dark and light hue values match per token (only lightness authored per-theme)", () => {
    for (const token of ALL_TOKENS) {
      expect(lightVars.get(token)!.H).toBe(darkVars.get(token)!.H);
    }
  });

  describe("WCAG 2.1 SC 1.4.11 non-text contrast (>=3:1 for all 13 tokens)", () => {
    for (const token of ALL_TOKENS) {
      for (const bg of BACKGROUNDS) {
        it(`${token} dark vs ${bg} >= 3.0:1`, () => {
          const y1 = luminanceOf(darkVars, token);
          const y2 = luminanceOf(darkVars, bg);
          expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(3.0);
        });

        it(`${token} light vs ${bg} >= 3.0:1`, () => {
          const y1 = luminanceOf(lightVars, token);
          const y2 = luminanceOf(lightVars, bg);
          expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(3.0);
        });
      }
    }
  });

  describe("Headroom floor (>=4:1) for the 8 new tokens", () => {
    for (const token of NEW_TOKENS) {
      for (const bg of BACKGROUNDS) {
        it(`${token} dark vs ${bg} >= 4.0:1`, () => {
          const y1 = luminanceOf(darkVars, token);
          const y2 = luminanceOf(darkVars, bg);
          expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(4.0);
        });
      }

      it(`${token} light vs --color-bg >= 4.0:1`, () => {
        const y1 = luminanceOf(lightVars, token);
        const y2 = luminanceOf(lightVars, "--color-bg");
        expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(4.0);
      });
    }

    it("legacy --color-icon-amber is a documented exemption, not silently skipped", () => {
      expect(LEGACY_AMBER_EXEMPT_FROM_HEADROOM_FLOOR).toBe(
        "--color-icon-amber",
      );
      expect(NEW_TOKENS).not.toContain(
        LEGACY_AMBER_EXEMPT_FROM_HEADROOM_FLOOR,
      );
      const y1 = luminanceOf(lightVars, "--color-icon-amber");
      const y2 = luminanceOf(lightVars, "--color-bg-alt");
      // Reference point from design.md D4 — amber already falls short of
      // the 4:1 headroom bar in light theme; it still clears 3:1 (asserted
      // above), which is the actual binding non-text contract.
      expect(contrastRatio(y1, y2)).toBeLessThan(4.0);
      expect(contrastRatio(y1, y2)).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe("TPV_MODULES config <-> CSS token integrity", () => {
    it("every module's iconColor token exists in the parsed CSS (no dangling reference)", () => {
      for (const module of TPV_MODULES) {
        const token = tokenFromIconColor(module.iconColor);
        expect(token).not.toBeNull();
        expect(darkVars.has(token!)).toBe(true);
        expect(lightVars.has(token!)).toBe(true);
      }
    });

    it("all 13 iconColor values are pairwise distinct", () => {
      const values = TPV_MODULES.map((m) => m.iconColor);
      expect(new Set(values).size).toBe(13);
      expect(values.length).toBe(13);
    });

    it("module -> accent assignment matches the frozen design.md D5 table", () => {
      for (const module of TPV_MODULES) {
        const expectedToken = D5_MODULE_ACCENTS[module.id];
        expect(expectedToken).toBeDefined();
        expect(module.iconColor).toBe(`text-[var(${expectedToken})]`);
      }
    });
  });
});
