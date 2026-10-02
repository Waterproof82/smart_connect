import fs from "node:fs";
import path from "node:path";
import * as SeoSchema from "@shared/presentation/components/SeoSchema";

/**
 * Structured Data Policy guard (seo-trust-claims-cleanup, PR1).
 *
 * Google treats self-serving `Review`/`AggregateRating` markup as spam, and
 * `HowTo` rich results are retired. This guard asserts both schema builders
 * are gone from `SeoSchema.tsx` and that no `"@type":"Review"` /
 * `"@type":"HowTo*"` literal survives anywhere in `src/`.
 */

const ROOT = path.resolve(__dirname, "../../../");
const SRC_DIR = path.join(ROOT, "src");

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toRelative(filePath: string): string {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

const TYPE_LITERAL = /["']@type["']\s*:\s*["'](Review|HowTo\w*)["']/g;

describe("structured data policy", () => {
  it("SeoSchema module exports no ReviewSchema or HowToSchema", () => {
    expect((SeoSchema as Record<string, unknown>).ReviewSchema).toBeUndefined();
    expect((SeoSchema as Record<string, unknown>).HowToSchema).toBeUndefined();
  });

  it("has no Review or HowTo @type literal anywhere in src/", () => {
    const offenders: { file: string; line: number; text: string }[] = [];

    for (const file of walk(SRC_DIR)) {
      const relative = toRelative(file);
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((lineText, index) => {
        if (TYPE_LITERAL.test(lineText)) {
          offenders.push({ file: relative, line: index + 1, text: lineText.trim() });
        }
        TYPE_LITERAL.lastIndex = 0;
      });
    }

    expect(offenders).toEqual([]);
  });
});

/**
 * FAQ JSON-LD matches visible copy (seo-trust-claims-cleanup, PR2a).
 *
 * Deviation from design.md's literal testing-strategy wording: this
 * codebase has no `/en/*` prerendered routes — language is a client-side
 * `LanguageContext` toggle, every prerendered route is `lang="es"` (see
 * apply-progress.md, PR1 deviations). So "home FAQ JSON-LD answer text is
 * character-identical to the visible FAQ text, in es and en" is verified at
 * the source level: `App.tsx`'s `buildHomeSchema(SOLUTIONS, faqEntries)`
 * call and `HomeFaqSection`'s visible render both consume the exact same
 * `faqGroups` returned by `useHomeFaqGroups()` — there is only ever ONE
 * `t.homeFaqA2`/`t.homeFaqA3` string per locale, never a second copy that
 * could drift. That structural invariant is what's asserted below, plus the
 * corrected wording itself (no voseo, no "×6 en 90 días"/"6x in 90 days").
 */
describe("FAQ JSON-LD matches visible copy — home (PR2a)", () => {
  const APP_PATH = path.join(ROOT, "src/App.tsx");
  const HOME_FAQ_PATH = path.join(
    SRC_DIR,
    "features/landing/presentation/components/HomeFaqSection.tsx",
  );
  const LANGUAGE_CONTEXT_PATH = path.join(
    SRC_DIR,
    "shared/context/LanguageContext.tsx",
  );

  const appSource = () => fs.readFileSync(APP_PATH, "utf-8");
  const homeFaqSource = () => fs.readFileSync(HOME_FAQ_PATH, "utf-8");
  const languageContextSource = () =>
    fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");

  it("App.tsx derives buildHomeSchema's FAQ entries from the same faqGroups rendered by HomeFaqSection (no separate FAQ literal)", () => {
    const source = appSource();
    expect(source).toMatch(/const faqGroups = useHomeFaqGroups\(\);/);
    expect(source).toMatch(
      /const faqEntries = faqGroups\.flatMap\(/,
    );
    expect(source).toMatch(
      /question:\s*item\.q,\s*answer:\s*item\.a,?/,
    );
    expect(source).toMatch(/buildHomeSchema\(SOLUTIONS, faqEntries\)/);
  });

  it("useHomeFaqGroups() sources homeFaqA2/homeFaqA3 directly from the translation object (single source of truth, never duplicated)", () => {
    const fnMatch = homeFaqSource().match(
      /export function useHomeFaqGroups\(\)[\s\S]*?\n}\n/,
    );
    expect(fnMatch).not.toBeNull();
    expect(fnMatch![0]).toMatch(/a:\s*t\.homeFaqA2/);
    expect(fnMatch![0]).toMatch(/a:\s*t\.homeFaqA3/);
  });

  it("homeFaqA2 (es) reads 'Contacta', never the voseo 'Contactá'", () => {
    const match = languageContextSource().match(/homeFaqA2:\s*"([^"]*)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/Contacta\b/);
    expect(match![1]).not.toMatch(/Contactá/);
  });

  it("homeFaqA3 no longer claims '×6 en 90 días' / '6x in 90 days' in either locale", () => {
    const matches = [
      ...languageContextSource().matchAll(/homeFaqA3:\s*"([^"]*)"/g),
    ];
    expect(matches).toHaveLength(2);
    for (const match of matches) {
      expect(match[1]).not.toMatch(/×6 en 90 días/);
      expect(match[1]).not.toMatch(/6x in 90 days/);
    }
  });
});
