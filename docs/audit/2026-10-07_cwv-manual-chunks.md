# Audit Log — Exact-Match Vendor Chunking (PR 2 of 3: Core Web Vitals Perf)

**Date:** 2026-10-07
**Change:** SDD `core-web-vitals-perf`
**Type:** Build-output fix (Changed)
**Branch:** `feat/cwv-manual-chunks` (base: `develop`, independent PR — not stacked)

## Summary

Second of three independent PRs (user-resolved `ask-on-risk` decision: three independent PRs from
`develop`, not stacked) fixing Core Web Vitals regressions. This PR fixes the client build's
`manualChunks` substring-matching bug (design.md D7):

1. `id.includes("react")` in the old `vite.config.ts` matched any package whose name/path
   *contained* "react" — not just React itself — silently merging `lucide-react`,
   `react-router-dom`, `react-helmet-async`, `react-hook-form`, `react-icons` and
   `@hookform/resolvers` into the `vendor-react` chunk.
2. New pure module `vite-manual-chunks.ts` (repo root, alongside `vite-plugin-md-negotiation.ts`)
   replaces the substring check with exact package-name matching.
3. `vendor-recharts` is intentionally dropped — it is admin-only and its dependency closure
   (`react-redux`, `d3-*`) is not leaf-closed, so forcing it into its own vendor chunk risked
   circular chunk imports. Rollup now keeps it co-located with its importers in the lazy admin
   chunk.

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 2.1 | `tests/unit/vite/manualChunks.test.ts` (new) | 21 RED cases written first: `packageNameFromId` — POSIX node_modules id, Windows backslash id, pnpm nested `.pnpm/<pkg>@<version>/node_modules/<pkg>` id (POSIX + Windows), scoped package (`@supabase/supabase-js`), scoped pnpm id, no-node_modules id. `vendorChunkFor` — `react`/`react-dom`/`scheduler` → `vendor-react`, `@supabase/supabase-js`/`@supabase/postgrest-js` → `vendor-supabase`, `lucide-react` → `vendor-lucide`, and the substring-collision regressions (`react-router-dom`, `react-helmet-async`, `react-hook-form`, `react-icons`, `@hookform/resolvers`, `recharts`, `react-redux` — all must stay `undefined`). Run against the not-yet-created module: `Cannot find module '../../../vite-manual-chunks'` — confirmed RED. |
| 2.2 | `vite-manual-chunks.ts` (new) | Implemented `packageNameFromId` (normalize `\`→`/`, `lastIndexOf("/node_modules/")`, split the remainder on `/`, keep `@scope/name` as two segments) and `vendorChunkFor` (exact-match lookup table, no recharts entry). 21/21 pass. |
| 2.3 | `vite.config.ts` | Replaced the inline substring-matching `manualChunks` closure in the client-build branch with `manualChunks: (id: string) => vendorChunkFor(id)`, importing `vendorChunkFor` from `./vite-manual-chunks.ts`. The `mode === "ssr"` branch is untouched. |
| 2.4 | `CHANGELOG.md`, this file | Per protocol. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean. (`vite-manual-chunks.ts` follows the same precedent as
  `vite.config.ts`/`vite-plugin-md-negotiation.ts`: root-level files outside `tsconfig.json`'s
  `include` — `src/**/*`, `.opencode/**/*.ts` — so not covered by the project's `tsc --noEmit`
  scope, consistent with the other root Vite config files.)
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full suite) — **1622/1625 pass**, **3 pre-existing failures** in
  `tests/e2e/chatbotFlow.test.ts` (live RAG chatbot API returning 500 — unrelated to this change,
  same failures recorded in PR1's apply-progress). No regressions introduced by this PR.
- `npm run build`/`vite build` was **not** run (user rule: never build after changes). Per the
  tasks artifact's 2.5 verify step (chunk graph: single React instance, no circular-chunk
  warnings, `vendor-lucide` emitted, `vendor-recharts` absent/co-located in the admin lazy chunk),
  that full build+prerender check is deferred to `sdd-verify`.

## Review budget

New files: `vite-manual-chunks.ts` (56 lines), `tests/unit/vite/manualChunks.test.ts` (122
lines). Modified: `vite.config.ts` (7 insertions, 9 deletions — net smaller, since the inline
substring logic is replaced by a single delegating call), `CHANGELOG.md` (+1 line). Plus this
audit log. Within the tasks artifact's PR2 forecast (~160-210 lines, Low risk).

## Deviation from design.md's File Changes table

The tasks/design artifacts named the test path `tests/unit/build/manualChunks.test.ts`. The
repo's root `.gitignore` has a bare `build` entry (intended for `dist-ssr`/`.next`/`out`-style
production output dirs) that, without a leading `/`, matches a `build` directory at **any**
depth — so `tests/unit/build/` is silently untracked by git. Moved the test one level over to
`tests/unit/vite/manualChunks.test.ts` instead (new, non-ignored directory); no other repo
convention groups tests by source-file location closer than this. Behavior and test content are
otherwise unchanged from the design.

## Untouched (hard constraints, carried from design/spec)

Fonts/CLS pipeline (PR1 scope, already merged), WebMCP registration timing (PR3 scope), the SSR
build branch of `vite.config.ts`, `optimizeDeps.include` (dev-only prebundling, unrelated to
production chunk graph).

## Next (PR3, not in this batch)

PR3 (`feat/cwv-webmcp-defer`, independent, base `develop`): defer WebMCP registration past
hydration.
