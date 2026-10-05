/**
 * ThemeContext — mount-time relayout tests (design.md D4, SDD
 * `landing-main-thread-tbt` slice S2b).
 *
 * Behavioral test (MutationObserver + React render) — requires a real DOM,
 * which this repo's Jest config does not provide (no `jest-environment-jsdom`;
 * see `useIdleOrInteraction.test.tsx` for the same rationale). Filed beside
 * the source file (not at the literal `tests/unit/shared/context/...` path
 * from tasks.md) and routed to Vitest via `vite.config.ts`'s
 * `src/shared/context/**\/*.test.tsx` include entry — same required
 * deviation already applied to `useIdleOrInteraction.test.tsx` in S2a.
 *
 * The pre-paint inline script in `index.html` sets the correct `light`/
 * `dark` class on `<html>` BEFORE React hydrates. `ThemeProvider` must not
 * touch that class again on mount when it already matches — only a real
 * `matchMedia` change afterward should mutate it.
 */
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "./ThemeContext";

type ChangeHandler = (e: MediaQueryListEvent) => void;

function mockMatchMedia(prefersLight: boolean): {
  fireChange: (matches: boolean) => void;
} {
  let changeHandler: ChangeHandler | null = null;
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: prefersLight,
      media: query,
      addEventListener: (_event: string, handler: ChangeHandler) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    })),
  );
  return {
    fireChange: (matches: boolean) => {
      changeHandler?.({ matches } as MediaQueryListEvent);
    },
  };
}

function observeHtmlClassMutations(): {
  records: MutationRecord[];
  disconnect: () => void;
} {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((muts) => records.push(...muts));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return { records, disconnect: () => observer.disconnect() };
}

describe("ThemeProvider — mount-time relayout (D4)", () => {
  afterEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("does not mutate the <html> class during mount when the pre-paint script already set 'dark'", async () => {
    document.documentElement.className = "dark";
    mockMatchMedia(false);
    const { records, disconnect } = observeHtmlClassMutations();

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    await act(async () => {});

    expect(records).toHaveLength(0);
    disconnect();
  });

  it("does not mutate the <html> class during mount when the pre-paint script already set 'light'", async () => {
    document.documentElement.className = "light";
    mockMatchMedia(true);
    const { records, disconnect } = observeHtmlClassMutations();

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    await act(async () => {});

    expect(records).toHaveLength(0);
    disconnect();
  });

  it("still toggles the class when the system preference changes after mount", async () => {
    document.documentElement.className = "dark";
    const { fireChange } = mockMatchMedia(false);

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>,
    );
    await act(async () => {});

    act(() => {
      fireChange(true);
    });

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
