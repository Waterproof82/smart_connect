import fs from "node:fs";
import path from "node:path";

/**
 * Trust-claims guard — SEO keyword copy, Slice A only (SDD
 * `seo-keyword-copy`, Phase 1 / PR A). Scoped to the exact strings this
 * slice adds/changes (`trust-claims` spec + Project Standards): no
 * "Tapstar", no "ayudas", no guarantee/free-shipping/24-7-support claim, no
 * unsourced figure, no fabricated client/case-study framing, and (as a
 * repo-wide regression guard carried over from the existing convention)
 * never "QRiBar" without the space.
 */

const ROOT = path.resolve(__dirname, "../../../");
const LANGUAGE_CONTEXT_PATH = path.join(
  ROOT,
  "src/shared/context/LanguageContext.tsx",
);
const PAGE_COPY_PATH = path.join(
  ROOT,
  "src/shared/i18n/modules/page-copy.ts",
);
const IA_PAGE_PATH = path.join(
  ROOT,
  "src/features/landing/presentation/components/IaChatbotsPage.tsx",
);

const languageContextSource = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");
const pageCopySource = fs.readFileSync(PAGE_COPY_PATH, "utf-8");
const iaPageSource = fs.readFileSync(IA_PAGE_PATH, "utf-8");

/** Extracts a key's string literal value(s) — may be more than one (es+en). */
function valuesOf(source: string, key: string): string[] {
  const matches = [
    ...source.matchAll(new RegExp(`${key}:\\s*\\n?\\s*"([^"]*)"`, "g")),
  ];
  return matches.map((m) => m[1]);
}

const SLICE_A_KEYS = [
  "tapReviewHowTitle",
  "tapReviewFeatTitle",
  "tapReviewFAQ4Question",
  "tapReviewFAQ4Answer",
];

const SLICE_A_IA_KEYS = [
  "iaH1",
  "iaChatbotsTitle",
  "iaCasesTitle",
  "iaCasesIntro",
  "iaCase1Desc",
  "iaCase2Desc",
  "iaCase3Desc",
  "iaFaqQ6",
  "iaFaqA6",
];

const BANNED_SUBSTRINGS = [
  "Tapstar",
  "ayudas",
  "ayuda económica",
  "Garantía",
  "guarantee",
  "Envío gratis",
  "free shipping",
  "Soporte 24/7",
  "24/7 Support",
  "600K",
  "+400",
  "4.9/5",
  "QRiBar",
  "qribar",
];

describe("Slice A new/changed strings contain no banned claim (LanguageContext.tsx tapReview*)", () => {
  for (const key of SLICE_A_KEYS) {
    it(`${key} is clean`, () => {
      const values = valuesOf(languageContextSource, key);
      expect(values.length).toBeGreaterThanOrEqual(2); // es + en
      for (const value of values) {
        for (const banned of BANNED_SUBSTRINGS) {
          expect(value).not.toContain(banned);
        }
      }
    });
  }
});

describe("Slice A new/changed strings contain no banned claim (page-copy.ts ia*)", () => {
  for (const key of SLICE_A_IA_KEYS) {
    it(`${key} is clean`, () => {
      const values = valuesOf(pageCopySource, key);
      expect(values.length).toBeGreaterThanOrEqual(2); // es + en
      for (const value of values) {
        for (const banned of BANNED_SUBSTRINGS) {
          expect(value).not.toContain(banned);
        }
      }
    });
  }
});

describe("Slice A new/changed strings contain no banned claim (IaChatbotsPage.tsx PAGE_TITLE/DESCRIPTION/og:alt)", () => {
  it("is clean", () => {
    for (const banned of BANNED_SUBSTRINGS) {
      expect(iaPageSource).not.toContain(banned);
    }
  });
});

describe("iaCase1-3Desc do not fabricate a named client or a case-study result", () => {
  it("no 'Restaurante X dice...' / 'cliente de Tenerife logró...' framing", () => {
    const values = [
      ...valuesOf(pageCopySource, "iaCase1Desc"),
      ...valuesOf(pageCopySource, "iaCase2Desc"),
      ...valuesOf(pageCopySource, "iaCase3Desc"),
    ];
    expect(values.length).toBe(6);
    for (const value of values) {
      expect(value).not.toMatch(/logr(ó|a)|aumentó|increased|achieved/i);
      expect(value).not.toMatch(/"[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ (S\.|M\.)"/);
    }
  });
});

describe("Brand spacing — 'QR iBar' (with space), never 'QRiBar', anywhere the brand name is used in Slice A files", () => {
  it("no file touched by Slice A uses the closed-spacing form", () => {
    for (const source of [languageContextSource, pageCopySource, iaPageSource]) {
      expect(source).not.toMatch(/QRiBar/i);
    }
  });
});
