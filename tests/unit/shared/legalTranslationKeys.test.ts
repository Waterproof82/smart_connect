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
 * failure anywhere else — real visitors on any /legal/* page just see
 * literal strings like "legalCookiesSection1Title" instead of policy text.
 *
 * This test parses which title/content keys each legal page component
 * actually references, then asserts each one resolves to a real, non-empty
 * string in BOTH the `es` and `en` blocks of LanguageContext.tsx's
 * `translations` object — plus content-shape, sanitizer-allowlist and
 * NAP-consistency checks — so this bug class can't silently regress.
 */

const SRC = path.resolve(__dirname, "../../../src");
const LANGUAGE_CONTEXT_PATH = path.join(
  SRC,
  "shared/context/LanguageContext.tsx",
);
const SANITIZER_PATH = path.join(SRC, "shared/utils/sanitizer.ts");
const SEO_SCHEMA_PATH = path.join(
  SRC,
  "shared/presentation/components/SeoSchema.tsx",
);

interface LegalPageCase {
  name: string;
  file: string; // relative to SRC
  expectedKeys: string[]; // EXPLICIT — shell + section, no discovery
  /** Content keys that MUST contain the canonical NAP (address) substrings. */
  identityContentKeys?: string[];
}

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

/** Expands a prefix into the Section{n}Title/Content pairs a component declares. */
function sectionKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => [
    `${prefix}Section${i + 1}Title`,
    `${prefix}Section${i + 1}Content`,
  ]).flat();
}

/** Parses ALLOWED_TAGS out of sanitizer.ts so the guard tracks the real allowlist.
 *  sanitizeInput() also declares an (empty) ALLOWED_TAGS: [] — scope the search
 *  to sanitizeHTML() specifically so the real, non-empty allowlist is picked up. */
function allowedTags(): Set<string> {
  const source = fs.readFileSync(SANITIZER_PATH, "utf-8");
  const fnMatch = source.match(
    /export function sanitizeHTML[\s\S]*?ALLOWED_TAGS:\s*\[([\s\S]*?)\]/,
  );
  if (!fnMatch) {
    throw new Error(
      "Could not locate ALLOWED_TAGS inside sanitizeHTML() in sanitizer.ts",
    );
  }
  const tags = [...fnMatch[1].matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]);
  if (tags.length === 0) {
    throw new Error("Parsed an empty sanitizer allowlist — regex likely stale");
  }
  return new Set(tags);
}

/** Tags actually used inside a content value. */
function usedTags(html: string): string[] {
  return [...new Set([...html.matchAll(/<\s*([a-z0-9]+)[\s/>]/gi)].map((m) => m[1].toLowerCase()))];
}

/** Canonical NAP from SeoSchema.tsx — the single source of truth for the address. */
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

const LEGAL_PAGES: LegalPageCase[] = [
  {
    name: "CookiesPage",
    file: "features/legal/presentation/CookiesPage.tsx",
    expectedKeys: [
      "legalCookiesTitle",
      "legalCookiesDescription",
      "legalCookiesBackLink",
      "legalCookiesUpdated",
      ...sectionKeys("legalCookies", 5),
    ],
  },
  // ── PR-A appends ──────────────────────────────────────────────
  {
    name: "PrivacidadPage",
    file: "features/legal/presentation/PrivacidadPage.tsx",
    expectedKeys: [
      "legalPrivacidadTitle",
      "legalPrivacidadDescription",
      "legalPrivacidadBackLink",
      "legalPrivacidadUpdated",
      ...sectionKeys("legalPrivacidad", 6),
    ],
    identityContentKeys: ["legalPrivacidadSection1Content"],
  },
  // NOTE: AvisoLegalPage is intentionally NOT listed yet — its section keys
  // (legalAvisoSection1..6) do not exist in LanguageContext.tsx on this
  // branch. It is added by PR-B (legal-content-gaps), which either appends
  // an entry here (if this harness has already merged) or authors this same
  // harness shape with only its own entry present.
];

describe.each(LEGAL_PAGES)("$name legal translation keys", (page) => {
  const pageSource = fs.readFileSync(path.join(SRC, page.file), "utf-8");
  const languageContextSource = fs.readFileSync(
    LANGUAGE_CONTEXT_PATH,
    "utf-8",
  );
  const referencedKeys = extractReferencedKeys(pageSource);
  const esBlock = extractLocaleBlock(languageContextSource, "es");
  const enBlock = extractLocaleBlock(languageContextSource, "en");

  it(`${page.name}.tsx references exactly its expected key set`, () => {
    expect(referencedKeys.slice().sort()).toEqual(
      page.expectedKeys.slice().sort(),
    );
  });

  it.each(page.expectedKeys)(
    "%s resolves to a non-empty string in the es locale",
    (key) => {
      const value = resolveKey(esBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(page.expectedKeys)(
    "%s resolves to a non-empty string in the en locale",
    (key) => {
      const value = resolveKey(enBlock, key);
      expect(value).toBeDefined();
      expect(value!.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(page.expectedKeys)("%s value is not equal to its own key name", (key) => {
    const esValue = resolveKey(esBlock, key);
    const enValue = resolveKey(enBlock, key);
    expect(esValue).not.toBe(key);
    expect(enValue).not.toBe(key);
  });

  const contentKeys = page.expectedKeys.filter((key) => key.endsWith("Content"));

  it.each(contentKeys)(
    "%s is a well-formed <p>...</p> HTML fragment in both locales",
    (key) => {
      const esValue = resolveKey(esBlock, key)!;
      const enValue = resolveKey(enBlock, key)!;
      expect(esValue.startsWith("<p>")).toBe(true);
      expect(esValue.endsWith("</p>")).toBe(true);
      expect(enValue.startsWith("<p>")).toBe(true);
      expect(enValue.endsWith("</p>")).toBe(true);
    },
  );

  it.each(contentKeys)(
    "%s only uses tags within the sanitizer allowlist",
    (key) => {
      const allowed = allowedTags();
      const esValue = resolveKey(esBlock, key)!;
      const enValue = resolveKey(enBlock, key)!;
      for (const tag of usedTags(esValue)) {
        expect(allowed.has(tag)).toBe(true);
      }
      for (const tag of usedTags(enValue)) {
        expect(allowed.has(tag)).toBe(true);
      }
    },
  );

  if (page.identityContentKeys) {
    it.each(page.identityContentKeys)(
      "%s stays consistent with the canonical NAP in SeoSchema.tsx (both locales)",
      (key) => {
        const parts = seoAddressParts();
        const esValue = resolveKey(esBlock, key)!;
        const enValue = resolveKey(enBlock, key)!;
        for (const part of parts) {
          expect(esValue.includes(part)).toBe(true);
          expect(enValue.includes(part)).toBe(true);
        }
      },
    );
  }
});

describe("legal translation key harness self-tests", () => {
  const languageContextSource = fs.readFileSync(
    LANGUAGE_CONTEXT_PATH,
    "utf-8",
  );
  const esBlock = extractLocaleBlock(languageContextSource, "es");

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
