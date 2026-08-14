/**
 * Entry-file wiring structure test.
 *
 * `entry-client.tsx`/`entry-server.tsx` are `.tsx` — untestable
 * behaviorally under this repo's Jest config (see
 * `ConsentContext.structure.test.ts` for the same rationale). Asserts
 * design.md's provider nesting order: `ConsentProvider` inside
 * `LanguageProvider`, in BOTH entry files, and that `<CookieConsent/>` is
 * mounted alongside `<ScrollToTop/>` in both.
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../src");
const CLIENT_PATH = path.join(SRC, "entry-client.tsx");
const SERVER_PATH = path.join(SRC, "entry-server.tsx");

describe.each([
  ["entry-client.tsx", CLIENT_PATH],
  ["entry-server.tsx", SERVER_PATH],
])("%s — ConsentProvider wiring (design.md provider nesting)", (_name, filePath) => {
  const readSource = () => fs.readFileSync(filePath, "utf-8");

  it("imports ConsentProvider from ConsentContext", () => {
    const source = readSource();
    expect(source).toMatch(
      /import\s*\{\s*ConsentProvider\s*\}\s*from\s*["']@shared\/context\/ConsentContext["']/,
    );
  });

  it("imports CookieConsent from shared/components", () => {
    const source = readSource();
    expect(source).toMatch(
      /import\s*\{\s*CookieConsent\s*\}\s*from\s*["']@shared\/components\/CookieConsent["']/,
    );
  });

  it("nests ConsentProvider inside LanguageProvider (opens after, closes before)", () => {
    const source = readSource();
    const languageOpenIndex = source.indexOf("<LanguageProvider>");
    const consentOpenIndex = source.indexOf("<ConsentProvider>");
    const consentCloseIndex = source.indexOf("</ConsentProvider>");
    const languageCloseIndex = source.indexOf("</LanguageProvider>");

    expect(languageOpenIndex).toBeGreaterThan(-1);
    expect(consentOpenIndex).toBeGreaterThan(-1);
    expect(consentCloseIndex).toBeGreaterThan(-1);
    expect(languageCloseIndex).toBeGreaterThan(-1);

    expect(consentOpenIndex).toBeGreaterThan(languageOpenIndex);
    expect(consentCloseIndex).toBeLessThan(languageCloseIndex);
  });

  it("renders <CookieConsent /> inside the ConsentProvider block", () => {
    const source = readSource();
    const consentOpenIndex = source.indexOf("<ConsentProvider>");
    const consentCloseIndex = source.indexOf("</ConsentProvider>");
    const block = source.slice(consentOpenIndex, consentCloseIndex);
    expect(block).toMatch(/<CookieConsent\s*\/>/);
  });
});

describe("entry-client.tsx — <CookieConsent /> mounted beside <ScrollToTop />", () => {
  it("both render inside the same ConsentProvider block", () => {
    const source = fs.readFileSync(CLIENT_PATH, "utf-8");
    const consentOpenIndex = source.indexOf("<ConsentProvider>");
    const consentCloseIndex = source.indexOf("</ConsentProvider>");
    const block = source.slice(consentOpenIndex, consentCloseIndex);
    expect(block).toMatch(/<ScrollToTop\s*\/>/);
    expect(block).toMatch(/<CookieConsent\s*\/>/);
  });
});

describe("entry-server.tsx — <CookieConsent /> renders null server-side (no DOM/window access at module scope)", () => {
  it("still mounts <CookieConsent /> for SSR (relies on status===unknown → null, no separate server guard needed)", () => {
    const source = fs.readFileSync(SERVER_PATH, "utf-8");
    expect(source).toMatch(/<CookieConsent\s*\/>/);
  });
});
