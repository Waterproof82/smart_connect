import fs from "node:fs";
import path from "node:path";

// Home simplification (2026-10): home is a hub. The two flagship products
// (Carta Digital, Tarjetas NFC) and the secondary services (IA chatbots,
// TPV) are cards linking to their own indexable pages; none of their full
// content is rendered on home.
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");
const HUB = "features/landing/presentation/components/HomeSolutionsSection.tsx";

describe("Home hub (App.tsx + HomeSolutionsSection)", () => {
  it("App.tsx does not render Features.tsx, TapReviewSection or the NFC product image", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/<Features\b/);
    expect(appSource).not.toMatch(/<TapReviewSection/);
    expect(appSource).not.toMatch(/Tarjeta_NFC_negra_MontesTAP/);
    expect(
      fs.existsSync(path.join(SRC, "features/landing/presentation/components/Features.tsx")),
    ).toBe(false);
  });

  it("hub links to all four product/service pages", () => {
    const hub = read(HUB);
    for (const url of [
      "/carta-digital",
      "/tarjetas-nfc",
      "/ia-chatbots-tenerife",
      "/tpv-restaurantes",
    ]) {
      expect(hub).toMatch(new RegExp(`to: "${url}"`));
    }
  });

  it("hub declares no <h1> (Hero owns the page H1)", () => {
    expect(read(HUB)).not.toMatch(/<h1[\s>]/);
  });

  it("flagship Carta Digital card uses the no-commission (Glovo) message", () => {
    expect(read(HUB)).toMatch(/t\.cartaTeaserTitle/);
  });
});
