# Audit Log — Defer WebMCP Registration (PR 3 of 3: Core Web Vitals Perf)

**Date:** 2026-10-07
**Change:** SDD `core-web-vitals-perf`
**Type:** Performance fix (Changed)
**Branch:** `feat/cwv-webmcp-defer` (base: `develop`, independent PR — not stacked)

## Summary

Third of three independent PRs (user-resolved `ask-on-risk` decision: three independent PRs from
`develop`, not stacked) fixing Core Web Vitals regressions. This PR moves WebMCP tool
registration off the pre-hydration critical path:

1. `entry-client.tsx` no longer statically `import`s `registerWebMCPTools` from `./WebMCP`, nor
   calls it at module scope before `hydrateRoot`/`createRoot` run.
2. A new `src/webmcpBoot.ts` exports `scheduleWebMCPRegistration(load, schedule)` — both
   parameters injectable, defaulting to a dynamic `import("./WebMCP")` and the existing
   `scheduleIdle` utility.
3. `boot()` calls `scheduleWebMCPRegistration()` once, after BOTH the `hydrateRoot` and
   `createRoot` branches, so `/admin` keeps parity with prerendered routes.
4. `@mcp-b/webmcp-polyfill` and the tool descriptors now only load once the browser reaches idle
   (or the existing `scheduleIdle` timeout elapses) — after hydration has already completed —
   instead of on every visit's pre-hydration module graph.

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 3.1–3.2 | `src/webmcpBoot.ts`, `tests/unit/webmcpBoot.test.ts` (new) | 6 cases written first against a non-existent module — confirmed RED via `Cannot find module '../../src/webmcpBoot'`. Implemented `scheduleWebMCPRegistration(load, schedule)`: calls `schedule(cb)` where `cb` runs `load().then(m => m.registerWebMCPTools()).catch(() => {})`, so both a rejected `load()` and a throw inside `registerWebMCPTools()` are swallowed by the same `.catch`. Returns the cancel function produced by `schedule`. Asserts: no `load()` call before the scheduled callback fires; `load`/`registerWebMCPTools` each called exactly once after it fires; errors from either swallowed without throwing synchronously or leaving an unhandled rejection; default params (`scheduleIdle` + real `./WebMCP`) are callable with zero args and return a cancel function, without eagerly importing `./WebMCP`. 6/6 pass. |
| 3.3–3.4 | `src/entry-client.tsx`, `tests/unit/shared/entryWiring.structure.test.ts` | Added 4 RED cases to the existing structure-test file (same file-read convention as the pre-existing `ConsentProvider` wiring tests, since `entry-client.tsx` is `.tsx` and untestable behaviorally under this repo's Jest config): no static `import { registerWebMCPTools } from "./WebMCP"`; no module-scope `registerWebMCPTools()` call; imports and calls `scheduleWebMCPRegistration()` from `./webmcpBoot`; the call is positioned (by source-index comparison) after both `hydrateRoot(root, app)` and `createRoot(root).render(app)` inside `boot()`. Confirmed RED (4 failing, 10 pre-existing passing — no regression) against the old `entry-client.tsx`. Implemented: swapped the static import for `scheduleWebMCPRegistration` from `./webmcpBoot`, removed the module-scope `registerWebMCPTools()` call, added `scheduleWebMCPRegistration()` at the end of `boot()` after the `if (hasSSRContent) { ... } else { ... }` branch (covers both hydrate and create-root paths in one call site). 14/14 pass. |
| 3.5 | `CHANGELOG.md`, this file | Per protocol. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full suite) — **1611/1614 pass**, **3 pre-existing failures** in
  `tests/e2e/chatbotFlow.test.ts` (live RAG chatbot API returning 500 — unrelated to this change,
  same failures seen in the PR1 and PR2 apply batches). No regressions introduced by this PR.
- `npm run build`/`vite build` was **not** run (user rule: never build after changes). Per the
  tasks artifact's 3.6 verify step — tools absent pre-idle, present after idle/interaction on
  every route including `/admin`; contact form + markdown-negotiation routes still functional; no
  React #421; Consent Mode v2/GA4 timing unchanged — that full build+prerender+local-preview check
  is deferred to `sdd-verify`.
- Grepped `src/` for `registerWebMCPTools`/`from "./WebMCP"`: only `src/webmcpBoot.ts` (the new
  caller) and `src/WebMCP.ts` (the definition) reference it — confirms `WebMCP.ts` remains the
  sole importer of `@mcp-b/webmcp-polyfill`, so the polyfill is fully off the entry chunk's static
  module graph.

## Review budget

`git diff --cached --stat`: 5 files changed, 192 insertions(+), 4 deletions(-). Within the tasks
artifact's PR3 forecast (~150-200 lines, Low risk).

## Untouched (hard constraints, carried from design/spec)

Consent Mode v2 + deferred gtag loader (`index.html`'s inline `<script>`),
`registerContactClickTracking` (unchanged, still called at module scope — it is not in PR3 scope
and is not a polyfill/tool-registration cost), the WebMCP double-registration guard in
`WebMCP.ts` (`__webmcp_registered`), `vite-manual-chunks.ts`/`vite.config.ts` (PR2 scope, not
merged into `develop` yet — this branch only has PR1 merged), font/CSP work (PR1 scope, merged).

## Next

No further PR in this SDD change. `sdd-verify` owns the build-based checks for all three PRs
(fonts/CLS, manualChunks, WebMCP defer) before any of them merge.
