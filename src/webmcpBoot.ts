/**
 * webmcpBoot — deferred WebMCP registration
 * @module webmcpBoot
 *
 * `entry-client.tsx` used to statically `import { registerWebMCPTools }
 * from "./WebMCP"` and call it at module scope, before `hydrateRoot`.
 * That pulls `@mcp-b/webmcp-polyfill` and all tool descriptors into the
 * entry chunk and pays their eval cost before/during hydration on every
 * visit (design.md D8, SDD `core-web-vitals-perf` PR3).
 *
 * `scheduleWebMCPRegistration` instead schedules a dynamic
 * `import("./WebMCP")` via `scheduleIdle`, so registration only runs
 * once the browser is idle (or the existing timeout elapses) — after
 * hydration has already completed. `load` and `schedule` are injectable
 * so tests can assert the no-load-before-fire / register-once /
 * error-swallowed contract without touching the real WebMCP module.
 */

import { scheduleIdle } from "@shared/utils/scheduleIdle";

export interface WebMCPModule {
  registerWebMCPTools: () => void;
}

export function scheduleWebMCPRegistration(
  load: () => Promise<WebMCPModule> = () => import("./WebMCP"),
  schedule: (cb: () => void) => () => void = scheduleIdle,
): () => void {
  return schedule(() => {
    load()
      .then((module) => {
        module.registerWebMCPTools();
      })
      .catch(() => {
        // Chunk load or registration failed — non-critical, skip
        // silently (same contract as registerWebMCPTools' own internal
        // try/catch for navigator.modelContext access).
      });
  });
}
