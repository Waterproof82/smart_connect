import fs from "node:fs";
import path from "node:path";

// See CartaDigitalSection.structure.test.ts for why these are source-text
// checks instead of RTL renders (no jest-environment-jsdom in this repo).
const SRC = path.resolve(__dirname, "../../../../../src");
const read = (relPath: string) =>
  fs.readFileSync(path.join(SRC, relPath), "utf-8");

describe("TpvModulesSection (design.md D1/D2 composition seam)", () => {
  it("sorts TPV_MODULES by order before mounting", () => {
    const source = read("shared/components/tpv/TpvModulesSection.tsx");
    expect(source).toMatch(/sort\(\(a,\s*b\)\s*=>\s*a\.order\s*-\s*b\.order\)/);
  });

  it("looks up each module's component via TPV_MODULE_SECTIONS, no hardcoded module JSX", () => {
    const source = read("shared/components/tpv/TpvModulesSection.tsx");
    expect(source).toMatch(/TPV_MODULE_SECTIONS\[module\.id\]/);
    expect(source).not.toMatch(/<CartaDigitalSection/);
  });

  it("TPV_MODULE_SECTIONS has all 13 module keys, tienda-carta-digital wired to the real CartaDigitalSection", () => {
    const source = read("shared/components/tpv/TpvModuleSections.tsx");
    const expectedIds = [
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
    for (const id of expectedIds) {
      expect(source).toMatch(new RegExp(`"${id}":`));
    }
    expect(source).toMatch(/import CartaDigitalSection from/);
    expect(source).toMatch(
      /"tienda-carta-digital":\s*TiendaCartaDigitalModuleSection/,
    );
  });

  it("stub sections render their own <section id={id}> wrapper (D4)", () => {
    const source = read("shared/components/tpv/TpvModuleSections.tsx");
    expect(source).toMatch(/<section\s+id=\{id\}/);
    expect(source).toMatch(/aria-labelledby=\{`\$\{id\}-title`\}/);
  });
});
