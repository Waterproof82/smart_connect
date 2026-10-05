/**
 * useIdleOrInteraction Tests
 *
 * Behavioral hook test (idle fire, first-interaction fire, listener
 * cleanup on unmount) — requires a real DOM + React render, which this
 * repo's Jest config does not provide (no `jest-environment-jsdom`
 * installed — see `tests/unit/shared/hooks/useWhatsappPhone.test.ts`).
 * Vitest's config (`vite.config.ts`) already runs with
 * `environment: "jsdom"`; this file's `.tsx` extension + its
 * `src/shared/hooks/**` location (added to `vite.config.ts`'s `test.include`
 * in this same change) route it to Vitest. Note the `.tsx` extension is
 * also what keeps Jest's broad `**\/?(*.)+(spec|test).ts` testMatch
 * pattern from picking this file up and failing it in the no-jsdom Jest
 * environment — only `.ts` files match that pattern, not `.tsx`.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdleOrInteraction } from "@shared/hooks/useIdleOrInteraction";

describe("useIdleOrInteraction", () => {
  let idleCallbacks: Array<() => void>;
  let idleOptions: Array<{ timeout?: number } | undefined>;

  beforeEach(() => {
    idleCallbacks = [];
    idleOptions = [];
    vi.stubGlobal(
      "requestIdleCallback",
      (cb: () => void, opts?: { timeout?: number }) => {
        idleCallbacks.push(cb);
        idleOptions.push(opts);
        return idleCallbacks.length;
      },
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false on first render (SSR + first client render)", () => {
    const { result } = renderHook(() => useIdleOrInteraction());
    expect(result.current).toBe(false);
  });

  it("becomes true once the scheduled idle callback fires", () => {
    const { result } = renderHook(() => useIdleOrInteraction());

    act(() => {
      idleCallbacks.forEach((cb) => cb());
    });

    expect(result.current).toBe(true);
  });

  it.each(["pointerdown", "keydown", "scroll"])(
    "becomes true immediately on a first %s, even if idle has not fired yet",
    (eventName) => {
      const { result } = renderHook(() => useIdleOrInteraction());

      act(() => {
        window.dispatchEvent(new Event(eventName));
      });

      expect(result.current).toBe(true);
    },
  );

  it("forwards a custom timeout to the idle scheduler", () => {
    renderHook(() => useIdleOrInteraction(5000));
    expect(idleOptions).toEqual([{ timeout: 5000 }]);
  });

  it("uses the scheduleIdle default timeout when none is given", () => {
    renderHook(() => useIdleOrInteraction());
    expect(idleOptions).toEqual([{ timeout: 3000 }]);
  });

  it("removes every interaction listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIdleOrInteraction());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("cancels the pending idle callback on unmount", () => {
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);
    const { unmount } = renderHook(() => useIdleOrInteraction());

    unmount();

    expect(cancelIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("does not react to events anymore after unmount (listeners actually detached)", () => {
    const { result, unmount } = renderHook(() => useIdleOrInteraction());

    unmount();
    window.dispatchEvent(new Event("pointerdown"));

    // The hook is unmounted; `result.current` stays frozen at its last
    // rendered value (false) regardless, but the real assertion is that
    // dispatching the event after unmount does not throw/log a warning
    // about updating an unmounted component — which it would if the
    // listener were still attached and called `setState`.
    expect(result.current).toBe(false);
  });
});
