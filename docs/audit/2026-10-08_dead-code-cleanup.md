# Audit — Project dead-code cleanup

**Timestamp:** 2026-10-08
**Trigger:** SDD change `project-dead-code-cleanup` — remove confirmed-dead modules and unused dependencies (per `knip` + prior exploration #1193) without breaking build, lint, type-check or either test runner, and without touching protected entry points.

## Scope

Pure deletion of already-confirmed-dead code and manifest entries, plus one honesty fix: CI never ran the Vitest suite (31 `.tsx` test files), so a failing `.tsx` suite would never have failed the pipeline. One orphan test, `tests/unit/shared/HoneypotField.test.tsx`, lived outside `src/` and was invisible to both runners.

Out of scope (explicit non-requirements, unchanged by this cleanup): Supabase RPC/migration drift, `kb_backup`, unused/duplicate exports (31/27 items still flagged by `knip` — separate follow-up), orphaned `dashboard*` i18n keys in `LanguageContext.tsx`.

## Branches / commits

Two chained branches, 9 work-unit commits, each gated on `npm run lint` + `npx tsc --noEmit` + `npm test` (Jest) + `npx vitest run` passing before commit (per owner's global "never build after changes" rule, `npm run build` was excluded from local verification and deferred to CI — a conscious, instructed deviation from the design doc, not an omission).

### PR-A — `fix/dead-code-cleanup-ci` (base `develop`)

1. `test(ci): guard test runner coverage` — added `tests/unit/ci/testRunnerCoverage.test.ts` (RED: failed on the orphan `.tsx` test and the missing CI step, 3/3 assertions red).
2. `ci: run vitest in pipeline` (GREEN) — added a `Run tests (Vitest, jsdom)` step to `.github/workflows/ci-cd.yml` right after the Jest step; widened `vite.config.ts`'s Vitest `include` from 5 explicit globs to `src/**/*.test.tsx`; deleted `src/shared/components/HoneypotField.tsx` (50 lines), its test (99 lines) and its barrel export line.
3. `build(deps): pin @jest/globals explicitly` — added `@jest/globals@^29.7.0` as an explicit `devDependency` (previously a phantom hoisted transitive, relied on by 3 Jest suites: `chatbotFlow`, `documents-rls`, `CreateDocumentUseCase`), done before any `npm uninstall` so a lockfile regen could never silently drop it mid-chain.
4. `refactor: remove dead http client and secure storage` — deleted `src/core/data/datasources/{FetchHttpClient,IHttpClient,index}.ts` (203 lines), `src/shared/utils/retryLogic.ts` (251 lines), `src/shared/utils/secureStorage.ts` (261 lines); `npm uninstall crypto-js @types/crypto-js`. Zero production-code references confirmed via `rg` before deletion; no test files existed for any of these modules.
5. `refactor: remove dead dashboard preview` — deleted `src/shared/components/{DashboardPreview,LazyBarChart}.tsx` (272 lines) and its barrel export line; `npm uninstall recharts`; trimmed `tests/unit/theme/accentContrast.test.ts` (removed the `describe("DashboardPreview.tsx no longer uses the unsatisfiable text/accent pair", ...)` block and stripped `DashboardPreview` mentions from two comments — the token-level contrast assertions were left untouched, since they guard a real CSS-variable invariant, not the removed component).
6. `refactor: remove zero-importer barrels` — deleted the 9 barrels confirmed by `knip`'s "Unused files" report as zero-importer: `src/shared/{components,constants,types}/index.ts`, `src/features/{admin,chatbot}/{data,domain}/index.ts`, `src/features/landing/{data,domain}/index.ts`. Deeper nested barrels (e.g. `src/features/admin/data/repositories/index.ts`) and `src/features/landing/presentation/components/index.ts`, also flagged by `knip`, were left untouched — out of scope for this task list. Protected entry points (`middleware.ts`, `api/negotiate.mjs`, `vite-plugin-md-negotiation.ts`, `src/entry-server.tsx`, `supabase/functions/*/index.ts`, `scripts/check-documents.mjs`, `.opencode/scripts/verify-mistral.ts`, `scripts/check-models.sh`, `scripts/generate-og-images.mjs`) verified present and unchanged at the end of PR-A.

### PR-B — `fix/dead-code-cleanup-deps` (base = PR-A branch)

7. `build(deps): remove unused runtime deps` — `npm uninstall axios swiper react-helmet @types/react-helmet react-icons @types/testing-library__user-event @types/dompurify`. `dompurify` and `@testing-library/user-event` themselves stayed (still imported in `src/shared/utils/sanitizer.ts`, `src/features/landing/domain/entities/Lead.ts`, `src/features/landing/presentation/schemas/contactSchema.ts` and several `*.test.tsx` files) — only their now-redundant `@types/*` packages were removed, since `dompurify` v3 and `@testing-library/user-event` v14 ship their own types. `npx tsc --noEmit` confirmed no masked type error surfaced.
8. `build(deps): remove unused dev tooling` — `npm uninstall @babel/preset-env babel-jest eslint-config-prettier eslint-plugin-simple-import-sort eslint-plugin-unicorn globals prettier vite-plugin-compression vite-plugin-svgr`; deleted `jest.setup.js` (root, 47 lines) and `scripts/clean-duplicates.mjs` (123 lines). Pre-delete check confirmed `jest.setup.js` (root) was never wired into `jest.config.js`'s `setupFilesAfterEnv` — that points at the distinct, kept `tests/jest.setup.ts`. `npm run lint` stayed green after the ESLint-plugin removals, confirming the project's ESLint config never depended on them.
9. `docs: changelog and audit log` — this file + `CHANGELOG.md` `[Unreleased]` entries.

## Verification (every commit, both Jest and Vitest)

- `npm test` (Jest): 144 suites green throughout; 1822 → 1819 tests after the HoneypotField (3 tests) and DashboardPreview-guard (3 tests) describe blocks were removed, net of the 3 new guard-test assertions added in commit 1 (which flipped from RED to GREEN in commit 2).
- `npx vitest run`: 33 files / 183 tests green throughout (unchanged count — no `.tsx` suite was deleted).
- `npx tsc --noEmit`: clean after every commit, including after the two `@types/*` removals (dompurify, crypto-js) most likely to surface a masked type error.
- `npm run lint`: clean after every commit, including after the 9 ESLint-adjacent dev-tooling packages were removed in commit 8.
- `npx knip`: re-run after commits 4-8; none of the deleted files, barrels or dependencies remain in its report. Remaining `knip` findings (31 unused exported types, 27 duplicate exports, nested barrels, protected entry points it cannot trace statically) are explicitly out of scope for this change.
- Protected-entry-points diff check: passed at the end of PR-A and again at the end of PR-B.

## Review workload note

PR-A is ≈1,310 changed lines (excluding the lockfile), ≈3.3x the project's ~400-line reviewed-diff budget — but ≈1,255 of those lines are pure deletion of code already confirmed dead by `knip` + exploration #1193 + per-commit `rg` zero-reference checks, which carries materially lower review risk than new logic. Per the `sdd-tasks` Review Workload Forecast and the `ask-on-risk` delivery strategy, the owner approved a `size:exception` for PR-A on 2026-10-08. PR-B (≈256 lines) is within the normal review budget.
