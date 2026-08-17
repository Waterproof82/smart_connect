import fs from "node:fs";
import path from "node:path";

/**
 * Regression guard for the "raw translation key rendered as text" bug class.
 *
 * LegalPage.tsx's `tr()` helper silently falls back to the raw key string
 * when a translation is missing:
 *   const tr = (key: string): string =>
 *     (t as unknown as Record<string, string>)[key] || key;
 * A missing key produces NO type error, NO lint warning, and NO test
 * failure anywhere else — real visitors on a legal page just see literal
 * strings like "legalCookiesSection1Title" instead of policy text.
 *
 * This test parses which title/content keys each legal page component
 * actually references, then asserts each one resolves to a real, non-empty
 * string in BOTH the `es` and `en` blocks of LanguageContext.tsx's
 * `translations` object — so this exact bug class can't silently regress
 * again.
 */

const SRC = path.resolve(__dirname, "../../../src");
const COOKIES_PAGE_PATH = path.join(
  SRC,
  "features/legal/presentation/CookiesPage.tsx",
);
const AVISO_PAGE_PATH = path.join(
  SRC,
  "features/legal/presentation/AvisoLegalPage.tsx",
);
const LANGUAGE_CONTEXT_PATH = path.join(
  SRC,
  "shared/context/LanguageContext.tsx",
);
const SEO_SCHEMA_PATH = path.join(
  SRC,
  "shared/presentation/components/SeoSchema.tsx",
);

const KEY_PROP_RE =
  /(?:titleKey|contentKey|descriptionKey|backLinkKey|updatedKey)(?:=|:)\s*"([^"]+)"/g;

function extractReferencedKeys(source: string): string[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  KEY_PROP_RE.lastIndex = 0;
  while ((match = KEY_PROP_RE.exec(source)) !== null) {
    keys.push(match[1]);
  }
  return [...new Set(keys)];
}

function extractLocaleBlock(
  languageContextSource: string,
  locale: "es" | "en",
): string {
  const blockPatterns: Record<"es" | "en", RegExp> = {
    es: /\n {2}es: \{([\s\S]*?)\n {2}en: \{/,
    en: /\n {2}en: \{([\s\S]*?)\n\};\n/,
  };
  const match = languageContextSource.match(blockPatterns[locale]);
  if (!match) {
    throw new Error(`Could not locate the "${locale}" translations block`);
  }
  return match[1];
}

function resolveKey(block: string, key: string): string | undefined {
  const match = block.match(new RegExp(`\\b${key}:\\s*"([^"]*)"`));
  return match ? match[1] : undefined;
}

/**
 * Canonical NAP (name/address/phone) from SeoSchema.tsx — the single source
 * of truth for the business's postal address. Mirrors the same helper added
 * on `feat/legal-privacidad-content` so both branches guard identity content
 * against the same live source instead of a hardcoded copy that can drift.
 */
function seoAddressParts(): string[] {
  const source = fs.readFileSync(SEO_SCHEMA_PATH, "utf-8");
  const streetMatch = source.match(/streetAddress:\s*"([^"]+)"/);
  const postalMatch = source.match(/postalCode:\s*"([^"]+)"/);
  const localityMatch = source.match(/addressLocality:\s*"([^"]+)"/);
  if (!streetMatch || !postalMatch || !localityMatch) {
    throw new Error("Could not locate PostalAddress fields in SeoSchema.tsx");
  }
  return [streetMatch[1], postalMatch[1], localityMatch[1]];
}

describe("Cookie policy translation keys (PR1 regression guard)", () => {
  const cookiesPageSource = fs.readFileSync(COOKIES_PAGE_PATH, "utf-8");
  const languageContextSource = fs.readFileSync(
    LANGUAGE_CONTEXT_PATH,
    "utf-8",
  );
  const referencedKeys = extractReferencedKeys(cookiesPageSource);
  const esBlock = extractLocaleBlock(languageContextSource, "es");
  const enBlock = extractLocaleBlock(languageContextSource, "en");

  it("CookiesPage.tsx references the 4 section title/content key pairs", () => {
    expect(referencedKeys).toEqual(
      expect.arrayContaining([
        "legalCookiesSection1Title",
        "legalCookiesSection1Content",
        "legalCookiesSection2Title",
        "legalCookiesSection2Content",
        "legalCookiesSection3Title",
        "legalCookiesSection3Content",
        "legalCookiesSection4Title",
        "legalCookiesSection4Content",
      ]),
    );
  });

  it.each(referencedKeys)(
    "%s resolves to a non-empty string in the es locale",
    (key) => {
      const value = resolveKey(esBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(referencedKeys)(
    "%s resolves to a non-empty string in the en locale",
    (key) => {
      const value = resolveKey(enBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it("resolveKey reports a missing key as undefined (proves the lookup can actually fail)", () => {
    const value = resolveKey(esBlock, "thisKeyDefinitelyDoesNotExistAnywhere");
    expect(value).toBeUndefined();
  });

  it("resolveKey reports an empty-string value as failing the non-empty check", () => {
    const syntheticBlock = '\n    fakeEmptyKey: "",\n';
    const value = resolveKey(syntheticBlock, "fakeEmptyKey");
    expect(value).toBe("");
    expect(value!.trim().length).toBe(0);
  });
});

describe("Aviso legal translation keys (PR-B regression guard)", () => {
  const avisoPageSource = fs.readFileSync(AVISO_PAGE_PATH, "utf-8");
  const languageContextSource = fs.readFileSync(
    LANGUAGE_CONTEXT_PATH,
    "utf-8",
  );
  const referencedKeys = extractReferencedKeys(avisoPageSource);
  const esBlock = extractLocaleBlock(languageContextSource, "es");
  const enBlock = extractLocaleBlock(languageContextSource, "en");

  const expectedKeys = [
    "legalAvisoTitle",
    "legalAvisoDescription",
    "legalAvisoBackLink",
    "legalAvisoSection1Title",
    "legalAvisoSection1Content",
    "legalAvisoSection2Title",
    "legalAvisoSection2Content",
    "legalAvisoSection3Title",
    "legalAvisoSection3Content",
    "legalAvisoSection4Title",
    "legalAvisoSection4Content",
    "legalAvisoSection5Title",
    "legalAvisoSection5Content",
    "legalAvisoSection6Title",
    "legalAvisoSection6Content",
  ];

  it("AvisoLegalPage.tsx references exactly the expected shell + 6 section title/content key pairs", () => {
    expect([...referencedKeys].sort()).toEqual([...expectedKeys].sort());
  });

  it.each(expectedKeys)(
    "%s resolves to a non-empty string in the es locale",
    (key) => {
      const value = resolveKey(esBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(expectedKeys)(
    "%s resolves to a non-empty string in the en locale",
    (key) => {
      const value = resolveKey(enBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(expectedKeys)("%s resolves to a value different from its own key name", (key) => {
    const esValue = resolveKey(esBlock, key);
    const enValue = resolveKey(enBlock, key);
    expect(esValue).not.toBe(key);
    expect(enValue).not.toBe(key);
  });

  const sectionContentKeys = expectedKeys.filter((key) =>
    key.endsWith("Content"),
  );

  it.each(sectionContentKeys)(
    "%s is a <p>...</p> HTML fragment in the es locale",
    (key) => {
      const value = resolveKey(esBlock, key)!;
      expect(value.trim().startsWith("<p>")).toBe(true);
      expect(value.trim().endsWith("</p>")).toBe(true);
    },
  );

  it.each(sectionContentKeys)(
    "%s is a <p>...</p> HTML fragment in the en locale",
    (key) => {
      const value = resolveKey(enBlock, key)!;
      expect(value.trim().startsWith("<p>")).toBe(true);
      expect(value.trim().endsWith("</p>")).toBe(true);
    },
  );

  it("legalAvisoSection1Content states the identity of the site owner consistently in both locales", () => {
    const esValue = resolveKey(esBlock, "legalAvisoSection1Content")!;
    const enValue = resolveKey(enBlock, "legalAvisoSection1Content")!;
    for (const fragment of ["Digitaliza Tenerife", "02670352Y", "info@digitalizatenerife.es"]) {
      expect(esValue).toContain(fragment);
      expect(enValue).toContain(fragment);
    }
  });

  it("legalAvisoSection1Content stays consistent with the canonical NAP in SeoSchema.tsx (both locales)", () => {
    const parts = seoAddressParts();
    const esValue = resolveKey(esBlock, "legalAvisoSection1Content")!;
    const enValue = resolveKey(enBlock, "legalAvisoSection1Content")!;
    for (const part of parts) {
      expect(esValue.includes(part)).toBe(true);
      expect(enValue.includes(part)).toBe(true);
    }
  });
});
