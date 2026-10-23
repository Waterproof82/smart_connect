-- rag-knowledge-base-refresh follow-up: the pre-refresh snapshots taken on
-- 2026-10-07/08 are no longer needed (owner validated the new KB: 113 hashed
-- rows live, eval green). They held the legacy rows with outdated prices.
DROP TABLE IF EXISTS kb_backup.documents_20261007;
DROP TABLE IF EXISTS kb_backup.documents_20261008;
DROP SCHEMA IF EXISTS kb_backup;
