/**
 * index.html Consent Mode v2 structure test.
 *
 * `index.html` is copied verbatim into every SSG page and `_spa.html` by
 * `scripts/prerender.mjs` (design.md), so one edit here covers every
 * served HTML file. Source-text assertions (not a DOM parse) mirror the
 * repo's `.structure.test.ts` convention — this is the pre-hydration
 * inline script gate that determines whether GA4 fires at all.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(__dirname, "../../");
const INDEX_HTML_PATH = path.join(ROOT, "index.html");
const VERCEL_JSON_PATH = path.join(ROOT, "vercel.json");
const ANALYTICS_SCOPE_PATH = path.join(
  ROOT,
  "src/shared/utils/analyticsScope.ts",
);

describe("index.html — Consent Mode v2 (RGPD art.6 / LSSI-CE art.22.2)", () => {
  const readSource = () => fs.readFileSync(INDEX_HTML_PATH, "utf-8");

  it("calls gtag('consent','default',...) BEFORE gtag('config',...)", () => {
    const source = readSource();
    const defaultIndex = source.indexOf('"consent", "default"');
    const configIndex = source.indexOf('gtag("config"');
    expect(defaultIndex).toBeGreaterThan(-1);
    expect(configIndex).toBeGreaterThan(-1);
    expect(defaultIndex).toBeLessThan(configIndex);
  });

  it("denies all 4 ad/analytics signals by default", () => {
    const source = readSource();
    const defaultBlock = source.slice(
      source.indexOf('"consent", "default"'),
      source.indexOf('"consent", "default"') + 400,
    );
    expect(defaultBlock).toMatch(/ad_storage:\s*"denied"/);
    expect(defaultBlock).toMatch(/ad_user_data:\s*"denied"/);
    expect(defaultBlock).toMatch(/ad_personalization:\s*"denied"/);
    expect(defaultBlock).toMatch(/analytics_storage:\s*"denied"/);
  });

  it("grants functionality_storage and security_storage by default (non-consent-gated categories)", () => {
    const source = readSource();
    const defaultBlock = source.slice(
      source.indexOf('"consent", "default"'),
      source.indexOf('"consent", "default"') + 400,
    );
    expect(defaultBlock).toMatch(/functionality_storage:\s*"granted"/);
    expect(defaultBlock).toMatch(/security_storage:\s*"granted"/);
  });

  it("does NOT use wait_for_update (design.md A3 — sync restore instead)", () => {
    const source = readSource();
    expect(source).not.toMatch(/wait_for_update/);
  });

  it("restores a prior grant from localStorage sc_consent_v1 before gtag config, guarded by try/catch", () => {
    const source = readSource();
    expect(source).toMatch(/sc_consent_v1/);
    expect(source).toMatch(/try\s*\{[\s\S]*?sc_consent_v1[\s\S]*?\}\s*catch/);
  });

  it("sets window.__scAnalyticsScope from a path-guard regex excluding /admin, /panel, /login", () => {
    const source = readSource();
    expect(source).toMatch(/window\.__scAnalyticsScope/);
    expect(source).toMatch(/admin\|panel\|login/);
  });

  it("only calls gtag('config',...) when __scAnalyticsScope is true", () => {
    const source = readSource();
    expect(source).toMatch(
      /if\s*\(\s*window\.__scAnalyticsScope\s*\)\s*gtag\("config"/,
    );
  });

  it("disables Ads signals at source in the gtag('config',...) call (F-01)", () => {
    const source = readSource();
    const configIndex = source.indexOf('gtag("config"');
    expect(configIndex).toBeGreaterThan(-1);
    const configBlock = source.slice(configIndex, configIndex + 400);
    expect(configBlock).toMatch(/allow_google_signals:\s*false/);
    expect(configBlock).toMatch(/allow_ad_personalization_signals:\s*false/);
  });

  it("the path-guard regex matches every /admin, /panel, /login rewrite prefix declared in vercel.json", () => {
    const source = readSource();
    const vercelSource = fs.readFileSync(VERCEL_JSON_PATH, "utf-8");
    const regexMatch = source.match(
      /\/\^\\\/\(([a-z|]+)\)\(\\\/\|\$\)\//,
    );
    expect(regexMatch).not.toBeNull();
    const guardedPrefixes = regexMatch![1].split("|");

    const vercelRewrites = JSON.parse(vercelSource).rewrites as {
      source: string;
    }[];
    const gatedRewritePrefixes = vercelRewrites
      .map((r) => r.source)
      .filter((s) => /^\/(admin|panel|login)\//.test(s))
      .map((s) => s.replace(/^\//, "").split("/")[0]);

    for (const prefix of gatedRewritePrefixes) {
      expect(guardedPrefixes).toContain(prefix);
    }
  });

  it("mirrors the exact regex from the pure, independently-testable isPublicAnalyticsPath() guard", () => {
    // index.html can't import a TS module (it's plain HTML evaluated before
    // React/Vite touch anything), so the path-guard regex is necessarily
    // duplicated here. This test is what makes that duplication safe: if
    // either copy drifts from the other, it fails loudly instead of silently
    // reintroducing the un-anchored-prefix bug analyticsScope.test.ts guards
    // against (see src/shared/utils/analyticsScope.ts for the real logic and
    // its behavioral tests).
    const htmlSource = readSource();
    const htmlRegexMatch = htmlSource.match(
      /window\.__scAnalyticsScope = !(\/\^\\\/\([a-z|]+\)\(\\\/\|\$\)\/)\.test/,
    );
    expect(htmlRegexMatch).not.toBeNull();

    const utilSource = fs.readFileSync(ANALYTICS_SCOPE_PATH, "utf-8");
    const utilRegexMatch = utilSource.match(
      /EXCLUDED_PATH_PREFIXES = (\/\^\\\/\([a-z|]+\)\(\\\/\|\$\)\/);/,
    );
    expect(utilRegexMatch).not.toBeNull();

    expect(htmlRegexMatch![1]).toBe(utilRegexMatch![1]);
  });
});

describe("index.html — deferred gtag.js loader (design.md D2/D3, SDD landing-main-thread-tbt S2a)", () => {
  const readSource = () => fs.readFileSync(INDEX_HTML_PATH, "utf-8");

  /**
   * `index.html` can't import a TS module — it's plain HTML evaluated
   * before React/Vite touch anything (same constraint noted above for
   * the path-guard regex) — so the deferred-load logic is necessarily
   * inline vanilla JS, independent from `scheduleIdle`/
   * `useIdleOrInteraction`. These tests extract that inline script and
   * run it in a minimal `node:vm` sandbox implementing just the
   * handful of DOM/BOM primitives the script touches (`document`,
   * `window.addEventListener`, `location.pathname`, `localStorage`,
   * timers). A real DOM (the `jsdom` npm package) was tried first, but
   * Jest's `transformIgnorePatterns` (by design, only `@exodus/bytes`
   * is transformed — everything else under `node_modules` is not) cannot
   * parse `jsdom`'s own ESM dependency (`parse5`), so `require("jsdom")`
   * crashes under this repo's Jest/ts-jest config with "Cannot use
   * import statement outside a module" — a pre-existing constraint
   * (see `useWhatsappPhone.test.ts`'s "no jsdom in this repo" note),
   * not something this slice's scope should fix by widening
   * `transformIgnorePatterns` repo-wide. The sandbox gives equivalent
   * behavioral coverage without that dependency.
   */
  function extractInlineAnalyticsScript(source: string): string {
    const start = source.indexOf("window.dataLayer = window.dataLayer");
    const end = source.indexOf("</script>", start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    return source.slice(start, end);
  }

  interface FakeElement {
    tagName: string;
    async: boolean;
    src: string;
    hasAttribute: (name: "src" | "async") => boolean;
    getAttribute: (name: "src") => string | null;
  }

  function createFakeElement(): FakeElement {
    return {
      tagName: "SCRIPT",
      async: false,
      src: "",
      hasAttribute(name) {
        return name === "async" ? this.async : this.src !== "";
      },
      getAttribute(name) {
        return name === "src" ? this.src || null : null;
      },
    };
  }

  function buildSandbox(pathname: string, withRequestIdleCallback = true) {
    const listeners: Record<string, Array<() => void>> = {};
    const appended: FakeElement[] = [];
    const idleCalls: Array<{ timeout?: number } | undefined> = [];
    const setTimeoutCalls: Array<[() => void, number]> = [];
    let idleCb: (() => void) | undefined;

    const sandbox: Record<string, unknown> = {
      location: { pathname },
      localStorage: { getItem: () => null },
      document: {
        createElement: () => createFakeElement(),
        head: {
          appendChild: (el: FakeElement) => {
            appended.push(el);
          },
        },
      },
      addEventListener: (type: string, cb: () => void) => {
        (listeners[type] ??= []).push(cb);
      },
      removeEventListener: (type: string, cb: () => void) => {
        listeners[type] = (listeners[type] ?? []).filter((fn) => fn !== cb);
      },
      setTimeout: (cb: () => void, timeout: number) => {
        setTimeoutCalls.push([cb, timeout]);
        return setTimeout(cb, timeout);
      },
      clearTimeout,
      Date,
      console,
    };

    if (withRequestIdleCallback) {
      sandbox.requestIdleCallback = (
        cb: () => void,
        opts?: { timeout?: number },
      ) => {
        idleCb = cb;
        idleCalls.push(opts);
        return 1;
      };
      sandbox.cancelIdleCallback = () => {};
    }

    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;

    const context = vm.createContext(sandbox);
    vm.runInContext(extractInlineAnalyticsScript(readSource()), context);

    return {
      sandbox,
      appended,
      idleCalls,
      setTimeoutCalls,
      fireIdle: () => idleCb?.(),
      fireLoad: () => (listeners.load ?? []).forEach((cb) => cb()),
      fireEvent: (type: string) =>
        (listeners[type] ?? []).forEach((cb) => cb()),
    };
  }

  it("does not contain a static <script src=.../gtag/js> tag in the raw source", () => {
    const source = readSource();
    expect(source).not.toMatch(
      /<script[^>]*\ssrc=["']https:\/\/www\.googletagmanager\.com\/gtag\/js/,
    );
  });

  it("changes the googletagmanager preconnect to dns-prefetch (D3)", () => {
    const source = readSource();
    expect(source).not.toMatch(
      /rel="preconnect"\s+href="https:\/\/www\.googletagmanager\.com"/,
    );
    expect(source).toMatch(
      /rel="dns-prefetch"\s+href="https:\/\/www\.googletagmanager\.com"/,
    );
  });

  it("keeps <meta charset> as the first element child of <head>", () => {
    const source = readSource();
    const headMatch = source.match(/<head>\s*<([a-z]+)[^>]*>/);
    expect(headMatch).not.toBeNull();
    expect(headMatch![1]).toBe("meta");
    expect(source.slice(source.indexOf("<head>"), source.indexOf("<head>") + 80)).toMatch(
      /<meta charset="UTF-8"/,
    );
  });

  it("the Consent Mode comment accurately describes the deferred gtag.js load (http-surface-hardening, MODIFIED)", () => {
    const source = readSource();
    const commentBlock = source.slice(
      source.indexOf("Consent Mode v2 defaults"),
      source.indexOf('gtag("consent", "default"'),
    );
    expect(commentBlock).toMatch(/sync|synchronous/i);
    expect(commentBlock).toMatch(/load/i);
    expect(commentBlock).toMatch(/idle|interaction/i);
  });

  it("keeps dataLayer stub → consent default → stored-grant restore → config{flags} queued, in order, before gtag.js ever loads", () => {
    const { sandbox } = buildSandbox("/");
    const dataLayer = sandbox.dataLayer as unknown[][];
    expect(dataLayer[0][0]).toBe("consent");
    expect(dataLayer[0][1]).toBe("default");
    expect(dataLayer[1][0]).toBe("js");
    expect(dataLayer[2][0]).toBe("config");
    expect(dataLayer[2][2]).toMatchObject({
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  });

  it("does not inject the gtag.js <script> before `load` fires", () => {
    const { appended, fireLoad } = buildSandbox("/");
    expect(appended).toHaveLength(0);
    fireLoad();
    // idle hasn't fired yet either — load alone is not enough.
    expect(appended).toHaveLength(0);
  });

  it("schedules requestIdleCallback with a 3000ms timeout only after `load`", () => {
    const { idleCalls, fireLoad } = buildSandbox("/");
    expect(idleCalls).toHaveLength(0);
    fireLoad();
    expect(idleCalls).toEqual([{ timeout: 3000 }]);
  });

  it("injects gtag.js (async, correct src) once idle fires after load", () => {
    const { appended, fireLoad, fireIdle } = buildSandbox("/");
    fireLoad();
    fireIdle();
    expect(appended).toHaveLength(1);
    expect(appended[0].getAttribute("src")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-F9KQ7X8TSQ",
    );
    expect(appended[0].hasAttribute("async")).toBe(true);
  });

  it.each(["pointerdown", "keydown", "touchstart", "scroll"])(
    "injects gtag.js on a first %s interaction even if idle has not fired yet",
    (eventName) => {
      const { appended, fireLoad, fireEvent } = buildSandbox("/");
      fireLoad();
      fireEvent(eventName);
      expect(appended).toHaveLength(1);
    },
  );

  it("injects gtag.js only once even when both idle and an interaction fire", () => {
    const { appended, fireLoad, fireIdle, fireEvent } = buildSandbox("/");
    fireLoad();
    fireIdle();
    fireEvent("scroll");
    expect(appended).toHaveLength(1);
  });

  it("falls back to setTimeout(…, 3000) when requestIdleCallback is unavailable", () => {
    jest.useFakeTimers();
    const { appended, fireLoad, setTimeoutCalls } = buildSandbox("/", false);

    fireLoad();

    expect(setTimeoutCalls).toEqual([[expect.any(Function), 3000]]);
    jest.advanceTimersByTime(3000);

    expect(appended).toHaveLength(1);
    jest.useRealTimers();
  });

  it("never schedules idle or injects gtag.js outside __scAnalyticsScope (e.g. /admin)", () => {
    const { idleCalls, appended, fireLoad } = buildSandbox("/admin");
    fireLoad();
    expect(idleCalls).toHaveLength(0);
    expect(appended).toHaveLength(0);
  });
});
