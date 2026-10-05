/**
 * scheduleIdle Tests
 *
 * `scheduleIdle` is the reusable idle-scheduling primitive behind
 * `useIdleOrInteraction` (design.md D6/D2, SDD `landing-main-thread-tbt`
 * slice S2a). It prefers `requestIdleCallback` and falls back to
 * `setTimeout` in browsers/environments without it (this repo's Jest
 * config runs in a plain Node environment with no jsdom — see
 * `tests/unit/shared/hooks/useWhatsappPhone.test.ts` — so both globals
 * are stubbed directly on `global` for each test).
 */

import { scheduleIdle } from "@shared/utils/scheduleIdle";

interface MutableGlobal {
  requestIdleCallback?: (
    cb: (deadline: IdleDeadline) => void,
    opts?: { timeout?: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const FAKE_DEADLINE: IdleDeadline = {
  didTimeout: false,
  timeRemaining: () => 0,
};

describe("scheduleIdle", () => {
  const mutableGlobal = global as unknown as MutableGlobal;
  const originalRequestIdleCallback = mutableGlobal.requestIdleCallback;
  const originalCancelIdleCallback = mutableGlobal.cancelIdleCallback;

  afterEach(() => {
    mutableGlobal.requestIdleCallback = originalRequestIdleCallback;
    mutableGlobal.cancelIdleCallback = originalCancelIdleCallback;
    jest.useRealTimers();
  });

  it("invokes cb via requestIdleCallback when available, forwarding the timeout", () => {
    const idleCalls: Array<{ timeout?: number } | undefined> = [];
    mutableGlobal.requestIdleCallback = (cb, opts) => {
      idleCalls.push(opts);
      cb(FAKE_DEADLINE);
      return 7;
    };

    const cb = jest.fn();
    scheduleIdle(cb, { timeout: 2500 });

    expect(idleCalls).toEqual([{ timeout: 2500 }]);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("falls back to setTimeout with the given timeout when requestIdleCallback is unavailable", () => {
    delete mutableGlobal.requestIdleCallback;
    jest.useFakeTimers();

    const cb = jest.fn();
    scheduleIdle(cb, { timeout: 1500 });

    expect(cb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1499);
    expect(cb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("falls back to a default timeout when none is given and requestIdleCallback is unavailable", () => {
    delete mutableGlobal.requestIdleCallback;
    jest.useFakeTimers();

    const cb = jest.fn();
    scheduleIdle(cb);
    jest.advanceTimersByTime(3000);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("the returned cancel function prevents cb from firing, via cancelIdleCallback", () => {
    const cancelCalls: number[] = [];
    mutableGlobal.requestIdleCallback = () => 42;
    mutableGlobal.cancelIdleCallback = (handle) => {
      cancelCalls.push(handle);
    };

    const cb = jest.fn();
    const cancel = scheduleIdle(cb);
    cancel();

    expect(cancelCalls).toEqual([42]);
    expect(cb).not.toHaveBeenCalled();
  });

  it("the returned cancel function prevents cb from firing, via clearTimeout (fallback path)", () => {
    delete mutableGlobal.requestIdleCallback;
    jest.useFakeTimers();

    const cb = jest.fn();
    const cancel = scheduleIdle(cb, { timeout: 1000 });
    cancel();
    jest.advanceTimersByTime(1000);

    expect(cb).not.toHaveBeenCalled();
  });
});
