import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The real polyfill would install its own document.modelContext; each test
// installs a fake surface instead.
vi.mock("@mcp-b/webmcp-polyfill", () => ({}));

import { registerWebMCPTools } from "../WebMCP";

const REGISTERED_KEY = "__webmcp_registered";

function fakeContext() {
  return { registerTool: vi.fn() };
}

describe("registerWebMCPTools — modelContext surface", () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)[REGISTERED_KEY];
  });

  afterEach(() => {
    delete (document as unknown as Record<string, unknown>).modelContext;
    delete (navigator as unknown as Record<string, unknown>).modelContext;
  });

  it("registers on document.modelContext and never reads the deprecated navigator.modelContext", () => {
    const docContext = fakeContext();
    const navigatorGetter = vi.fn(() => fakeContext());
    Object.defineProperty(document, "modelContext", { value: docContext, configurable: true });
    Object.defineProperty(navigator, "modelContext", { get: navigatorGetter, configurable: true });

    registerWebMCPTools();

    expect(docContext.registerTool).toHaveBeenCalled();
    expect(navigatorGetter).not.toHaveBeenCalled();
  });

  it("falls back to navigator.modelContext when document.modelContext is missing", () => {
    const navContext = fakeContext();
    Object.defineProperty(navigator, "modelContext", { value: navContext, configurable: true });

    registerWebMCPTools();

    expect(navContext.registerTool).toHaveBeenCalled();
  });
});
