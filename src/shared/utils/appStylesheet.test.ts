/**
 * appStylesheet Utility Tests
 *
 * This repo's Jest config runs with `testEnvironment: "node"` (no
 * `jest-environment-jsdom`, see `useIdleOrInteraction.test.tsx`'s header
 * comment) — so these tests never touch a real `document`. Instead they
 * exercise `onAppStylesheetApplied`'s injectable `doc` parameter with a
 * minimal hand-written fake (a `querySelector` returning a fake
 * `<link>`-like object with `addEventListener`/`removeEventListener`
 * recorded in a plain map), which is exactly what that parameter exists
 * for (design.md "Data Flow (PR3)").
 */
import {
  APP_STYLESHEET_DEFERRED_SELECTOR,
  onAppStylesheetApplied,
  type AppStylesheetDocumentLike,
  type AppStylesheetLinkLike,
} from "./appStylesheet";

function createFakeLink(
  overrides: Partial<Pick<AppStylesheetLinkLike, "media" | "sheet">> = {},
): AppStylesheetLinkLike & {
  dispatch: (type: "load" | "error") => void;
  listenerCount: (type: "load" | "error") => number;
} {
  const listeners: Record<"load" | "error", Array<() => void>> = {
    load: [],
    error: [],
  };

  return {
    media: overrides.media ?? "print",
    sheet: overrides.sheet ?? null,
    addEventListener(type, listener) {
      listeners[type].push(listener);
    },
    removeEventListener(type, listener) {
      listeners[type] = listeners[type].filter((l) => l !== listener);
    },
    dispatch(type) {
      listeners[type].forEach((listener) => listener());
    },
    listenerCount(type) {
      return listeners[type].length;
    },
  };
}

function createFakeDoc(
  link: AppStylesheetLinkLike | null,
): AppStylesheetDocumentLike {
  return {
    querySelector: () => link,
  };
}

describe("APP_STYLESHEET_DEFERRED_SELECTOR", () => {
  it("matches a print-media, same-origin /assets/ stylesheet link", () => {
    expect(APP_STYLESHEET_DEFERRED_SELECTOR).toBe(
      'link[rel="stylesheet"][href^="/assets/"][media="print"]',
    );
  });
});

describe("onAppStylesheetApplied", () => {
  it("calls the callback immediately when no deferred link exists (e.g. dist/_spa.html's plain blocking link)", () => {
    const callback = jest.fn();
    const cleanup = onAppStylesheetApplied(callback, createFakeDoc(null));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("calls the callback immediately when the link's stylesheet is already loaded (link.sheet present)", () => {
    const link = createFakeLink({ sheet: {} });
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(link.listenerCount("load")).toBe(0);
  });

  it("calls the callback immediately when the link's media already swapped to 'all'", () => {
    const link = createFakeLink({ media: "all" });
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(link.listenerCount("load")).toBe(0);
  });

  it("does NOT call the callback synchronously while the link is still media=print and unloaded", () => {
    const link = createFakeLink();
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback once the link fires 'load'", () => {
    const link = createFakeLink();
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    link.dispatch("load");

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback once the link fires 'error'", () => {
    const link = createFakeLink();
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    link.dispatch("error");

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("only calls the callback once even if both 'load' and 'error' fire", () => {
    const link = createFakeLink();
    const callback = jest.fn();
    onAppStylesheetApplied(callback, createFakeDoc(link));

    link.dispatch("load");
    link.dispatch("error");

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("removes both listeners when the returned cleanup runs", () => {
    const link = createFakeLink();
    const cleanup = onAppStylesheetApplied(jest.fn(), createFakeDoc(link));

    cleanup();

    expect(link.listenerCount("load")).toBe(0);
    expect(link.listenerCount("error")).toBe(0);
  });

  it("cleanup after the link already fired is a safe no-op", () => {
    const link = createFakeLink();
    const callback = jest.fn();
    const cleanup = onAppStylesheetApplied(callback, createFakeDoc(link));

    link.dispatch("load");
    expect(() => cleanup()).not.toThrow();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
