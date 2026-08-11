import fs from "node:fs";
import path from "node:path";

// PR7 scope: swap the LAST 4 stub TPV_MODULE_SECTIONS entries (rbac-roles,
// food-cost-avanzado, sistema-alergenos, compras-sialti) for real bespoke
// components, per design.md D1/D4 — a single map-line change per module.
// App.tsx and tpvModules.ts are NOT reopened. After this PR, ALL 13
// TPV_MODULES entries have real components — zero stubs remain (see
// tpvModules.test.ts registry-completion gate).
const SRC = path.resolve(__dirname, "../../../../../src");
const MAP_PATH = path.join(SRC, "shared/components/tpv/TpvModuleSections.tsx");

describe("TPV_MODULE_SECTIONS wiring — PR7 modules batch 3 (final batch)", () => {
  const source = fs.readFileSync(MAP_PATH, "utf-8");

  it("imports the 4 real bespoke section components added in PR7", () => {
    expect(source).toMatch(
      /import RbacRolesSection from ["']\.\/RbacRolesSection["']/,
    );
    expect(source).toMatch(
      /import FoodCostAvanzadoSection from ["']\.\/FoodCostAvanzadoSection["']/,
    );
    expect(source).toMatch(
      /import SistemaAlergenosSection from ["']\.\/SistemaAlergenosSection["']/,
    );
    expect(source).toMatch(
      /import ComprasSialtiSection from ["']\.\/ComprasSialtiSection["']/,
    );
  });

  it("wires the 4 PR7 map entries to the real components, not createStubModuleSection", () => {
    expect(source).toMatch(/"rbac-roles":\s*RbacRolesSection/);
    expect(source).toMatch(/"food-cost-avanzado":\s*FoodCostAvanzadoSection/);
    expect(source).toMatch(/"sistema-alergenos":\s*SistemaAlergenosSection/);
    expect(source).toMatch(/"compras-sialti":\s*ComprasSialtiSection/);
  });

  it("the PR5/PR6 modules stay wired to their real components (regression guard)", () => {
    expect(source).toMatch(/"tpv-cobro":\s*TpvCobroSection/);
    expect(source).toMatch(/"comandero-movil":\s*ComanderoMovilSection/);
    expect(source).toMatch(/"kds-cocina":\s*KdsCocinaSection/);
    expect(source).toMatch(/"delivery-takeaway":\s*DeliveryTakeawaySection/);
    expect(source).toMatch(/"gestion-reservas":\s*GestionReservasSection/);
    expect(source).toMatch(
      /"fichajes-control-horario":\s*FichajesControlHorarioSection/,
    );
    expect(source).toMatch(/"stock-inventario":\s*StockInventarioSection/);
    expect(source).toMatch(/"multi-iva-igic":\s*MultiIvaIgicSection/);
  });

  it("no createStubModuleSection( usage remains in the map (registry-completion gate)", () => {
    expect(source).not.toMatch(/:\s*createStubModuleSection\(/);
  });
});
