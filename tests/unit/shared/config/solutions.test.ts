import { SOLUTIONS } from "@shared/config/solutions";

describe("SOLUTIONS config", () => {
  it("has exactly 7 entries (pre-trim, WU1 additive stage)", () => {
    expect(SOLUTIONS).toHaveLength(7);
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

  it("carta-digital jsonLd carries sameAs pointing at qribar.es", () => {
    const cartaDigital = SOLUTIONS.find((s) => s.id === "carta-digital");
    expect(cartaDigital?.jsonLd.sameAs).toContain("https://qribar.es");
  });

  it("output is unchanged for existing consumers (hrefs untouched in WU1)", () => {
    const cartaDigital = SOLUTIONS.find((s) => s.id === "carta-digital");
    const tarjetasNfc = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");
    expect(cartaDigital?.href).toBe("/carta-digital");
    expect(tarjetasNfc?.href).toBe("/tap-review");
  });

  it("does not export ROUTE_TO_SOLUTION_ID anymore (dropped once SOLUTIONS is the single source of truth)", () => {
    const mod: Record<string, unknown> = require("@shared/config/solutions");
    expect(mod.ROUTE_TO_SOLUTION_ID).toBeUndefined();
  });
});
