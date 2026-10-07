/**
 * webmcpBoot Tests
 *
 * `scheduleWebMCPRegistration` moves the WebMCP tool-registration module
 * off the pre-hydration synchronous path (design.md D8, SDD
 * `core-web-vitals-perf` PR3). It takes an injectable `load` (the dynamic
 * `import("./WebMCP")`) and `schedule` (defaults to `scheduleIdle`) so
 * this test can assert the ordering and error-swallowing contract
 * without touching the real WebMCP module or `navigator.modelContext`.
 */

import { scheduleWebMCPRegistration } from "../../src/webmcpBoot";

describe("scheduleWebMCPRegistration", () => {
  it("does not call load before the scheduled callback fires", () => {
    let capturedCb: (() => void) | undefined;
    const schedule = jest.fn((cb: () => void) => {
      capturedCb = cb;
      return () => {};
    });
    const load = jest.fn().mockResolvedValue({
      registerWebMCPTools: jest.fn(),
    });

    scheduleWebMCPRegistration(load, schedule);

    expect(schedule).toHaveBeenCalledTimes(1);
    expect(load).not.toHaveBeenCalled();
    expect(capturedCb).toBeDefined();
  });

  it("dynamically imports and registers tools exactly once after schedule fires", async () => {
    const registerWebMCPTools = jest.fn();
    const load = jest.fn().mockResolvedValue({ registerWebMCPTools });
    const schedule = (cb: () => void): (() => void) => {
      cb();
      return () => {};
    };

    scheduleWebMCPRegistration(load, schedule);
    // flush the load().then(...) microtask queue
    await Promise.resolve();
    await Promise.resolve();

    expect(load).toHaveBeenCalledTimes(1);
    expect(registerWebMCPTools).toHaveBeenCalledTimes(1);
  });

  it("swallows a load() rejection without throwing or an unhandled rejection", async () => {
    const load = jest.fn().mockRejectedValue(new Error("chunk load failed"));
    const schedule = (cb: () => void): (() => void) => {
      cb();
      return () => {};
    };

    expect(() => scheduleWebMCPRegistration(load, schedule)).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("swallows a registerWebMCPTools() throw without propagating", async () => {
    const registerWebMCPTools = jest.fn(() => {
      throw new Error("registration failed");
    });
    const load = jest.fn().mockResolvedValue({ registerWebMCPTools });
    const schedule = (cb: () => void): (() => void) => {
      cb();
      return () => {};
    };

    expect(() => scheduleWebMCPRegistration(load, schedule)).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(registerWebMCPTools).toHaveBeenCalledTimes(1);
  });

  it("returns the cancel function produced by schedule", () => {
    const cancel = jest.fn();
    const schedule = jest.fn().mockReturnValue(cancel);
    const load = jest.fn().mockResolvedValue({
      registerWebMCPTools: jest.fn(),
    });

    const returned = scheduleWebMCPRegistration(load, schedule);

    expect(returned).toBe(cancel);
  });

  it("uses scheduleIdle and the real ./WebMCP module as defaults when called with no args", () => {
    // Default-parameter wiring is exercised structurally by
    // entryWiring.structure.test.ts (no static top-level WebMCP import)
    // and is covered end-to-end at sdd-verify (local preview). This test
    // only asserts the function is callable with zero arguments without
    // throwing synchronously — it must not eagerly import ./WebMCP — then
    // cancels the scheduled (real setTimeout, no requestIdleCallback in
    // this Node test env) callback so it cannot fire after the test ends.
    const cancel = scheduleWebMCPRegistration();
    expect(typeof cancel).toBe("function");
    cancel();
  });
});
