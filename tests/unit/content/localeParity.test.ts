import fs from "node:fs";
import path from "node:path";

/**
 * ES/EN key-parity test (seo-trust-claims-cleanup PR2b, tasks.md 2b.12,
 * trust-claims spec "ES/EN Key Parity").
 *
 * `translations` is typed `Record<Language, Translation>` (design.md),
 * which already gives full compile-time parity via `npx tsc --noEmit`
 * (excess-property checks on the object literals catch both a missing key
 * and a key that doesn't exist on `Translation`). This test is the
 * documented, explicit runtime check the spec's scenario asks for: it
 * parses the literal keys declared directly in the `es: {...}` and
 * `en: {...}` blocks (not the `...tpvModuleEs`/`...tpvModuleEn` spread,
 * which is parity-checked the same way by `tsc` but lives in a separate
 * module) and asserts the two sets are identical, with none of the keys
 * this change removed.
 */
const LANGUAGE_CONTEXT_PATH = path.resolve(
  __dirname,
  "../../../src/shared/context/LanguageContext.tsx",
);

const extractKeys = (block: string): string[] =>
  [...block.matchAll(/^\s{4}([A-Za-z_][A-Za-z0-9_]*):/gm)].map((m) => m[1]);

describe("LanguageContext es/en key parity (seo-trust-claims-cleanup PR2b)", () => {
  const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");

  const esStart = source.indexOf("\n  es: {");
  const enStart = source.indexOf("\n  en: {");
  const closeIndex = source.indexOf("\n};", enStart);

  it("locates the es and en translation blocks", () => {
    expect(esStart).toBeGreaterThan(-1);
    expect(enStart).toBeGreaterThan(esStart);
    expect(closeIndex).toBeGreaterThan(enStart);
  });

  const esBlock = source.slice(esStart, enStart);
  const enBlock = source.slice(enStart, closeIndex);
  const esKeys = extractKeys(esBlock);
  const enKeys = extractKeys(enBlock);

  it("declares the same set of keys in es and en", () => {
    expect(esKeys.length).toBeGreaterThan(0);
    expect([...esKeys].sort()).toEqual([...enKeys].sort());
  });

  it("no key is declared more than once within a locale", () => {
    expect(new Set(esKeys).size).toBe(esKeys.length);
    expect(new Set(enKeys).size).toBe(enKeys.length);
  });

  it("no removed key (successStat1Value, tapReviewStatsBusinesses, etc.) remains in either locale", () => {
    const removedKeys = [
      "successStat1Value",
      "successTitle",
      "successSubtitle",
      "successDesc",
      "tapReviewStatsBusinesses",
      "tapReviewStatsReviews",
      "tapReviewStatsDaily",
      "tapReviewSocialTitle",
      "tapReviewSocialSubtitle",
      "tapReviewTestimonial1Quote",
      "tapReviewTestimonial2Business",
      "tapReviewTestimonial3Author",
      "tapReviewTrust30Days",
      "tapReviewTrust24h",
      "tapReviewTrustSupport",
    ];
    for (const key of removedKeys) {
      expect(esKeys).not.toContain(key);
      expect(enKeys).not.toContain(key);
    }
  });
});
