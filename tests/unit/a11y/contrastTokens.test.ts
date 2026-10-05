import fs from "node:fs";
import path from "node:path";
import {
  oklchContrastRatio,
  parseThemeTokens,
} from "../../helpers/oklchContrast";

// design.md D7 (seo-audit-followups, S7): the cookie banner's default
// button background moves from --color-accent to a new, stronger token
// so the default (non-hover) state clears 4.5:1 against --color-on-accent
// in both themes. The hover state keeps the existing --color-accent-hover
// token, which also clears 4.5:1 once gamut-mapped (dark 4.52, light
// 6.85) — too thin to be the DEFAULT state, acceptable as the hover state.
const CSS_PATH = path.resolve(__dirname, "../../../src/index.css");
const css = fs.readFileSync(CSS_PATH, "utf-8");
const { dark: darkVars, light: lightVars } = parseThemeTokens(css);

describe("cookie banner button contrast (design.md D7)", () => {
  it("declares --color-accent-strong in both :root (dark) and .light", () => {
    expect(darkVars.has("--color-accent-strong")).toBe(true);
    expect(lightVars.has("--color-accent-strong")).toBe(true);
  });

  it("dark --color-accent-strong is oklch(50% 0.18 250)", () => {
    const v = darkVars.get("--color-accent-strong")!;
    expect(v.L).toBeCloseTo(0.5, 5);
    expect(v.C).toBeCloseTo(0.18, 5);
    expect(v.H).toBeCloseTo(250, 5);
  });

  it("light --color-accent-strong is oklch(42% 0.18 250)", () => {
    const v = lightVars.get("--color-accent-strong")!;
    expect(v.L).toBeCloseTo(0.42, 5);
    expect(v.C).toBeCloseTo(0.18, 5);
    expect(v.H).toBeCloseTo(250, 5);
  });

  describe.each([
    ["--color-accent-strong", "default button state"],
    ["--color-accent-hover", "hover button state, unchanged token"],
  ])("%s vs --color-on-accent >= 4.5:1 (%s)", (token) => {
    it.each([
      ["dark", darkVars],
      ["light", lightVars],
    ])("%s theme", (_label, vars) => {
      const ratio = oklchContrastRatio(
        vars.get(token)!,
        vars.get("--color-on-accent")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("--color-accent-strong is still visually distinct from --color-accent-hover in both themes (>=2 L points)", () => {
    const darkStrong = darkVars.get("--color-accent-strong")!;
    const darkHover = darkVars.get("--color-accent-hover")!;
    expect(Math.abs(darkStrong.L - darkHover.L)).toBeGreaterThanOrEqual(0.02);

    const lightStrong = lightVars.get("--color-accent-strong")!;
    const lightHover = lightVars.get("--color-accent-hover")!;
    expect(Math.abs(lightStrong.L - lightHover.L)).toBeGreaterThanOrEqual(
      0.02,
    );
  });
});

describe("CookieBanner.tsx wires the new token", () => {
  const COOKIE_BANNER_PATH = path.resolve(
    __dirname,
    "../../../src/shared/components/CookieBanner.tsx",
  );
  const source = fs.readFileSync(COOKIE_BANNER_PATH, "utf-8");

  it("default background uses --color-accent-strong", () => {
    expect(source).toMatch(/bg-\[var\(--color-accent-strong\)\]/);
  });

  it("hover background still uses --color-accent-hover", () => {
    expect(source).toMatch(/hover:bg-\[var\(--color-accent-hover\)\]/);
  });
});
