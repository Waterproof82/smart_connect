import { cartaDiferenciacionCopy } from "@shared/i18n/modules/carta-diferenciacion";

/**
 * Trust-claims guard for the Carta Digital differentiation copy
 * (security + real contact person, SEO/GEO loop, full ecosystem, table
 * payment with tips, 30-day trial). Same banned list as
 * keywordCopy.claims.test.ts plus any "guarantee" wording in either
 * language and any unsourced percentage/figure beyond the facts the
 * owner confirmed (0 % commission, 5 languages, 30 days, 30 min / 1 h).
 */

const BANNED_SUBSTRINGS = [
  "Tapstar",
  "ayudas",
  "ayuda económica",
  "Envío gratis",
  "free shipping",
  "Soporte 24/7",
  "24/7 Support",
  "600K",
  "+400",
  "4.9/5",
  "QRiBar",
  "qribar",
  "te atendemos en persona en tu local",
];

const ALLOWED_FIGURES = /^(0 %|0%|5|30|1|2|3|4)$/;

const es = cartaDiferenciacionCopy.es as unknown as Record<string, string>;
const en = cartaDiferenciacionCopy.en as unknown as Record<string, string>;

describe("carta-diferenciacion copy", () => {
  it("has identical key sets in es and en", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it("has no empty strings", () => {
    for (const value of [...Object.values(es), ...Object.values(en)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it("contains no banned claim", () => {
    for (const value of [...Object.values(es), ...Object.values(en)]) {
      for (const banned of BANNED_SUBSTRINGS) {
        expect(value).not.toContain(banned);
      }
    }
  });

  it("never promises a guarantee", () => {
    for (const value of [...Object.values(es), ...Object.values(en)]) {
      expect(value).not.toMatch(/garant|guarantee/i);
    }
  });

  it("only uses owner-confirmed figures", () => {
    for (const value of [...Object.values(es), ...Object.values(en)]) {
      const figures = value.match(/\d+(\s?%)?/g) ?? [];
      for (const figure of figures) {
        expect(figure.trim()).toMatch(ALLOWED_FIGURES);
      }
    }
  });

  it("spells Veri*factu consistently", () => {
    for (const value of [...Object.values(es), ...Object.values(en)]) {
      expect(value).not.toMatch(/verifactu|VeriFactu|Verifactu/);
    }
  });
});
