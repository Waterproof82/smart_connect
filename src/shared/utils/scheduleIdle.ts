/**
 * scheduleIdle Utility
 * @module shared/utils/scheduleIdle
 *
 * Runs `cb` once the browser is idle (or after `timeout` ms at the
 * latest), using `requestIdleCallback` when available and falling back
 * to `setTimeout` otherwise (Safari and some older/embedded browsers
 * have no `requestIdleCallback` — design.md D2/D6, SDD
 * `landing-main-thread-tbt` slice S2a). Returns a cancel function so a
 * caller (e.g. `useIdleOrInteraction`) can stop the scheduled callback
 * from firing once it is no longer needed (e.g. on unmount, or because
 * an interaction already resolved it first).
 */

const DEFAULT_TIMEOUT_MS = 3000;

export interface ScheduleIdleOptions {
  timeout?: number;
}

export function scheduleIdle(
  cb: () => void,
  opts?: ScheduleIdleOptions,
): () => void {
  const timeout = opts?.timeout ?? DEFAULT_TIMEOUT_MS;

  if (typeof globalThis.requestIdleCallback === "function") {
    const handle = globalThis.requestIdleCallback(() => cb(), { timeout });
    return () => {
      if (typeof globalThis.cancelIdleCallback === "function") {
        globalThis.cancelIdleCallback(handle);
      }
    };
  }

  const timerId = globalThis.setTimeout(() => cb(), timeout);
  return () => {
    globalThis.clearTimeout(timerId);
  };
}
