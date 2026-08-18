/**
 * ConsentContext structure test.
 *
 * `ConsentContext.tsx` is a React component/hook (`.tsx`) and Jest here is
 * `testEnvironment: "node"` with no `jest-environment-jsdom` installed, so
 * it cannot be rendered behaviorally. Per the codebase's established
 * convention (see `ThemeContext.tsx`'s SSR-safe pattern and other
 * `*.structure.test.ts` files), we assert on the source text instead:
 * the SSR-safe initial state, the post-hydration-only storage read, and
 * the throws-outside-provider guard.
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../src");
const CONTEXT_PATH = path.join(SRC, "shared/context/ConsentContext.tsx");

describe("ConsentContext (design.md: SSR-safe pattern mirroring ThemeContext)", () => {
  it("exists", () => {
    expect(fs.existsSync(CONTEXT_PATH)).toBe(true);
  });

  const readSource = () => fs.readFileSync(CONTEXT_PATH, "utf-8");

  it("exports ConsentProvider and useConsent", () => {
    const source = readSource();
    expect(source).toMatch(/export const ConsentProvider/);
    expect(source).toMatch(/export const useConsent/);
  });

  it("exports a ConsentStatus type with unknown | pending | decided", () => {
    const source = readSource();
    expect(source).toMatch(
      /type ConsentStatus\s*=\s*"unknown"\s*\|\s*"pending"\s*\|\s*"decided"/,
    );
  });

  it("initializes status to the literal \"unknown\" (identical on server + first client render)", () => {
    const source = readSource();
    expect(source).toMatch(/useState<ConsentStatus>\("unknown"\)/);
  });

  it("does NOT read storage synchronously during render (no top-level/render-time readConsent call before useEffect)", () => {
    const source = readSource();
    const providerBody = source.slice(source.indexOf("export const ConsentProvider"));
    const firstEffectIndex = providerBody.indexOf("useEffect(");
    const firstReadConsentIndex = providerBody.indexOf("readConsent(");

    expect(firstEffectIndex).toBeGreaterThan(-1);
    expect(firstReadConsentIndex).toBeGreaterThan(-1);
    // readConsent() must appear only after the first useEffect starts,
    // i.e. inside an effect body, never synchronously during render.
    expect(firstReadConsentIndex).toBeGreaterThan(firstEffectIndex);
  });

  it("reads consentStorage inside a useEffect with an empty dependency array (runs once, post-hydration)", () => {
    const source = readSource();
    expect(source).toMatch(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?readConsent\(\)[\s\S]*?\},\s*\[\]\s*\)/);
  });

  it("imports readConsent, buildConsent, writeConsent from the pure consentStorage module", () => {
    const source = readSource();
    expect(source).toMatch(
      /import\s*\{[^}]*readConsent[^}]*buildConsent[^}]*writeConsent[^}]*\}\s*from\s*["']\.\.\/utils\/consentStorage["']/,
    );
  });

  it("useConsent throws when called outside a ConsentProvider", () => {
    const source = readSource();
    const hookBody = source.slice(source.indexOf("export const useConsent"));
    expect(hookBody).toMatch(/if\s*\(!context\)\s*\{[\s\S]*?throw new Error/);
    expect(hookBody).toMatch(/useConsent must be used within a ConsentProvider/);
  });

  it("acceptAll sets analytics true and rejectAll sets analytics false", () => {
    const source = readSource();
    expect(source).toMatch(/acceptAll[\s\S]*?buildConsent\(true\)/);
    expect(source).toMatch(/rejectAll[\s\S]*?buildConsent\(false\)/);
  });

  it("exposes a reopen() action that re-opens the banner (status back to pending)", () => {
    const source = readSource();
    expect(source).toMatch(/reopen[\s\S]*?setStatus\("pending"\)/);
  });

  it("notifies window.gtag consent update on accept/reject (guarded by typeof check)", () => {
    const source = readSource();
    expect(source).toMatch(/window\.gtag/);
    expect(source).toMatch(/"consent"/);
    expect(source).toMatch(/"update"/);
    expect(source).toMatch(/analytics_storage/);
  });

  it("does not import anything from the not-yet-built banner/UI layer (PR2a scope: storage + context only)", () => {
    const source = readSource();
    const importLines = source
      .split("\n")
      .filter((line) => line.trim().startsWith("import"))
      .join("\n");
    expect(importLines).not.toMatch(/CookieBanner|CookieConsent/);
  });
});
