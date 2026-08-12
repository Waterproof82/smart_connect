import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../../../src");
const COMPONENT_PATH = path.join(
  SRC,
  "shared/components/tpv/DeliveryTakeawaySection.tsx",
);

describe("DeliveryTakeawaySection (design.md D4 bespoke module template)", () => {
  it("exists", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("renders its own <section id> + aria-labelledby anchor matching the registry id", () => {
    const source = readSource();
    expect(source).toMatch(/id="delivery-takeaway"/);
    expect(source).toMatch(/aria-labelledby="delivery-takeaway-title"/);
  });

  it("h2 carries the section id-title anchor and uses the registry titleKey", () => {
    const source = readSource();
    expect(source).toMatch(/id="delivery-takeaway-title"/);
    expect(source).toMatch(/t\.deliveryTakeawayTitle/);
  });

  it("renders a benefit lead paragraph from the registry descKey", () => {
    const source = readSource();
    expect(source).toMatch(/t\.deliveryTakeawayDesc/);
  });

  it("renders at least 4 bespoke benefit bullets via dedicated i18n keys", () => {
    const source = readSource();
    expect(source).toMatch(/t\.deliveryTakeawayBullet1Title/);
    expect(source).toMatch(/t\.deliveryTakeawayBullet2Title/);
    expect(source).toMatch(/t\.deliveryTakeawayBullet3Title/);
    expect(source).toMatch(/t\.deliveryTakeawayBullet4Title/);
  });

  it("renders a CTA (wa.me or #contacto), not hardcoded label text", () => {
    const source = readSource();
    expect(source).toMatch(/wa\.me|#contacto/);
    expect(source).toMatch(/t\.deliveryTakeawayCtaLabel/);
  });

  it("accepts TpvModuleSectionProps (whatsappPhone) via type-only import (no circular runtime import)", () => {
    const source = readSource();
    expect(source).toMatch(
      /import type \{ TpvModuleSectionProps \} from ["']\.\/TpvModuleSections["']/,
    );
  });

  it("does not fabricate a specific unverifiable numeric stat beyond the site's existing truthful 0%-commissions claim", () => {
    const source = readSource();
    const percentMatches = source.match(/\d+%/g) ?? [];
    for (const match of percentMatches) {
      expect(match).toBe("0%");
    }
  });

  it("does not reference smartbar", () => {
    const source = readSource();
    expect(source).not.toMatch(/smartbar/i);
  });
});
