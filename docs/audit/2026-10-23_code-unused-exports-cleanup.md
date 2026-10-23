# Audit Log: code-unused-exports-cleanup

## PR1 — 2026-10-23 — knip config + confirmed deletions + narrow CI gate

**Branch**: `fix/knip-config-dead-barrels` (from `develop`)

### Actions

1. **2026-10-23** — Added `tests/unit/ci/deadCodeGate.test.ts` (RED): asserts `devDependencies.knip` is pinned exact (no `^`/`~`), `scripts.knip` exists, `knip.json` `ignore` contains `supabase/functions/**`, `knip.json` `entry` contains `entry-server`/`middleware`, and the CI workflow runs `npm run knip` after `npm run type-check`.
2. **2026-10-23** — Added `knip.json` (entry: `src/entry-client.tsx`, `src/entry-server.tsx`, `middleware.ts`, `api/**/*.mjs`, `scripts/**/*.mjs`; ignore: `.claude/**`, `.opencode/**`, `supabase/functions/**`; `ignoreExportsUsedInFile: true`). Installed `knip@5.88.1` as an exact-pinned devDependency (`npm i -D -E knip@5`). Added `"knip": "knip"` script. Guard test green.
3. **2026-10-23** — Ran `npx knip` (full) to confirm the config matches the discovery: 10 unused files, 27 duplicate exports, 2 unused exported types match exactly. Unused-export count differs in presentation only (knip reports 28 individual `unused exports` lines vs. discovery's 21 — the 7-item delta is the `ChatInput`/`ChatMessages`/`ChatToggleButton`/`ChatWelcome`/`LinkifiedText` group plus others that knip buckets under `Duplicate exports` instead once both a named and a default export exist for the same symbol; no new dead-code candidates beyond what design/tasks already enumerate). Ran `npx knip --include files,dependencies,devDependencies,unlisted,unresolved`: only the 10 unused files, zero deps/unlisted/unresolved — matches the orchestrator-verified trial run exactly.
4. **2026-10-23** — Verified via `rg` that all 10 orphan barrels have zero alias/relative/dynamic-import references in `src/` and the wider repo (one stale `README.md` code example references `@core/domain/entities`, not real code — left untouched, out of scope). Deleted:
   - `src/core/domain/entities/index.ts`
   - `src/features/admin/data/repositories/index.ts`
   - `src/features/admin/domain/entities/index.ts`
   - `src/features/admin/domain/repositories/index.ts`
   - `src/features/admin/domain/usecases/index.ts`
   - `src/features/chatbot/data/datasources/index.ts`
   - `src/features/chatbot/data/repositories/index.ts`
   - `src/features/chatbot/domain/repositories/index.ts`
   - `src/features/chatbot/domain/usecases/index.ts`
   - `src/features/landing/presentation/components/index.ts`
5. **2026-10-23** — Deleted the 18 orphaned `dashboard*` i18n keys (interface block, `es` block, `en` block, including the `// Dashboard Preview` comment) from `src/shared/context/LanguageContext.tsx`. Confirmed zero references outside the file via `rg` before and after.
6. **2026-10-23** — Added CI step `Dead code (knip)` to `.github/workflows/ci-cd.yml`, running `npm run knip -- --include files,dependencies,devDependencies,unlisted,unresolved` immediately after `Type check`. Guard test extended/confirmed green.
7. **2026-10-23** — Verification per commit: `npx tsc --noEmit` (clean), `npm run lint` (clean), `npm test` (145/145 suites, 1856 passed, 4 skipped), `npx vitest run` (33/33 files, 187 passed), `npx knip --include files,dependencies,devDependencies,unlisted,unresolved` (exit 0). `git diff -- supabase/functions/` confirmed empty throughout.

### Deviation from design

None functionally. Noted a cosmetic knip count mismatch (28 vs. discovery's 21 "unused exports" lines) caused by knip's duplicate-export bucketing — does not change the deletion scope for PR2/PR3.
