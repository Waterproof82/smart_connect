import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../../../src");
const COMPONENT_PATH = path.join(
  SRC,
  "shared/components/tpv/ComanderoMovilSection.tsx",
);

describe("ComanderoMovilSection (design.md D4 bespoke module template)", () => {
  it("exists", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("renders its own <section id> + aria-labelledby anchor matching the registry id", () => {
    const source = readSource();
    expect(source).toMatch(/id="comandero-movil"/);
    expect(source).toMatch(/aria-labelledby="comandero-movil-title"/);
  });

  it("h2 carries the section id-title anchor and uses the registry titleKey", () => {
    const source = readSource();
    expect(source).toMatch(/id="comandero-movil-title"/);
    expect(source).toMatch(/t\.comanderoMovilTitle/);
  });

  it("renders a benefit lead paragraph from the registry descKey", () => {
    const source = readSource();
    expect(source).toMatch(/t\.comanderoMovilDesc/);
  });

  it("renders at least 4 bespoke benefit bullets via dedicated i18n keys", () => {
    const source = readSource();
    expect(source).toMatch(/t\.comanderoMovilBullet1Title/);
    expect(source).toMatch(/t\.comanderoMovilBullet2Title/);
    expect(source).toMatch(/t\.comanderoMovilBullet3Title/);
    expect(source).toMatch(/t\.comanderoMovilBullet4Title/);
  });

  it("never claims voice-ordering capability (mobile order-taking only)", () => {
    const source = readSource();
    expect(source).not.toMatch(/voz|voice/i);
  });

  it("renders a CTA (wa.me or #contacto), not hardcoded label text", () => {
    const source = readSource();
    expect(source).toMatch(/wa\.me|#contacto/);
    expect(source).toMatch(/t\.comanderoMovilCtaLabel/);
  });

  it("accepts TpvModuleSectionProps (whatsappPhone) via type-only import (no circular runtime import)", () => {
    const source = readSource();
    expect(source).toMatch(
      /import type \{ TpvModuleSectionProps \} from ["']\.\/TpvModuleSections["']/,
    );
  });

  it("does not reference smartbar", () => {
    const source = readSource();
    expect(source).not.toMatch(/smartbar/i);
  });
});
