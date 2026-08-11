import { SOLUTIONS } from "@shared/config/solutions";

describe("SOLUTIONS config", () => {
  it("has exactly 2 entries: carta-digital and tarjetas-nfc", () => {
    expect(SOLUTIONS.map((s) => s.id)).toEqual(["carta-digital", "tarjetas-nfc"]);
  });

  it("every entry has the base shape used by Navbar/Features/Contact", () => {
    for (const solution of SOLUTIONS) {
      expect(typeof solution.id).toBe("string");
      expect(typeof solution.icon).toBe("string");
      expect(typeof solution.titleKey).toBe("string");
      expect(typeof solution.descKey).toBe("string");
      expect(typeof solution.href).toBe("string");
      expect(typeof solution.iconColor).toBe("string");
    }
  });

  it("every entry has a serviceValue matching the Contact form dropdown values", () => {
    for (const solution of SOLUTIONS) {
      expect(typeof solution.serviceValue).toBe("string");
      expect(solution.serviceValue.length).toBeGreaterThan(0);
    }
  });

  it("every entry has jsonLd metadata (description, serviceType, areaServed)", () => {
    for (const solution of SOLUTIONS) {
      expect(solution.jsonLd).toBeDefined();
      expect(typeof solution.jsonLd.description).toBe("string");
      expect(typeof solution.jsonLd.serviceType).toBe("string");
      expect(Array.isArray(solution.jsonLd.areaServed)).toBe(true);
    }
  });

  it("carta-digital jsonLd no longer carries a qribar.es sameAs reference (purged)", () => {
    const cartaDigital = SOLUTIONS.find((s) => s.id === "carta-digital");
    expect(cartaDigital?.jsonLd.sameAs).toBeUndefined();
  });

  it("carta-digital href is an in-page anchor, pointing at the tienda-carta-digital TPV module section (PR4)", () => {
    const cartaDigital = SOLUTIONS.find((s) => s.id === "carta-digital");
    expect(cartaDigital?.href).toBe("#tienda-carta-digital");
  });

  it("tarjetas-nfc href is the standalone route, no longer an in-page anchor (PR3 un-merge)", () => {
    const tarjetasNfc = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");
    expect(tarjetasNfc?.href).toBe("/tarjetas-nfc");
    expect(tarjetasNfc?.internal).toBe(true);
  });

  it("no entry is external anymore (QRIBAR standalone entry removed)", () => {
    expect(SOLUTIONS.some((s) => s.external)).toBe(false);
  });

  it("does not export ROUTE_TO_SOLUTION_ID anymore (dropped once SOLUTIONS is the single source of truth)", () => {
    const mod: Record<string, unknown> = require("@shared/config/solutions");
    expect(mod.ROUTE_TO_SOLUTION_ID).toBeUndefined();
  });
});
