# Audit — Supabase schema hygiene (PR1: migration history drift repair)

**Timestamp:** 2026-10-23
**Trigger:** SDD change `supabase-schema-hygiene` — local `supabase/migrations` had drifted from the remote `schema_migrations` table (wrong filenames for applied migrations, missing files for other applied migrations, one dead never-applied file), so `supabase db push` was not a safe no-op.

## Scope

PR1 is file-only: it does not touch the live database. It repairs the local migrations directory so its version set matches remote exactly, and adds a regression guard test. PR2 (separate branch, after PR1 merges) drops the dead RPCs and tightens grants/policies live — out of scope here.

## Drift found (verified against live `schema_migrations` by the orchestrator, 2026-10-23)

| # | Kind | Local (before) | Remote / local (after) | Notes |
|---|------|-----------------|-------------------------|-------|
| 1 | Rename | `20260309000000_fix_function_grants_security.sql` | `20260309073550_fix_function_grants_security.sql` | Same SQL, placeholder timestamp |
| 2 | Rename | `20260309000001_cleanup_unused_indexes.sql` | `20260309073628_cleanup_unused_indexes.sql` | Same SQL, placeholder timestamp |
| 3 | Rename | `20260309100000_fix_match_documents_by_source_ilike.sql` | `20260309140223_fix_match_documents_by_source_ilike.sql` | Same SQL, placeholder timestamp |
| 4 | Rename | `20260810120000_add_n8n_enabled_to_app_settings.sql` | `20260810184815_add_n8n_enabled_to_app_settings.sql` | Same SQL (verified by normalized-SQL md5), placeholder timestamp |
| 5 | Rename | `20260810130000_fix_auth_rls_initplan_performance.sql` | `20260810194044_fix_auth_rls_initplan_performance.sql` | Same SQL (verified by normalized-SQL md5), placeholder timestamp |
| 6 | Rename | `20260810131500_harden_admin_policies_against_anonymous_signin.sql` | `20260810195508_harden_admin_policies_against_anonymous_signin.sql` | Same SQL (verified by normalized-SQL md5), placeholder timestamp |
| 7 | Copy (new local file) | — | `20260309121822_security_hardening_grants_rls_functions.sql` | Applied remotely, no local file existed; content copied verbatim from live `schema_migrations.statements` |
| 8 | Copy (new local file) | — | `20260516163904_update_admin_email_to_info.sql` | Same as above |
| 9 | Copy (new local file) | — | `20260516163914_update_admin_email_security_logs.sql` | Same as above |
| 10 | Copy (new local file) | — | `20260516163925_update_admin_email_app_settings.sql` | Same as above |
| 11 | Copy (new local file) | — | `20260527184851_explicit_grants_and_revoke_defaults.sql` | Same as above |
| 12 | Delete | `20260510132727_add_event_type_to_security_logs.sql` | — | Never applied remotely; the `event_type` column it adds is used nowhere in the codebase; deleting it rewrites no applied history |

**Not touched / kept as-is:** `20260309000003_fix_security_logs_insert_policy.sql`. Its effect (the `admin_insert_security_logs` / `service_insert_security_logs` policies) is already live in production, but the version is not yet recorded in `supabase_migrations.schema_migrations`. The orchestrator records it with a bookkeeping-only `INSERT ... ON CONFLICT (version) DO NOTHING` immediately after this PR merges (no SQL re-execution, no policy changes) — see design doc §(b). This file is not part of the PR1 diff.

## Result

Local `supabase/migrations` now has 45 files whose version set equals: the 44 versions currently in remote `schema_migrations` + `20260309000003` (recorded as bookkeeping right after merge, per above). After that bookkeeping step, `supabase db push --dry-run` is expected to report nothing pending (owner to confirm — Phase 4 of the tasks artifact).

## Guard test

Added `tests/unit/migrationHistory.structure.test.ts` (Jest), following the existing pattern in `tests/unit/kbSchemaMigration.structure.test.ts` (read `supabase/migrations` from disk, assert on structure — no live DB in CI):

1. Every filename matches `/^\d{14}_[a-z0-9_]+\.sql$/`.
2. No duplicate 14-digit version prefixes.
3. `20260510132727` (the deleted obsolete migration) is absent, and no file introduces an `event_type` column.
4. The 6 old placeholder-timestamp versions (`20260309000000`, `20260309000001`, `20260309100000`, `20260810120000`, `20260810130000`, `20260810131500`) are absent.
5. A checked-in `APPLIED_VERSIONS` snapshot (the 44 remote versions as of 2026-10-23, plus `20260309000003`) is a subset of the local version set — so future migrations don't break the guard, but drift (missing/renamed files) does.

RED confirmed before the file changes (4/6 assertions failed for the expected reasons: old versions present, remote-only versions missing). GREEN confirmed after.

## Verification

- `npx jest tests/unit/migrationHistory.structure.test.ts`: RED (pre-change) → GREEN (post-change).
- `npm test` (Jest): 144 suites / 1849 tests green.
- `npx vitest run`: 33 files / 187 tests green.
- `npx tsc --noEmit`: clean.
- `npm run lint`: clean (0 warnings, `--max-warnings 0`).
- `rg` for the 6 renamed-away and 1 deleted version strings outside `supabase/migrations/`: only historical references in `CHANGELOG.md` and prior audit/ADR docs (expected — those are historical records, not live dependencies) and the new guard test itself (intentional, asserts absence).

## Branch / commits

`fix/migration-history-drift` (base `develop`), file-only, no live DB access, not pushed.

## Out of scope (PR2, separate branch, after this merges)

Dropping `batch_insert_document`, `insert_document`, `insert_document_with_embedding`; revoking `update_updated_at_column()` EXECUTE from `PUBLIC`/`anon`/`authenticated`; dropping the redundant `service_role_insert_logs` policy on `security_logs`. Requires a live MCP `apply_migration` call before the migration file can be named with its real version — see design doc §(d)-(f) and tasks artifact PR2.
