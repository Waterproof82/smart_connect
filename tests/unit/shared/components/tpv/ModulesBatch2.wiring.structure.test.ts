import fs from "node:fs";
import path from "node:path";

// PR6 scope: swap 4 more stub TPV_MODULE_SECTIONS entries (gestion-reservas,
// fichajes-control-horario, stock-inventario, multi-iva-igic) for real
// bespoke components, per design.md D1/D4 — a single map-line change per
// module. App.tsx and tpvModules.ts are NOT reopened. rbac-roles,
// food-cost-avanzado, sistema-alergenos, compras-sialti remain stubs
// (deferred to PR7).
const SRC = path.resolve(__dirname, "../../../../../src");
const MAP_PATH = path.join(SRC, "shared/components/tpv/TpvModuleSections.tsx");

describe("TPV_MODULE_SECTIONS wiring — PR6 modules batch 2", () => {
  const source = fs.readFileSync(MAP_PATH, "utf-8");

  it("imports the 4 real bespoke section components added in PR6", () => {
    expect(source).toMatch(
      /import GestionReservasSection from ["']\.\/GestionReservasSection["']/,
    );
    expect(source).toMatch(
      /import FichajesControlHorarioSection from ["']\.\/FichajesControlHorarioSection["']/,
    );
    expect(source).toMatch(
      /import StockInventarioSection from ["']\.\/StockInventarioSection["']/,
    );
    expect(source).toMatch(
      /import MultiIvaIgicSection from ["']\.\/MultiIvaIgicSection["']/,
    );
  });

  it("wires the 4 PR6 map entries to the real components, not createStubModuleSection", () => {
    expect(source).toMatch(/"gestion-reservas":\s*GestionReservasSection/);
    expect(source).toMatch(
      /"fichajes-control-horario":\s*FichajesControlHorarioSection/,
    );
    expect(source).toMatch(/"stock-inventario":\s*StockInventarioSection/);
    expect(source).toMatch(/"multi-iva-igic":\s*MultiIvaIgicSection/);
  });

  it("the PR5 modules stay wired to their real components (regression guard)", () => {
    expect(source).toMatch(/"tpv-cobro":\s*TpvCobroSection/);
    expect(source).toMatch(/"comandero-movil":\s*ComanderoMovilSection/);
    expect(source).toMatch(/"kds-cocina":\s*KdsCocinaSection/);
    expect(source).toMatch(/"delivery-takeaway":\s*DeliveryTakeawaySection/);
  });

  it("the remaining 4 non-PR6 modules stay on createStubModuleSection (scope discipline)", () => {
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
