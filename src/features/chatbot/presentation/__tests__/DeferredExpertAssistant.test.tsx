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

import { DeferredExpertAssistant } from "../DeferredExpertAssistant";
import { OPEN_ASSISTANT_EVENT } from "../ExpertAssistantWithRAG";

describe("DeferredExpertAssistant", () => {
  let idleCallbacks: Array<() => void>;

  beforeEach(() => {
    idleCallbacks = [];
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
    expect(renderToString(<DeferredExpertAssistant />)).toBe("");
  });

  it("renders null on first client render", () => {
    const { container } = render(<DeferredExpertAssistant />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts the assistant once idle fires", async () => {
    render(<DeferredExpertAssistant />);

    act(() => {
      idleCallbacks.forEach((cb) => cb());
    });

    expect(
      await screen.findByRole("button", { name: "Asistente Experto" }),
    ).toBeInTheDocument();
  });

  it("mounts the assistant on first pointerdown, even before idle fires", async () => {
    render(<DeferredExpertAssistant />);

    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(
      await screen.findByRole("button", { name: "Asistente Experto" }),
    ).toBeInTheDocument();
  });

  it("mounts immediately, already open, on OPEN_ASSISTANT_EVENT — even before idle/interaction", async () => {
    render(<DeferredExpertAssistant />);

    act(() => {
      window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
    });

    expect(
      await screen.findByRole("dialog", { name: "Chat con asistente experto" }),
    ).toBeInTheDocument();
  });
});
