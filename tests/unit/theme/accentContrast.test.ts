import fs from "node:fs";
import path from "node:path";
import {
  oklchContrastRatio,
  parseThemeTokens,
} from "../../helpers/oklchContrast";

// design.md S3 (F-03) — retunes --color-accent/--color-accent-hover to
// clear 4.5:1 against --color-on-accent in both themes, plus two
// orchestrator-added checks: --color-on-accent-muted against the new
// accent (chat header footer text + DashboardPreview's "Plan Pro"
// subtitle), and a broader regression sweep of every text/background pair
// used for normal text in both themes (text-muted/surface, text-muted/bg,
// primary text on bg/surface).
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
    // (ExpertAssistantWithRAG.tsx) + DashboardPreview.tsx:136.
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

// Orchestrator addition #2 (DashboardPreview.tsx:139's inverted CTA):
// light-theme --color-text / --color-accent is MATHEMATICALLY impossible
// to satisfy >=4.5:1 at the same time as --color-accent/--color-on-accent
// >=4.5:1 (proven in apply-progress: requires Y_accent >= ~0.197 for the
// text pair and Y_accent <= ~0.170 for the on-accent pair simultaneously —
// a contradiction, given --color-text, --color-on-accent, hue and chroma
// are all fixed). The fix is therefore a component change, not a token
// change: DashboardPreview.tsx no longer pairs --color-text with
// --color-accent for normal text; it uses --color-on-accent instead
// (same pairing as .btn-primary-inverse, which already clears 4.5:1).
describe("DashboardPreview.tsx no longer uses the unsatisfiable text/accent pair", () => {
  const COMPONENT_PATH = path.resolve(
    __dirname,
    "../../../src/shared/components/DashboardPreview.tsx",
  );
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("the Plan Pro card title does not use text-default on the accent card", () => {
    const titleMatch = source.match(
      /<h4 className="([^"]*)">\s*\{t\.dashboardPlanPro\}/,
    );
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1]).not.toMatch(/\btext-default\b/);
    expect(titleMatch![1]).toMatch(/text-\[var\(--color-on-accent\)\]/);
  });

  it("the inverted CTA pill no longer pairs bg-[var(--color-text)] with text-[var(--color-accent)]", () => {
    expect(source).not.toMatch(
      /bg-\[var\(--color-text\)\][^"]*text-\[var\(--color-accent\)\]/,
    );
  });

  it("the inverted CTA pill uses bg-[var(--color-on-accent)] + text-[var(--color-accent)] (same pairing as .btn-primary-inverse)", () => {
    const ctaMatch = source.match(
      /<div className="([^"]*)">\s*\{t\.dashboardManage\}/,
    );
    expect(ctaMatch).not.toBeNull();
    expect(ctaMatch![1]).toMatch(/bg-\[var\(--color-on-accent\)\]/);
    expect(ctaMatch![1]).toMatch(/text-\[var\(--color-accent\)\]/);
  });
});
