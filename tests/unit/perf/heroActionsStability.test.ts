import fs from "node:fs";
import path from "node:path";

/**
 * CLS guard for the hero action rows (`.ds-actions`).
 *
 * On a 412px mobile viewport the two hero buttons ("Contactar ahora" +
 * "Ver producto") fit on one row with the metric-matched Arial fallback but
 * wrap onto two rows once DM Sans swaps in, pushing the NFC gallery down
 * (layout shift 0.112, measured 2026-10-05 with Lighthouse-equivalent
 * throttling). Average-width font metrics cannot make a specific string fit,
 * so narrow screens stack the actions full-width: the row height is then the
 * same whatever font is rendering.
 */
const INDEX_CSS = fs.readFileSync(
  path.resolve(__dirname, "../../../src/index.css"),
  "utf-8",
);

describe("hero actions layout is font-independent on narrow screens", () => {
  it("stacks .ds-actions as a full-width column below 480px", () => {
    const media = INDEX_CSS.match(
      /@media\s*\(max-width:\s*479px\)\s*\{[\s\S]*?\.ds-actions\s*\{([^}]*)\}/,
    );
    expect(media).not.toBeNull();
    const body = media![1];
    expect(body).toMatch(/flex-direction:\s*column/);
    expect(body).toMatch(/align-items:\s*stretch/);
  });
});
