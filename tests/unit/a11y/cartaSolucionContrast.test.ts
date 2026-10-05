import fs from "node:fs";
import path from "node:path";
import {
  oklchContrastRatio,
  parseThemeTokens,
} from "../../helpers/oklchContrast";

// Lighthouse (2026-10-05) flagged the /carta-digital "solución" description:
// --color-text-muted on the --color-success-bg card measured 4.02:1 in dark
// mode (16px normal text needs 4.5:1). Body copy on that tinted card uses the
// full --color-text token instead.
const ROOT = path.resolve(__dirname, "../../..");
const css = fs.readFileSync(path.join(ROOT, "src/index.css"), "utf-8");
const section = fs.readFileSync(
  path.join(
    ROOT,
    "src/features/landing/presentation/components/CartaDigitalSolucionSection.tsx",
  ),
  "utf-8",
);
const { dark, light } = parseThemeTokens(css);

describe("carta digital solución card text contrast", () => {
  it("the description paragraph does not use the muted text token", () => {
    const para = section.match(/<p className="([^"]*)">\s*\{t\.cartaSolucionDesc\}/);
    expect(para).not.toBeNull();
    expect(para![1]).not.toMatch(/\btext-muted\b/);
    expect(para![1]).toMatch(/\btext-default\b/);
  });

  it.each([
    ["dark", dark],
    ["light", light],
  ])("--color-text on --color-success-bg >= 4.5:1 (%s)", (_label, vars) => {
    const ratio = oklchContrastRatio(
      vars.get("--color-text")!,
      vars.get("--color-success-bg")!,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
