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

## 2026-10-23T08:30Z — PR1 merged + bookkeeping (orchestrator)

- PR #151 merged into develop (0ced1e0). `20260309000003` recorded in `supabase_migrations.schema_migrations` via `INSERT ... ON CONFLICT DO NOTHING` (statements = local file content, `created_by` notes bookkeeping); its SQL was NOT re-run.
- Parity: 45 local files = 45 remote versions. Owner ran `supabase migration list` (all 45 rows local == remote) and `supabase db push --dry-run` → "Remote database is up to date".
- Also removed 6 stray, git-ignored Git Bash crash dumps (`bash.exe.stackdump`), one of which sat inside `supabase/migrations/`.

## 2026-10-23T08:27Z — PR2: cleanup migration applied live (orchestrator, Supabase MCP)

- Pre-checks: 0 objects depend on the 3 RPCs (`pg_depend`); `public.update_updated_at_column` is only used by trigger `update_app_settings_updated_at` (the `storage.objects` trigger uses `storage.update_updated_at_column`, a different function — the REVOKE is schema-qualified).
- Applied `schema_hygiene_drop_dead_rpcs` via MCP `apply_migration` → remote version `20261023082716`; local file created with the identical SQL.
- Post-checks: public functions = `delete_stale_documents, match_documents, match_documents_by_source, update_updated_at_column, upsert_document`; trigger fn ACL = `postgres, service_role`; `security_logs` INSERT policies = `admin_insert_security_logs, service_insert_security_logs`.
- Trigger smoke: `UPDATE app_settings SET id=id` inside a transaction → `updated_at` advanced (trigger fired), then `ROLLBACK` (value back to 2026-10-02). Live chatbot (`chat-with-rag` → `match_documents`) answered normally.
- Guard test extended (TDD red → green). Lint caught a vacuous regex in the "no later migration recreates a dropped RPC" check (single-escaped `\s` inside a template string); fixed with `String.raw` plus a self-test that the detector matches a real `CREATE FUNCTION`.

### Rollback (run as a NEW forward migration) — live definitions captured with `pg_get_functiondef` before the drop

```sql
-- Live definitions captured 2026-10-23 (pg_get_functiondef) BEFORE dropping.
-- Rollback for supabase-schema-hygiene: run as a new forward migration.
-- ACL at capture time for all three: postgres=X, service_role=X (no anon/authenticated/PUBLIC).

CREATE OR REPLACE FUNCTION public.batch_insert_document(documents_json text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  inserted_count INT := 0;
  doc_record JSONB;
  doc_array JSONB;
BEGIN
  doc_array := documents_json::jsonb;

  FOR doc_record IN SELECT * FROM jsonb_array_elements(doc_array)
  LOOP
    INSERT INTO public.documents (content, source, metadata, embedding)
    VALUES (
      doc_record->>'content',
      doc_record->>'source',
      COALESCE(doc_record->>'metadata', '{}')::jsonb,
      CASE
        WHEN doc_record->>'embedding' IS NOT NULL THEN (doc_record->>'embedding')::vector(768)
        ELSE NULL::vector(768)
      END
    );
    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_document(doc_content text, doc_embedding text, doc_source text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  INSERT INTO public.documents (content, embedding, source)
  VALUES (doc_content, doc_embedding::vector(768), doc_source);
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_document_with_embedding(doc_content text, doc_source text, doc_metadata jsonb DEFAULT '{}'::jsonb, doc_embedding text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();

  INSERT INTO public.documents (id, content, source, metadata, embedding)
  VALUES (
    new_id,
    doc_content,
    doc_source,
    doc_metadata,
    CASE
      WHEN doc_embedding IS NOT NULL THEN doc_embedding::vector(768)
      ELSE NULL::vector(768)
    END
  );

  RETURN new_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.batch_insert_document(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_document(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_document_with_embedding(text, text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.batch_insert_document(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_document(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.insert_document_with_embedding(text, text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon, authenticated;
CREATE POLICY service_role_insert_logs ON public.security_logs FOR INSERT TO service_role WITH CHECK (true);
```
