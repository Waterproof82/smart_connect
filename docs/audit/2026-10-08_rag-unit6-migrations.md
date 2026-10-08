# Audit: RAG Knowledge-Base Refresh — Unit 6 (Schema Migrations)

**Date**: 2026-10-08
**Change**: `rag-knowledge-base-refresh` (SDD), Unit 6 of 8
**Branch**: `feat/rag-unit6-kb-migrations` (off `develop`, parallel to Units 1-5)
**Author**: sdd-apply (strict TDD mode)

## Action

Added two idempotent SQL migrations under `supabase/migrations/` that prepare
the `documents` table for the Unit 7 ingestion orchestrator (upsert-then-delete-stale
flow, hash-based idempotency). No migration was applied to any live database —
this change touches only the SQL files and their accompanying test suite.

### Files

- `supabase/migrations/20261008000000_snapshot_documents_before_hash_refresh.sql` (new)
- `supabase/migrations/20261008000001_kb_content_hash_hnsw_upsert_rpcs.sql` (new)
- `tests/unit/kbSchemaMigration.structure.test.ts` (new, 16 tests — structural
  assertions against migration SQL text; no live DB available in this test
  environment, so these are the TDD RED/GREEN gate for the migration content)
- `CHANGELOG.md` (Unreleased/Added entry)
- `docs/audit/2026-10-08_rag-unit6-migrations.md` (this file)

## Why

Design D14 (`sdd/rag-knowledge-base-refresh/design`): the Unit 7 ingestion
script needs to upsert chunks idempotently (skip re-embedding unchanged
content) and delete rows that disappeared from the source site/FAQ/curated
content — without ever risking emptying the table on a bad run. That requires:
a `content_hash` column + unique index, service-role-only RPCs that enforce
the fail-closed invariant (`delete_stale_documents` raises on an empty
`keep_hashes` array), and a rollback snapshot taken before the schema changes.

HNSW replaces the existing `ivfflat` index per D14 (better recall/query
performance; no `lists` tuning required at this row count). `metadata` is
added to `match_documents`/`match_documents_by_source`'s return columns
because `_shared/prompt.ts`'s `buildSystemInstruction` already reads
`doc.metadata?.url` optionally (added in Unit 2) — it has had no data to read
until now.

## Production facts verified before writing these migrations

- `documents` currently has 3 rows (manual cleanup 2026-10-07), columns:
  `id uuid, content text, embedding vector(768), metadata jsonb, source varchar,
  created_at timestamptz, updated_at timestamptz, category text`. `updated_at`
  already exists (added by `20260204100000_add_category_to_documents.sql`) —
  Unit 6 does **not** re-add it, only `content_hash`.
- A full backup of the original 7 rows already exists at
  `kb_backup.documents_20261007` (privileges already revoked from
  `public`/`anon`/`authenticated`). The new snapshot migration creates a
  **separate**, independently timestamped table (`documents_20261008`) and
  never creates, drops, or references `documents_20261007` in any executable
  statement (only in a human-readable code comment, verified by test).
- `vector` lives in schema `extensions` (`20261006100000_move_vector_extension_out_of_public.sql`).
  Every new/changed function in this unit declares
  `SET search_path = public, extensions`; the HNSW index uses
  `extensions.vector_cosine_ops`.
- `chat-with-rag/index.ts` calls `match_documents`/`match_documents_by_source`
  via `supabase.rpc(...)` and destructures the result rows by field name
  (`searchResults`, passed into `buildSystemInstruction({ documents })`,
  which reads `.source`, `.content`, `.metadata?.url` — all by name). Adding
  `metadata` as a new returned column is additive and does not break this
  caller.
- RLS: `documents` already has a `"Service role full access" FOR ALL`
  policy (`20260204120000_enable_documents_rls.sql`) that bypasses RLS for
  `service_role`. Because `upsert_document`/`delete_stale_documents` are
  grantable to `service_role` only, `SECURITY INVOKER` is safe (no privilege
  escalation risk) and matches D14 exactly.

## TDD evidence

1. **RED**: `tests/unit/kbSchemaMigration.structure.test.ts` written first,
   referencing migration files that did not yet exist. Confirmed failure:
   `npx jest tests/unit/kbSchemaMigration.structure.test.ts` → 16/16 failed
   (`No migration file matches ...`).
2. **GREEN**: both migrations written; re-ran the same test file → 16/16
   passed. Two test-authoring bugs were caught and fixed during GREEN (not
   migration bugs): a regex matched the explanatory code comment mentioning
   `documents_20261007` as if it were an executable statement, and a
   single-space regex didn't tolerate the newline between `AS` and `SELECT`
   in the snapshot's `CREATE TABLE ... AS\nSELECT` statement. Both fixed in
   the test file, not by changing the SQL.
3. **Full suite**: `npx jest` → 127 passed / 3 skipped suites (pre-existing,
   network-gated — unrelated to this unit), 1544 passed / 66 skipped tests,
   **0 failed**.
4. `npx tsc --noEmit` → clean (no output).
5. `npm run lint` → clean (0 errors, 0 warnings).

## Exact apply order (for the owner, via Supabase CLI/MCP — NOT run by this agent)

```bash
supabase db push   # or apply individually in this exact order:
# 1. 20261008000000_snapshot_documents_before_hash_refresh.sql
# 2. 20261008000001_kb_content_hash_hnsw_upsert_rpcs.sql
```

Both files are idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE` /
`DROP ... IF EXISTS`), so re-running after a partial failure is safe — the
snapshot table is created once and never overwritten, and `documents_20261007`
is never touched by either migration.

After applying, verify:

```sql
-- snapshot exists and is isolated
select count(*) from kb_backup.documents_20261008;
select has_table_privilege('anon', 'kb_backup.documents_20261008', 'SELECT'); -- expect false

-- new index is HNSW, old ivfflat is gone
select indexdef from pg_indexes where tablename = 'documents' and indexname like '%embedding%';

-- RPCs are service_role-only
select has_function_privilege('anon', 'upsert_document(text,text,jsonb,text,text)', 'EXECUTE');          -- expect false
select has_function_privilege('service_role', 'upsert_document(text,text,jsonb,text,text)', 'EXECUTE');   -- expect true
```

## Rollback

If the Unit 7 ingestion rollout needs to be reverted after these migrations
are applied (and possibly after ingestion has already run):

```sql
-- 1. Restore documents to the pre-Unit-6 state from the snapshot
BEGIN;
TRUNCATE public.documents;
INSERT INTO public.documents (id, content, embedding, metadata, source, created_at, updated_at, category)
SELECT id, content, embedding, metadata, source, created_at, updated_at, category
FROM kb_backup.documents_20261008;
COMMIT;

-- 2. Recreate the ivfflat index (undo the HNSW swap)
DROP INDEX IF EXISTS public.documents_embedding_hnsw_idx;
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON public.documents
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 100);

-- 3. Drop the new RPCs and the content_hash column/index (optional — leaving
--    them in place is harmless if ingestion stays off; only do this for a
--    full revert)
DROP FUNCTION IF EXISTS public.upsert_document(TEXT, TEXT, JSONB, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.delete_stale_documents(TEXT[]) CASCADE;
DROP INDEX IF EXISTS public.documents_content_hash_key;
ALTER TABLE public.documents DROP COLUMN IF EXISTS content_hash;

-- 4. match_documents*/metadata column is backward compatible; no rollback
--    needed for callers. If reverting anyway, redeploy the pre-Unit-6
--    function bodies from 20260219120000_final_function_fix.sql (match_documents)
--    and 20260309100000_fix_match_documents_by_source_ilike.sql
--    (match_documents_by_source).
```

Also per design D15/rollout step 4: set `EMBEDDING_MODE=legacy` (Unit 3) if
Unit 7's `v2` embedding re-ingestion was already flipped on.

## Owner action required

None for this unit alone — no migration is applied, no deploy happens. The
owner applies these two migrations manually (apply order above) as part of
the combined Unit 6+7 rollout once Unit 7 (ingestion orchestrator) lands.

## Deviations from design

None. Implementation follows D14 exactly, including the two intentional
simplifications noted inline in the migration SQL: a plain (non-partial)
unique index on `content_hash` is sufficient for "NULLs allowed" (standard
btree semantics), and `updated_at` was already present on `documents` from
an earlier migration, so Unit 6 only adds `content_hash`.
