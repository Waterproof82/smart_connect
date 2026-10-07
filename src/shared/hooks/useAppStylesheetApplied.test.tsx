/**
 * useAppStylesheetApplied Tests (design.md "Data Flow (PR3)").
 *
 * Behavioral hook test — needs a real DOM to create/dispatch events on a
 * `<link>` element, so it runs under Vitest (`vite.config.ts`'s
 * `environment: "jsdom"`), same rationale as `useIdleOrInteraction.test.tsx`.
 * The `renderToString` case proves the hook is false during SSR with zero
 * DOM access (#421-safety), matching `DeferredExpertAssistant.test.tsx`'s
 * own SSR check.
 */
import { renderToString } from "react-dom/server";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useAppStylesheetApplied } from "@shared/hooks/useAppStylesheetApplied";
import { APP_STYLESHEET_DEFERRED_SELECTOR } from "@shared/utils/appStylesheet";

function appendDeferredLink(media = "print"): HTMLLinkElement {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/app-abc123.css";
  link.media = media;
  document.head.appendChild(link);
  return link;
}

function Probe() {
  const applied = useAppStylesheetApplied();
  return <>{String(applied)}</>;
}

describe("useAppStylesheetApplied", () => {
  afterEach(() => {
    document
      .querySelectorAll(APP_STYLESHEET_DEFERRED_SELECTOR)
      .forEach((el) => el.remove());
  });

  it("returns false on first render while a deferred print link is still pending (hydration-safe)", () => {
    appendDeferredLink();
    const { result } = renderHook(() => useAppStylesheetApplied());
    expect(result.current).toBe(false);
  });

  it("renders false under renderToString — no DOM access, no hydration mismatch (#421)", () => {
    expect(renderToString(<Probe />)).toBe("false");
  });

  it("becomes true once the deferred link fires 'load'", () => {
    const link = appendDeferredLink();
    const { result } = renderHook(() => useAppStylesheetApplied());

    act(() => {
      link.dispatchEvent(new Event("load"));
    });

    expect(result.current).toBe(true);
  });

  it("becomes true once the deferred link fires 'error'", () => {
    const link = appendDeferredLink();
    const { result } = renderHook(() => useAppStylesheetApplied());

    act(() => {
      link.dispatchEvent(new Event("error"));
    });

    expect(result.current).toBe(true);
  });

  it("is true immediately when no deferred print link exists (e.g. dist/_spa.html's plain blocking link)", () => {
    const { result } = renderHook(() => useAppStylesheetApplied());
    expect(result.current).toBe(true);
  });

  it("is true immediately when the link's media already swapped to 'all' before mount", () => {
    appendDeferredLink("all");
    const { result } = renderHook(() => useAppStylesheetApplied());
    expect(result.current).toBe(true);
  });
});
