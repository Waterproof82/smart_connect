import fs from "node:fs";
import path from "node:path";

// PR5 scope: swap 4 stub TPV_MODULE_SECTIONS entries (tpv-cobro,
// comandero-movil, kds-cocina, delivery-takeaway) for real bespoke
// components, per design.md D1/D4 — a single map-line change per module,
// App.tsx and tpvModules.ts are NOT reopened.
const SRC = path.resolve(__dirname, "../../../../../src");
const MAP_PATH = path.join(SRC, "shared/components/tpv/TpvModuleSections.tsx");

describe("TPV_MODULE_SECTIONS wiring — PR5 modules batch 1", () => {
  const source = fs.readFileSync(MAP_PATH, "utf-8");

  it("imports the 4 real bespoke section components", () => {
    expect(source).toMatch(
      /import TpvCobroSection from ["']\.\/TpvCobroSection["']/,
    );
    expect(source).toMatch(
      /import ComanderoMovilSection from ["']\.\/ComanderoMovilSection["']/,
    );
    expect(source).toMatch(
      /import KdsCocinaSection from ["']\.\/KdsCocinaSection["']/,
    );
    expect(source).toMatch(
      /import DeliveryTakeawaySection from ["']\.\/DeliveryTakeawaySection["']/,
    );
  });

  it("wires the 4 map entries to the real components, not createStubModuleSection", () => {
    expect(source).toMatch(/"tpv-cobro":\s*TpvCobroSection/);
    expect(source).toMatch(/"comandero-movil":\s*ComanderoMovilSection/);
    expect(source).toMatch(/"kds-cocina":\s*KdsCocinaSection/);
    expect(source).toMatch(/"delivery-takeaway":\s*DeliveryTakeawaySection/);
  });

  // gestion-reservas, fichajes-control-horario, stock-inventario, and
  // multi-iva-igic were stubs as of PR5 but shipped real components in PR6
  // — see ModulesBatch2.wiring.structure.test.ts for their coverage.
  // rbac-roles, food-cost-avanzado, sistema-alergenos, and compras-sialti
  // were stubs as of PR5/PR6 but shipped real components in PR7 (the final
  // batch) — see ModulesBatch3.wiring.structure.test.ts for their coverage
  // and tpvModules.test.ts for the registry-completion gate. No modules
  // remain on createStubModuleSection after PR7.
});
