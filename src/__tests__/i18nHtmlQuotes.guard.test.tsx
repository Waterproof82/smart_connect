import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * HTML inside i18n strings is rendered through sanitizeHTML +
 * dangerouslySetInnerHTML. On the server sanitizeHTML returns the string
 * as-is (no window for DOMPurify); on the client DOMPurify re-serializes it
 * with double quotes. Single-quoted attributes therefore make SSR and
 * client markup differ (caught for ES by ssrHydrationParity.test.tsx; this
 * also covers EN, which the prerender never renders).
 */
describe("i18n HTML strings use double-quoted attributes", () => {
  it("LanguageContext has no single-quoted attribute inside an HTML tag", () => {
    const source = readFileSync(
      join(process.cwd(), "src/shared/context/LanguageContext.tsx"),
      "utf-8",
    );
    const offenders = source.match(/<[a-z][^<>]*\s[\w-]+='[^']*'[^<>]*>/g) ?? [];
    expect(offenders).toEqual([]);
  });
});
