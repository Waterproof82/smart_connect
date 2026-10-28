import fs from "node:fs";
import path from "node:path";

/**
 * F-07 (2026-10-28): the NFC supplier photo (MontesTAP) has no usage rights.
 * It must not be referenced anywhere nor shipped in public/. Home and carta
 * digital use the own Google-review card; the NFC page uses the own card.
 */
const ROOT = path.resolve(__dirname, "../../..");
const SRC = path.join(ROOT, "src");
const read = (relPath: string) =>
  fs.readFileSync(path.join(SRC, relPath), "utf-8");

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

describe("NFC images: no supplier photo without rights (F-07)", () => {
  it("no source file references the MontesTAP photo", () => {
    const offenders = walk(SRC).filter((file) =>
      /MontesTAP/.test(fs.readFileSync(file, "utf-8")),
    );
    expect(offenders).toEqual([]);
  });

  it("the MontesTAP photo is not shipped in public/", () => {
    expect(
      fs.existsSync(path.join(ROOT, "public/assets/Tarjeta_NFC_negra_MontesTAP.webp")),
    ).toBe(false);
  });

  it("home hub and carta digital use the own Google-review card", () => {
    const own = /\/assets\/nfc\/tarjeta_nfc_google\.webp/;
    expect(read("features/landing/presentation/components/HomeSolutionsSection.tsx")).toMatch(own);
    expect(read("features/landing/presentation/components/CartaDigitalSolucionSection.tsx")).toMatch(own);
  });

  it("NFC page gallery falls back to the own NFC card", () => {
    expect(read("features/tap-review/presentation/components/ProductGallery.tsx")).toMatch(
      /\/assets\/nfc\/tarjeta_nfc\.webp/,
    );
  });

  it("no supplier SKU-style filenames remain in public/ or the image script", () => {
    const sku = /^S[0-9a-f]{32}m?\.jpg_/;
    expect(fs.readdirSync(path.join(ROOT, "public/assets/nfc")).filter((f) => sku.test(f))).toEqual([]);
    const script = fs.readFileSync(path.join(ROOT, "scripts/optimize-images.mjs"), "utf-8");
    expect(script).not.toMatch(/\.jpg_640x640q75/);
    expect(script).not.toMatch(/NFC_RENAMES|renameNfcGalleryAssets/);
  });

  it("own card images exist in public/", () => {
    for (const name of ["tarjeta_nfc_google.webp", "tarjeta_nfc.webp"]) {
      expect(fs.existsSync(path.join(ROOT, "public/assets/nfc", name))).toBe(true);
    }
  });
});
