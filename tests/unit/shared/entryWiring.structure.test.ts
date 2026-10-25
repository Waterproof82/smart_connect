/**
 * Entry-file wiring structure test.
 *
 * Provider nesting (Helmet > Theme > Language > Consent > ScrollToTop +
 * CookieConsent + Suspense) lives in one place since shared-app-shell PR2:
 * `src/shared/presentation/AppShell.tsx`. Its order is asserted by
 * `src/__tests__/AppShell.test.tsx` (Vitest, element-tree walk), and
 * `src/__tests__/ssrHydrationParity.test.tsx` renders both entries and
 * compares their markup per path. This file only guards that neither entry
 * re-grows its own provider tree, plus the WebMCP boot order in
 * `entry-client.tsx`, which no render can observe.
 */

import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../../src");
const CLIENT_PATH = path.join(SRC, "entry-client.tsx");
const CLIENT_APP_PATH = path.join(SRC, "ClientApp.tsx");
const SERVER_PATH = path.join(SRC, "entry-server.tsx");

const PROVIDERS = [
  "HelmetProvider",
  "ThemeProvider",
  "LanguageProvider",
  "ConsentProvider",
  "CookieConsent",
  "ScrollToTop",
];

describe.each([
  ["ClientApp.tsx", CLIENT_APP_PATH],
  ["entry-server.tsx", SERVER_PATH],
])("%s — renders the shared AppShell", (_name, filePath) => {
  const readSource = () => fs.readFileSync(filePath, "utf-8");

  it("imports AppShell from @shared/presentation/AppShell", () => {
    expect(readSource()).toMatch(
      /import\s*\{\s*AppShell\s*\}\s*from\s*["']@shared\/presentation\/AppShell["']/,
    );
  });

  it.each(PROVIDERS)("does not mount <%s> itself", (provider) => {
    expect(readSource()).not.toMatch(new RegExp(String.raw`<${provider}[\s>/]`));
  });
});

describe("entry-client.tsx — mounts <ClientApp /> only", () => {
  it("builds no provider tree of its own", () => {
    const source = fs.readFileSync(CLIENT_PATH, "utf-8");
    expect(source).toMatch(/const app = <ClientApp \/>;/);
    for (const provider of PROVIDERS) {
      expect(source).not.toMatch(new RegExp(String.raw`<${provider}[\s>/]`));
    }
  });
});

describe("entry-client.tsx — WebMCP registration is deferred past hydration (design.md D8, SDD core-web-vitals-perf PR3)", () => {
  const readSource = () => fs.readFileSync(CLIENT_PATH, "utf-8");

  it("does not statically import registerWebMCPTools from ./WebMCP", () => {
    const source = readSource();
    expect(source).not.toMatch(
      /import\s*\{\s*registerWebMCPTools\s*\}\s*from\s*["']\.\/WebMCP["']/,
    );
  });

  it("does not call registerWebMCPTools() at module scope", () => {
    const source = readSource();
    expect(source).not.toMatch(/^\s*registerWebMCPTools\(\)/m);
  });

  it("calls scheduleWebMCPRegistration(), imported from ./webmcpBoot", () => {
    const source = readSource();
    expect(source).toMatch(
      /import\s*\{\s*scheduleWebMCPRegistration\s*\}\s*from\s*["']\.\/webmcpBoot["']/,
    );
    expect(source).toMatch(/scheduleWebMCPRegistration\(\)/);
  });

  it("boots with top-level await instead of an async boot() wrapper", () => {
    const source = readSource();

    expect(source).not.toMatch(/async function boot\(/);
    expect(source).toMatch(/^\s*await route\.preload\(\);/m);
  });

  it("locates the scheduleWebMCPRegistration() call after both the hydrateRoot and createRoot branches", () => {
    const source = readSource();
    const hydrateIndex = source.indexOf("hydrateRoot(root, app)");
    const createRootIndex = source.indexOf("createRoot(root).render(app)");
    const scheduleCallIndex = source.indexOf("scheduleWebMCPRegistration()");

    expect(hydrateIndex).toBeGreaterThan(-1);
    expect(createRootIndex).toBeGreaterThan(-1);
    expect(scheduleCallIndex).toBeGreaterThan(hydrateIndex);
    expect(scheduleCallIndex).toBeGreaterThan(createRootIndex);
  });
});
