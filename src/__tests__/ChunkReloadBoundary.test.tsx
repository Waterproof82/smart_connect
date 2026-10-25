import { Component, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ChunkReloadBoundary,
  RELOAD_KEY,
} from "../shared/presentation/ChunkReloadBoundary";

class Outer extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p data-testid="outer">{this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

const Throws = ({ error }: { error: Error }): ReactNode => {
  throw error;
};

const chunkError = () =>
  new TypeError(
    "Failed to fetch dynamically imported module: https://digitalizatenerife.es/assets/TpvPage-OLD.js",
  );

describe("ChunkReloadBoundary", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // React logs caught render errors; keep the output readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children when nothing throws", () => {
    render(
      <ChunkReloadBoundary onReload={vi.fn()}>
        <p>page</p>
      </ChunkReloadBoundary>,
    );
    expect(screen.getByText("page")).toBeInTheDocument();
  });

  it("reloads once when a lazy chunk fails to load", () => {
    const onReload = vi.fn();
    render(
      <ChunkReloadBoundary onReload={onReload}>
        <Throws error={chunkError()} />
      </ChunkReloadBoundary>,
    );
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(RELOAD_KEY)).not.toBeNull();
  });

  it("does not reload again right after a reload; the error reaches the parent", () => {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    const onReload = vi.fn();
    render(
      <Outer>
        <ChunkReloadBoundary onReload={onReload}>
          <Throws error={chunkError()} />
        </ChunkReloadBoundary>
      </Outer>,
    );
    expect(onReload).not.toHaveBeenCalled();
    expect(screen.getByTestId("outer")).toHaveTextContent(/dynamically imported module/);
  });

  it("passes any other error to the parent without reloading", () => {
    const onReload = vi.fn();
    render(
      <Outer>
        <ChunkReloadBoundary onReload={onReload}>
          <Throws error={new Error("boom")} />
        </ChunkReloadBoundary>
      </Outer>,
    );
    expect(onReload).not.toHaveBeenCalled();
    expect(screen.getByTestId("outer")).toHaveTextContent("boom");
  });
});
