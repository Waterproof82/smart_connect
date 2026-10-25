import { describe, expect, it } from "vitest";
import { PRERENDERED_PATHS } from "@shared/routing/prerenderedRoutes";
import { SERVER_PAGES } from "../serverPages";
import { CLIENT_PAGES } from "../clientPages";
import { PRERENDERED_ROUTES } from "../clientRoutes";
import TapReviewPage from "@features/tap-review/presentation/TapReviewPage";
import App from "../App";

const REACT_LAZY = Symbol.for("react.lazy");

function isReactLazy(Component: unknown): boolean {
  return (
    typeof Component === "object" &&
    Component !== null &&
    (Component as { $$typeof?: symbol }).$$typeof === REACT_LAZY
  );
}

describe("serverPages.ts / clientPages.ts (design.md shared-app-shell, Per-Entry Exhaustive Page Maps)", () => {
  it("SERVER_PAGES has exactly one entry per prerendered path", () => {
    const keys = Object.keys(SERVER_PAGES);
    expect(keys).toHaveLength(PRERENDERED_PATHS.length);
    for (const path of PRERENDERED_PATHS) {
      expect(SERVER_PAGES).toHaveProperty(path);
    }
  });

  it("no SERVER_PAGES entry is a React.lazy component (Server Pages Never Lazy)", () => {
    for (const Component of Object.values(SERVER_PAGES)) {
      expect(isReactLazy(Component)).toBe(false);
    }
  });

  it("CLIENT_PAGES has exactly one entry per prerendered path, none lazy", () => {
    const keys = Object.keys(CLIENT_PAGES);
    expect(keys).toHaveLength(PRERENDERED_PATHS.length);
    for (const path of PRERENDERED_PATHS) {
      expect(CLIENT_PAGES).toHaveProperty(path);
    }
    for (const Component of Object.values(CLIENT_PAGES)) {
      expect(isReactLazy(Component)).toBe(false);
    }
  });

  it("CLIENT_PAGES matches the preloadable route loader for every non-'/' path", () => {
    for (const path of PRERENDERED_PATHS) {
      if (path === "/") continue;
      expect(CLIENT_PAGES[path]).toBe(PRERENDERED_ROUTES[path].Component);
    }
  });

  it("all 4 blog paths resolve to the same client Component (one shared preloadable)", () => {
    const blogPaths = PRERENDERED_PATHS.filter((p) => p.startsWith("/blog/"));
    expect(blogPaths).toHaveLength(4);
    const [first, ...rest] = blogPaths;
    for (const path of rest) {
      expect(CLIENT_PAGES[path]).toBe(CLIENT_PAGES[first]);
    }
  });

  it("SERVER_PAGES['/tarjetas-nfc'] is TapReviewPage (route-registration D5 point 2)", () => {
    expect(SERVER_PAGES["/tarjetas-nfc"]).toBe(TapReviewPage);
  });

  it("'/' resolves to App in both page maps (App.routing.structure, import-based)", () => {
    expect(CLIENT_PAGES["/"]).toBe(App);
    expect(SERVER_PAGES["/"]).toBe(App);
  });
});
