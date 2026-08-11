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

  it("the remaining 8 non-PR5 modules stay on createStubModuleSection (scope discipline)", () => {
    expect(source).toMatch(
      /"gestion-reservas":\s*createStubModuleSection/,
    );
    expect(source).toMatch(
      /"fichajes-control-horario":\s*createStubModuleSection/,
    );
    expect(source).toMatch(
      /"stock-inventario":\s*createStubModuleSection/,
    );
    expect(source).toMatch(/"multi-iva-igic":\s*createStubModuleSection/);
    expect(source).toMatch(/"rbac-roles":\s*createStubModuleSection/);
    expect(source).toMatch(
      /"food-cost-avanzado":\s*createStubModuleSection/,
    );
    expect(source).toMatch(
      /"sistema-alergenos":\s*createStubModuleSection/,
    );
    expect(source).toMatch(/"compras-sialti":\s*createStubModuleSection/);
  });
});
