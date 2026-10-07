/**
 * DeferredExpertAssistant tests (design.md D6, SDD `landing-main-thread-tbt`
 * slice S2b).
 *
 * Filed beside `ExpertAssistantWithRAG`'s own `components/__tests__`
 * convention (not the literal `tests/unit/features/chatbot/...` path from
 * tasks.md): it needs a real DOM render (null-on-SSR check via
 * `renderToString`, idle/pointerdown mounting, event dispatch), which only
 * runs under Vitest in this repo (see `useIdleOrInteraction.test.tsx` for
 * the same rationale). `src/features/**\/*.test.tsx` is already in
 * `vite.config.ts`'s `test.include`, so no config change was needed here.
 */
import { renderToString } from "react-dom/server";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

import { DeferredExpertAssistant } from "../DeferredExpertAssistant";
import { OPEN_ASSISTANT_EVENT } from "../ExpertAssistantWithRAG";
import { LanguageProvider } from "@shared/context/LanguageContext";

// U3: `ExpertAssistantWithRAG` now reads `useLanguage()` (grounded-failure
// message, design D7), so every render here needs a `LanguageProvider`
// ancestor — exactly like the real tree (`entry-client.tsx`/
// `entry-server.tsx` always wrap the whole app in one).
function withLanguage(ui: ReactElement) {
  return <LanguageProvider>{ui}</LanguageProvider>;
}

// `useAppStylesheetApplied` (font-stability PR3, design.md D4) is mocked
// directly at its own import path rather than exercised end-to-end here —
// its own detection logic has its dedicated suite in
// `useAppStylesheetApplied.test.tsx`. This file only asserts
// DeferredExpertAssistant's own gating decision.
const mockStylesheetApplied = { value: true };
vi.mock("@shared/hooks/useAppStylesheetApplied", () => ({
  useAppStylesheetApplied: () => mockStylesheetApplied.value,
}));

describe("DeferredExpertAssistant", () => {
  let idleCallbacks: Array<() => void>;

  beforeEach(() => {
    idleCallbacks = [];
    mockStylesheetApplied.value = true;
    vi.stubGlobal(
      "requestIdleCallback",
      (cb: () => void) => {
        idleCallbacks.push(cb);
        return idleCallbacks.length;
      },
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders null server-side (SSR markup parity)", () => {
    expect(renderToString(withLanguage(<DeferredExpertAssistant />))).toBe("");
  });

  it("renders null on first client render", () => {
    const { container } = render(withLanguage(<DeferredExpertAssistant />));
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the assistant once idle fires", async () => {
    render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      idleCallbacks.forEach((cb) => cb());
    });

    expect(
      await screen.findByRole("button", { name: "Asistente Experto" }),
    ).toBeInTheDocument();
  });

  it("mounts the assistant on first pointerdown, even before idle fires", async () => {
    render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(
      await screen.findByRole("button", { name: "Asistente Experto" }),
    ).toBeInTheDocument();
  });

  it("mounts immediately, already open, on OPEN_ASSISTANT_EVENT — even before idle/interaction", async () => {
    render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
    });

    expect(
      await screen.findByRole("dialog", { name: "Chat con asistente experto" }),
    ).toBeInTheDocument();
  });

  it("does NOT mount once idle fires if the app stylesheet has not applied yet (design.md D4 — no fixed-position render pre-CSS)", () => {
    mockStylesheetApplied.value = false;
    const { container } = render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      idleCallbacks.forEach((cb) => cb());
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("mounts once idle fires AND the stylesheet has applied", async () => {
    mockStylesheetApplied.value = true;
    render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      idleCallbacks.forEach((cb) => cb());
    });

    expect(
      await screen.findByRole("button", { name: "Asistente Experto" }),
    ).toBeInTheDocument();
  });

  it("openedEarly (OPEN_ASSISTANT_EVENT) bypasses the stylesheet gate — mounts even if the stylesheet has not applied yet", async () => {
    mockStylesheetApplied.value = false;
    render(withLanguage(<DeferredExpertAssistant />));

    act(() => {
      window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
    });

    expect(
      await screen.findByRole("dialog", { name: "Chat con asistente experto" }),
    ).toBeInTheDocument();
  });
});
