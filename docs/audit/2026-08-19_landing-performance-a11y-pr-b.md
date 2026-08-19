# Audit Log — `landing-performance-a11y` PR B (U3: deferred Supabase chokepoint)

**Date**: 2026-08-19
**Change**: `landing-performance-a11y`
**Scope**: PR B of 3 (U3 — Deferred Supabase load), stacked-to-main chain, after PR A (U1+U2)

## Summary

Added a single async chokepoint, `getSupabase()` in `src/shared/supabaseClient.ts`, that
dynamically imports `@supabase/supabase-js` on first call instead of a static top-level
import. Converted all 5 landing-entry-graph consumers (`settingsService`,
`NoOpSecurityLogger`, `EmailNotifyDataSource`, `ChatbotContainer`, `ExpertAssistantWithRAG`)
to use it. Goal: keep `vendor-supabase` out of the landing page's initial
entry/modulepreload graph — it is now fetched only once a user actually interacts with
something Supabase-backed (chat widget open, rate-limited/XSS security event, contact-form
submit, or the WhatsApp-phone settings fetch already deferred to a mount effect).

## Actions

1. **Created `src/shared/utils/memoizeAsync.ts`** — generic async memoize-with-retry
   utility (TDD: RED→GREEN, 5 tests). Extracted as a plain, dependency-free module (no
   `import.meta`, no `@supabase/supabase-js`) after discovering that Jest's ts-jest
   transform cannot load ANY file that combines `import.meta.env` access with an
   `@supabase/supabase-js` import in the same module — confirmed via a minimal repro; every
   pre-existing test in this codebase mocks `@shared/supabaseClient` rather than loading the
   real module, which is why this was never hit before this PR.
2. **Rewrote `src/shared/supabaseClient.ts`** as the async-only chokepoint: `export const
   getSupabase = memoizeAsync(loadClient)`, where `loadClient()` does `await
   import("@supabase/supabase-js")` strictly inside its own async function body (never
   module scope, never render). No static/type-only runtime edge to `@supabase/supabase-js`
   remains in this file.
3. **Discovered mid-implementation**: 3 more static consumers of the old synchronous
   `supabase` Proxy export existed outside the design's listed "5 consumer paths" —
   `SupabaseSettingsRepository.ts`, `SupabaseDocumentRepository.ts`,
   `SupabaseAuthRepository.ts` (all `/admin`, already isolated behind
   `React.lazy(() => import("@features/admin/presentation"))` in `entry-client.tsx`, so
   never part of the landing entry graph). Keeping their sync `supabase` export in the same
   file as the new `getSupabase()` chokepoint would have forced Rollup to bundle
   `supabaseClient.ts` — and its live static `@supabase/supabase-js` import — into a shared
   chunk reachable from BOTH the eager landing entry (which imports `getSupabase`) and the
   admin lazy chunk, silently reintroducing the static edge this whole PR exists to remove.
   **Fix**: created `src/shared/supabaseClientSync.ts` (unchanged Proxy logic, just moved)
   and repointed the 3 admin repositories' import path only — zero logic change to those
   files. Documented as a deviation from design.md's file table in the apply-progress
   artifact.
4. **Converted 5 consumers** to `await getSupabase()`:
   - `settingsService.getAppSettings()`
   - `NoOpSecurityLogger.createSupabasePersistence().insert()` (now exported for direct
     testability)
   - `EmailNotifyDataSource.sendLead()` (dropped the `= supabase` ctor default; resolves
     inside the method, injected client still takes priority)
   - `ChatbotContainer.createChatbotContainer()` (now `async`, no-arg — removes the
     Presentation-layer client leak: `ExpertAssistantWithRAG.tsx` used to import `supabase`
     purely to pass it through)
   - `ExpertAssistantWithRAG.tsx`: removed the static `supabase` import and the old
     `_container` module-level singleton; added `containerPromiseRef`, populated on the
     `onToggle` OPEN transition (not first send — user reads the welcome screen while the
     ~53 KiB chunk downloads); `handleSendMessage` awaits the ref; the catch path resets
     `containerPromiseRef.current = null` so a transient failure (offline, stale chunk after
     deploy) is retryable instead of permanently bricking the widget.
5. **SSR parity verified**: `App.tsx`, `src/entry-server.tsx`, `src/entry-client.tsx` have
   zero diff (`git diff --stat` confirmed empty). The dynamic import lives strictly inside
   async function bodies / an event handler.

## Strict TDD Evidence

| Unit | RED | GREEN |
|---|---|---|
| `memoizeAsync` | 5 tests written first (memoize, no-cache-on-rejection, retry, concurrent dedup, sync-throw safety) — failed on missing module | All 5 passed on first correct implementation (one test-authoring bug fixed: had to await a microtask before grabbing a captured `resolve` fn) |
| `supabaseClient.ts` wiring | 8 structure-test assertions (no static `createClient` import, type-only import present, dynamic import present + nested in a function, composes `memoizeAsync`, exports `getSupabase`, no longer exports sync `supabase`) — all failed against the pre-existing file | All 8 passed after rewrite |
| `supabaseClientSync.ts` | 1 structure assertion (file exists, exports Proxy-based `supabase`, has the static `createClient` import) — failed (file didn't exist) | Passed after creation |
| `settingsService.getAppSettings()` | 2 new test cases (getSupabase() rejection → default settings; getSupabase() called exactly once) — failed against old `{ supabase }` mock shape | Passed after `await getSupabase()` conversion |
| `NoOpSecurityLogger` (`createSupabasePersistence`) | 4 tests written first — failed with `createSupabasePersistence is not a function` (not exported yet) | All 4 passed after export + `await getSupabase()` conversion. Also uncovered a project-wide Jest auto-mock gotcha (see below) |
| `EmailNotifyDataSource.sendLead()` | 3 new test cases (resolves via getSupabase when no client injected; getSupabase rejection → `false`, not a throw; getSupabase NOT called when client is injected) — 1 failed against old ctor-default behavior | All 3 passed after ctor/`sendLead()` conversion |
| `ChatbotContainer.createChatbotContainer()` | 3 tests written first — failed (`getSupabase` never called; old signature required a `SupabaseClient` argument) | All 3 passed after `async`, no-arg conversion |
| `ExpertAssistantWithRAG.tsx` wiring | 8 structure-test assertions — 5 failed against the pre-existing file (no `containerPromiseRef`, no ref reset in catch, still statically importing `supabase`) | All 8 passed after rewrite |

## Discoveries (saved to engram)

1. **Jest cannot load any file combining `import.meta.env` with an `@supabase/supabase-js`
   import** under this repo's `ts-jest`/ESM-preset config (no `--experimental-vm-modules`
   flag set) — confirmed via a 4-step minimal repro (isolated `import.meta.env` works,
   isolated `@supabase/supabase-js` import works, combined in one file breaks with `Cannot
   use 'import.meta' outside a module` even with `--clearCache`). This is why every existing
   test in this repo mocks `@shared/supabaseClient` rather than loading it directly.
   Consequence for future work: any new module needing both must either (a) mock the
   dependency in tests as this repo already does everywhere, or (b) split pure/testable
   logic into a separate file the way `memoizeAsync.ts` does here.
2. **Project-wide Jest auto-mock**: `tests/__mocks__/@core/domain/usecases/NoOpSecurityLogger.ts`
   is picked up automatically (no explicit `jest.mock()` needed) for ANY test that imports
   `@core/domain/usecases/NoOpSecurityLogger` — Jest treats the `@core/...` path alias as a
   scoped-package-style specifier and applies the adjacent manual mock project-wide. A test
   that needs the REAL module must call `jest.unmock('@core/domain/usecases/NoOpSecurityLogger')`
   first (used in `tests/unit/core/NoOpSecurityLogger.test.ts`).

## Review Workload Note

Tasks artifact forecast PR B at ~180 lines across 6 files. Actual diff is substantially
larger — 6 source files logically-mechanically modified (~270 changed lines total) plus 7
new files (2 production, 5 test) totaling ~490 added lines, for a combined ~760 changed
lines across 13 files. The overrun is driven almost entirely by comprehensive Strict-TDD
test coverage (memoizeAsync alone is 88 test lines for 38 implementation lines) and the
mid-implementation `supabaseClientSync.ts` split required for correctness (not scope creep
— see Discovery/Deviation above). Flagged transparently in apply-progress and the sdd-apply
return summary per the Review Workload Guard; this is a single, non-splittable atomic
technical unit (the chokepoint's correctness depends on all 5 consumers converting
together), so it was not further chained. Recommend the maintainer apply `size:exception` at
review time if a hard per-PR cap is enforced.

## Validation

- `npx jest --config=jest.config.js` — 76/76 suites, 964/964 tests passing (up from 71/931
  after PR A; +5 new suites, +33 new tests, no regressions).
- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (0 errors, 0 warnings).
- `git diff --stat -- src/entry-server.tsx src/entry-client.tsx src/App.tsx` — empty (SSR
  tree parity confirmed unchanged).
