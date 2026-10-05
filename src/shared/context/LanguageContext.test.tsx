/**
 * LanguageContext — redundant `lang` write test (design.md D5, SDD
 * `landing-main-thread-tbt` slice S2b).
 *
 * Behavioral test (MutationObserver + React render), filed beside the
 * source file and routed to Vitest via `vite.config.ts`'s
 * `src/shared/context/**\/*.test.tsx` include entry — same deviation
 * rationale as `ThemeContext.test.tsx` in this slice.
 */
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LanguageProvider } from "./LanguageContext";

function observeLangMutations(): {
  records: MutationRecord[];
  disconnect: () => void;
} {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((muts) => records.push(...muts));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  return { records, disconnect: () => observer.disconnect() };
}

describe("LanguageProvider — redundant lang write (D5)", () => {
  afterEach(() => {
    document.documentElement.lang = "";
    localStorage.clear();
  });

  it("does not mutate the lang attribute when it already matches the resolved language", async () => {
    document.documentElement.lang = "es";
    localStorage.removeItem("language");
    const { records, disconnect } = observeLangMutations();

    render(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );
    await act(async () => {});

    expect(records).toHaveLength(0);
    disconnect();
  });

  it("writes the lang attribute when it differs from the resolved language", async () => {
    document.documentElement.lang = "fr";
    localStorage.setItem("language", "en");

    render(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );
    await act(async () => {});

    expect(document.documentElement.lang).toBe("en");
  });
});
