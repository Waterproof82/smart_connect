import fs from "node:fs";
import path from "node:path";
import {
  oklchContrastRatio,
  parseThemeTokens,
} from "../../helpers/oklchContrast";

// design.md S3 (F-03) — retunes --color-accent/--color-accent-hover to
// clear 4.5:1 against --color-on-accent in both themes, plus two
// orchestrator-added checks: --color-on-accent-muted against the new
// accent (chat header footer text), and a broader regression sweep of
// every text/background pair used for normal text in both themes
// (text-muted/surface, text-muted/bg, primary text on bg/surface).
const CSS_PATH = path.resolve(__dirname, "../../../src/index.css");
const css = fs.readFileSync(CSS_PATH, "utf-8");
const { dark: darkVars, light: lightVars } = parseThemeTokens(css);

const THEMES: Array<["dark" | "light", Map<string, { L: number; C: number; H: number }>]> = [
  ["dark", darkVars],
  ["light", lightVars],
];

describe("accent token contrast (design.md S3 / F-03)", () => {
  describe.each(THEMES)("%s theme", (_label, vars) => {
    it("--color-accent vs --color-on-accent >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-accent")!,
        vars.get("--color-on-accent")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-accent-hover vs --color-on-accent >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-accent-hover")!,
        vars.get("--color-on-accent")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    // orchestrator addition: chat header footer text
    // (ExpertAssistantWithRAG.tsx).
    it("--color-accent vs --color-on-accent-muted >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-accent")!,
        vars.get("--color-on-accent-muted")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-text-muted (carta step numbers) vs --color-surface >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-text-muted")!,
        vars.get("--color-surface")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-text-muted vs --color-bg >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-text-muted")!,
        vars.get("--color-bg")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-text (primary text) vs --color-bg >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-text")!,
        vars.get("--color-bg")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("--color-text (primary text) vs --color-surface >= 4.5:1", () => {
      const ratio = oklchContrastRatio(
        vars.get("--color-text")!,
        vars.get("--color-surface")!,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("--color-accent hue is unchanged (250) in both themes after the retune", () => {
    expect(darkVars.get("--color-accent")!.H).toBe(250);
    expect(lightVars.get("--color-accent")!.H).toBe(250);
  });

  it("--color-accent-hover hue is unchanged (250) in both themes after the retune", () => {
    expect(darkVars.get("--color-accent-hover")!.H).toBe(250);
    expect(lightVars.get("--color-accent-hover")!.H).toBe(250);
  });

  it("--color-accent chroma is unchanged (0.18) in both themes (lightness-only retune, D8)", () => {
    expect(darkVars.get("--color-accent")!.C).toBeCloseTo(0.18, 5);
    expect(lightVars.get("--color-accent")!.C).toBeCloseTo(0.18, 5);
  });
});
