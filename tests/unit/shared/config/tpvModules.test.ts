import { TPV_MODULES } from "@shared/config/tpvModules";
import { TPV_MODULE_SECTIONS } from "@shared/components/tpv/TpvModuleSections";

// Frozen module order — business decision, do not reorder (see design.md D2
// and apply-progress). Anchors become public URLs once shipped.
const FROZEN_ORDER = [
  "tpv-cobro",
  "comandero-movil",
  "kds-cocina",
  "gestion-reservas",
  "fichajes-control-horario",
  "delivery-takeaway",
  "stock-inventario",
  "multi-iva-igic",
  "rbac-roles",
  "food-cost-avanzado",
  "sistema-alergenos",
  "compras-sialti",
  "tienda-carta-digital",
];

describe("TPV_MODULES registry", () => {
  it("has exactly 13 entries in the frozen order", () => {
    const sorted = [...TPV_MODULES].sort((a, b) => a.order - b.order);
    expect(sorted.map((m) => m.id)).toEqual(FROZEN_ORDER);
  });

  it("every entry has a unique order value", () => {
    const orders = TPV_MODULES.map((m) => m.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("every entry's href anchor matches its id (anchor==id invariant)", () => {
    for (const module of TPV_MODULES) {
      expect(module.href).toBe(`#${module.id}`);
    }
  });

  it("every entry has real title/desc keys, a serviceValue, and jsonLd metadata", () => {
    for (const module of TPV_MODULES) {
      expect(typeof module.titleKey).toBe("string");
      expect(module.titleKey.length).toBeGreaterThan(0);
      expect(typeof module.descKey).toBe("string");
      expect(module.descKey.length).toBeGreaterThan(0);
      expect(typeof module.serviceValue).toBe("string");
      expect(module.serviceValue.length).toBeGreaterThan(0);
      expect(module.jsonLd).toBeDefined();
      expect(typeof module.jsonLd.description).toBe("string");
      expect(module.jsonLd.description.length).toBeGreaterThan(0);
      expect(typeof module.jsonLd.serviceType).toBe("string");
      expect(Array.isArray(module.jsonLd.areaServed)).toBe(true);
    }
  });

  it("registry <-> component parity: every TPV_MODULES id has a TPV_MODULE_SECTIONS entry", () => {
    for (const module of TPV_MODULES) {
      expect(TPV_MODULE_SECTIONS[module.id]).toBeDefined();
    }
  });

  it("registry <-> component parity: every TPV_MODULE_SECTIONS key has a TPV_MODULES entry", () => {
    const registryIds = new Set(TPV_MODULES.map((m) => m.id));
    for (const sectionId of Object.keys(TPV_MODULE_SECTIONS)) {
      expect(registryIds.has(sectionId)).toBe(true);
    }
  });

  it("never emits a qribar.es sameAs reference on any module", () => {
    for (const module of TPV_MODULES) {
      expect(module.jsonLd.sameAs).toBeUndefined();
    }
  });
});
