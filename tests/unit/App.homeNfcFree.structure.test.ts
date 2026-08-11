import fs from "node:fs";
import path from "node:path";

// PR9 regression (closes the CRITICAL from sdd-verify on
// digitaliza-tenerife-tpv-rebrand): home must show ONLY the 13 TPV modules
// since PR3 un-merged NFC to its own /tarjetas-nfc route. Two locations
// were confirmed still rendering real NFC marketing content on home:
//   1. Features.tsx's "Nuestras Soluciones" grid (NFC card: image, title,
//      description, CTA — sourced from SOLUTIONS).
//   2. App.tsx's "Pilares Tecnológicos" grid (hardcoded NFC pillar).
// This test asserts App.tsx's composed home output is NFC-free. The
// standalone /tarjetas-nfc route (TapReviewPage.tsx / TapReviewSection.tsx)
// is explicitly NOT covered here — that content must stay untouched.
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

describe("Home (App.tsx) contains zero NFC marketing content (PR9 regression)", () => {
  it("App.tsx does not import or render Features.tsx", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/<Features\b/);
    expect(appSource).not.toMatch(
      /from ["']@features\/landing\/presentation\/components\/Features["']/,
    );
  });

  it("App.tsx's 'Pilares Tecnológicos' block has no NFC pillar", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/Tarjetas NFC/i);
    expect(appSource).not.toMatch(/Tap-to-Review/i);
  });

  it("App.tsx does not reference the NFC product image", () => {
    const appSource = read("App.tsx");
    expect(appSource).not.toMatch(/Tarjeta_NFC_negra_MontesTAP/);
  });

  it("Features.tsx no longer exists as a standalone home component (superseded by TpvModulesSection)", () => {
    const featuresPath = path.join(
      SRC,
      "features/landing/presentation/components/Features.tsx",
    );
    expect(fs.existsSync(featuresPath)).toBe(false);
  });

  it("still mounts TpvModulesSection inside #soluciones, before #por-que (PR4 seam intact)", () => {
    const appSource = read("App.tsx");
    const solucionesIdx = appSource.indexOf('id="soluciones"');
    const tpvModulesIdx = appSource.indexOf("<TpvModulesSection");
    const porQueIdx = appSource.indexOf('id="por-que"');

    expect(solucionesIdx).toBeGreaterThan(-1);
    expect(tpvModulesIdx).toBeGreaterThan(solucionesIdx);
    expect(porQueIdx).toBeGreaterThan(tpvModulesIdx);
  });
});
