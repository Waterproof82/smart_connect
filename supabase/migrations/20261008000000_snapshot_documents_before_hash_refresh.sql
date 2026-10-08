-- Unit 6 (rag-knowledge-base-refresh, design D14): snapshot `documents`
-- before introducing content_hash/HNSW/upsert RPCs, in case the hash
-- backfill or RPC rollout needs a rollback point.
--
-- NOTE: a manual cleanup on 2026-10-07 already reduced `documents` from 7 to
-- 3 rows, and a full backup of the original 7 rows already exists at
-- `kb_backup.documents_20261007` (privileges already revoked). This
-- migration must NOT touch that table — it creates a NEW, independently
-- timestamped snapshot of the CURRENT state, so it is safe to re-run this
-- migration file (or re-apply it after a partial failure) without ever
-- overwriting an earlier snapshot.

CREATE SCHEMA IF NOT EXISTS kb_backup;

REVOKE ALL ON SCHEMA kb_backup FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS kb_backup.documents_20261008 AS
SELECT * FROM public.documents;

REVOKE ALL ON kb_backup.documents_20261008 FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE kb_backup.documents_20261008 IS
  'Snapshot of public.documents taken 2026-10-08 before Unit 6 (content_hash, HNSW index, upsert_document/delete_stale_documents RPCs). Rollback source if the ingestion refresh needs to be reverted. Not the same snapshot as kb_backup.documents_20261007 (pre-cleanup, 7 rows) — do not drop either.';
