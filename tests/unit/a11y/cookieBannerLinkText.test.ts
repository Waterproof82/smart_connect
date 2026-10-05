import fs from "node:fs";
import path from "node:path";

// accessibility-baseline spec: "Descriptive Cookie Policy Link Text" — the
// cookieBannerPolicy link text (es/en) must describe its destination, not
// a generic "click here"/"más información" phrase with no context.
const LANGUAGE_CONTEXT_PATH = path.resolve(
  __dirname,
  "../../../src/shared/context/LanguageContext.tsx",
);
const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");

describe("cookieBannerPolicy link text is descriptive (design.md Interfaces/Contracts)", () => {
  it("es: references the cookie policy explicitly", () => {
    expect(source).toMatch(
      /cookieBannerPolicy:\s*"Lee la política de cookies"/,
    );
  });

  it("en: references the cookie policy explicitly", () => {
    expect(source).toMatch(
      /cookieBannerPolicy:\s*"Read the cookie policy"/,
    );
  });

  it("neither locale keeps the old generic phrase", () => {
    expect(source).not.toMatch(/cookieBannerPolicy:\s*"Más información"/);
    expect(source).not.toMatch(/cookieBannerPolicy:\s*"Learn more"/);
  });
});
