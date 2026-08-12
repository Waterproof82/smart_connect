import fs from "node:fs";
import path from "node:path";

/**
 * Regression guard for a pre-existing SSR-crashing bug discovered while
 * verifying PR3's acceptance criteria (full `npm run build` + prerender of
 * /tarjetas-nfc). `DOMPurify.sanitize(...)` called directly (without a
 * `window`) throws "DOMPurify.sanitize is not a function" in Node SSR —
 * this silently aborted the entire TapReviewSection subtree during
 * `renderToString`, falling back to client-only hydration for that content
 * (title/meta from Helmet still rendered, but the visible page body did
 * not). Confirmed via `git show c76c8eb:...` that this predates PR3 — it
 * already existed when TapReviewSection was mounted on home's `/` route.
 * Fixed by reusing this repo's existing SSR-safe `sanitizeInput()` utility
 * (`shared/utils/sanitizer.ts`), which guards on `typeof window`.
 */
const FILE_PATH = path.resolve(
  __dirname,
  "../../../../src/features/tap-review/presentation/components/HowItWorks.tsx",
);

describe("HowItWorks — SSR-safe sanitization (pre-existing bug fixed in PR3)", () => {
  const source = fs.readFileSync(FILE_PATH, "utf-8");

  it("does not import the raw dompurify package directly", () => {
    expect(source).not.toMatch(/from ["']dompurify["']/);
  });

  it("uses the SSR-safe sanitizeInput() utility instead", () => {
    expect(source).toMatch(
      /from ["']@shared\/utils\/sanitizer["']/,
    );
    expect(source).toMatch(/sanitizeInput\(/);
  });
});
