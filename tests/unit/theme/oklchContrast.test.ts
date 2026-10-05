import {
  oklchContrastRatio,
  relativeLuminance,
  contrastRatio,
} from "../../helpers/oklchContrast";

// design.md S3 — known-value sanity checks for the shared OKLCH -> WCAG
// contrast helper (tests/helpers/oklchContrast.ts, reused unmodified from
// the seo-audit-followups/S7 change — see T3.2 deviation note in
// apply-progress). These pin the math itself, independent of any real
// token values parsed from src/index.css (that's accentContrast.test.ts).
describe("oklchContrast helper (known-value sanity)", () => {
  it("pure white vs pure black is ~21:1", () => {
    const ratio = oklchContrastRatio(
      { L: 1, C: 0, H: 0 },
      { L: 0, C: 0, H: 0 },
    );
    expect(ratio).toBeCloseTo(21, 1);
  });

  it("identical colors are exactly 1:1", () => {
    const ratio = oklchContrastRatio(
      { L: 0.5, C: 0.1, H: 180 },
      { L: 0.5, C: 0.1, H: 180 },
    );
    expect(ratio).toBeCloseTo(1, 5);
  });

  it("contrastRatio is symmetric regardless of argument order", () => {
    const y1 = relativeLuminance({ L: 0.3, C: 0.15, H: 40 });
    const y2 = relativeLuminance({ L: 0.9, C: 0.02, H: 40 });
    expect(contrastRatio(y1, y2)).toBeCloseTo(contrastRatio(y2, y1), 10);
  });

  it("design.md's cited dark on-accent (98% .005 250) has Y = 0.942", () => {
    const y = relativeLuminance({ L: 0.98, C: 0.005, H: 250 });
    expect(y).toBeCloseTo(0.942, 2);
  });

  it("reproduces design.md's cited pre-fix dark accent/on-accent ratio (~3.06)", () => {
    const ratio = oklchContrastRatio(
      { L: 0.65, C: 0.18, H: 250 },
      { L: 0.98, C: 0.005, H: 250 },
    );
    expect(ratio).toBeCloseTo(3.06, 1);
  });

  it("reproduces design.md's cited post-fix accent/on-accent ratio (~5.11)", () => {
    const ratio = oklchContrastRatio(
      { L: 0.52, C: 0.18, H: 250 },
      { L: 0.98, C: 0.005, H: 250 },
    );
    expect(ratio).toBeCloseTo(5.11, 1);
  });

  it("reproduces design.md's cited post-fix dark accent-hover/on-accent ratio (~6.85)", () => {
    const ratio = oklchContrastRatio(
      { L: 0.45, C: 0.18, H: 250 },
      { L: 0.98, C: 0.005, H: 250 },
    );
    expect(ratio).toBeCloseTo(6.85, 1);
  });
});
