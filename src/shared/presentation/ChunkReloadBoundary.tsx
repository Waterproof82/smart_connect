import { Component, type ReactNode } from "react";

/** sessionStorage key holding the time of the last chunk-error reload. */
export const RELOAD_KEY = "chunk-reload-at";

// Do not reload again within this window: if the fresh page still fails,
// the problem is not a stale deploy and reloading would loop.
const RELOAD_WINDOW_MS = 10_000;

// Messages browsers (and Vite's preload helper) use when a lazy chunk
// cannot be fetched — typically a hashed file removed by a newer deploy.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

function reloadedRecently(): boolean {
  try {
    const last = Number(globalThis.sessionStorage?.getItem(RELOAD_KEY));
    return Number.isFinite(last) && Date.now() - last < RELOAD_WINDOW_MS;
  } catch {
    // Storage blocked: assume we already reloaded, never loop.
    return true;
  }
}

function markReload(): void {
  try {
    globalThis.sessionStorage?.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage blocked: reloadedRecently() already returned true, so we
    // never get here without storage.
  }
}

interface Props {
  children: ReactNode;
  /** Injected in tests; defaults to a full page reload. */
  onReload?: () => void;
}

interface State {
  error: Error | null;
  reloading: boolean;
}

/**
 * Reloads the page once when a lazy route chunk fails to load, so a
 * visitor holding a page from an older deploy gets the current one
 * instead of a broken page. Every other error, and a chunk error right
 * after a reload, is re-thrown to the parent unchanged.
 *
 * Renders only its children, so SSR markup is unaffected.
 */
export class ChunkReloadBoundary extends Component<Props, State> {
  state: State = { error: null, reloading: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error): void {
    if (!CHUNK_ERROR.test(error?.message ?? "") || reloadedRecently()) return;
    markReload();
    this.setState({ reloading: true });
    (this.props.onReload ?? (() => globalThis.location.reload()))();
  }

  render(): ReactNode {
    const { error, reloading } = this.state;
    if (!error) return this.props.children;
    if (reloading || this.isReloadPending(error)) return null;
    throw error;
  }

  // Between getDerivedStateFromError and componentDidCatch, render runs
  // once with the error set: hold (render nothing) when this error is
  // going to trigger a reload instead of re-throwing it first.
  private isReloadPending(error: Error): boolean {
    return CHUNK_ERROR.test(error?.message ?? "") && !reloadedRecently();
  }
}
