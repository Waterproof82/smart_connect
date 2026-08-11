import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../../../src");
const COMPONENT_PATH = path.join(
  SRC,
  "shared/components/tpv/FoodCostAvanzadoSection.tsx",
);

describe("FoodCostAvanzadoSection (design.md D4 bespoke module template)", () => {
  it("exists", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("renders its own <section id> + aria-labelledby anchor matching the registry id", () => {
    const source = readSource();
    expect(source).toMatch(/id="food-cost-avanzado"/);
    expect(source).toMatch(/aria-labelledby="food-cost-avanzado-title"/);
  });

  it("h2 carries the section id-title anchor and uses the registry titleKey", () => {
    const source = readSource();
    expect(source).toMatch(/id="food-cost-avanzado-title"/);
    expect(source).toMatch(/t\.foodCostAvanzadoTitle/);
  });

  it("renders a benefit lead paragraph from the registry descKey", () => {
    const source = readSource();
    expect(source).toMatch(/t\.foodCostAvanzadoDesc/);
  });

  it("renders at least 4 bespoke benefit bullets via dedicated i18n keys", () => {
    const source = readSource();
    expect(source).toMatch(/t\.foodCostAvanzadoBullet1Title/);
    expect(source).toMatch(/t\.foodCostAvanzadoBullet2Title/);
    expect(source).toMatch(/t\.foodCostAvanzadoBullet3Title/);
    expect(source).toMatch(/t\.foodCostAvanzadoBullet4Title/);
  });

  it("renders a CTA (wa.me or #contacto), not hardcoded label text", () => {
    const source = readSource();
    expect(source).toMatch(/wa\.me|#contacto/);
    expect(source).toMatch(/t\.foodCostAvanzadoCtaLabel/);
  });

  it("accepts TpvModuleSectionProps (whatsappPhone) via type-only import (no circular runtime import)", () => {
    const source = readSource();
    expect(source).toMatch(
      /import type \{ TpvModuleSectionProps \} from ["']\.\/TpvModuleSections["']/,
    );
  });

  it("does not fabricate a specific unverifiable numeric margin/percentage stat", () => {
    const source = readSource();
    expect(source).not.toMatch(/\d+(\.\d+)?%/);
  });

  it("does not reference smartbar", () => {
    const source = readSource();
    expect(source).not.toMatch(/smartbar/i);
  });
});
