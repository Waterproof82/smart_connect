# Audit: fix failing CI after develop -> main merge

- **Timestamp:** 2026-10-01
- **Action:** Diagnosed CI run 289 on `main` (merge commit 62129bc). The "Run tests" step failed in `tests/unit/App.home.structure.test.ts` and `tests/unit/App.homeNfcFree.structure.test.ts`.
- **Root cause:** Commit 61b82fa made `App.tsx` lazy-load the TPV section (`<LazyTpvModulesSection />`); the tests still searched for the literal `<TpvModulesSection`.
- **Fix:** Updated both tests to search for `<LazyTpvModulesSection`. No application code changed.
- **Verification:** Both suites pass locally (14 tests).
