# Post-migration cleanup review

**Timestamp:** 2026-10-23 19:30 WEST (18:30 UTC)
**Scope:** code, tests and live database after the schema-hygiene migrations `20261023082716` (drop dead RPCs), `20261023093831` (drop `kb_backup`) and `20261023095144` (revoke PUBLIC on `match_documents*`).
**Type:** audit + cleanup

## Actions
- Ran `npx knip`: no findings.
- Searched code, tests, scripts and Edge Functions for the dropped objects (`insert_document*`, `batch_insert_document`, `kb_backup`, `service_role_insert_logs`, `event_type`).
- Queried the live database (read-only): `security_logs` columns, public functions, triggers, remaining schemas/tables, latest `schema_migrations` version.
- Checked Supabase security and performance advisors.
- Removed `tests/integration/security-logger.test.js`.

## Findings
| Item | Evidence | Decision |
|---|---|---|
| `tests/integration/security-logger.test.js` | Not run by any runner (Jest `testMatch` is `*.test.ts`), imported by nothing, last touched 2026-02. Inserts `event_type`, `ip_address`, `user_agent`, `metadata` into `security_logs`, whose live columns are `type`, `client_ip`, `details`, `severity`, `session_id`, `user_id`, `user_role`, `timestamp`, `created_at`, `id`. Run with a service key, it would write test rows to production. | **Removed** |
| Dropped RPCs and `kb_backup` | Absent from `pg_proc` / `pg_namespace`; latest applied version `20261023095144` equals the latest local file. | PASS |
| Live public functions | `match_documents`, `match_documents_by_source`, `upsert_document`, `delete_stale_documents`, `update_updated_at_column` (used by the `app_settings` trigger). | Keep (all used) |
| Index `documents_embedding_hnsw_idx` | Performance advisor: "unused". The knowledge base is small, so the planner prefers a sequential scan. It is the chatbot's vector index. | Keep |
| `tests/unit/kbSchemaMigration.structure.test.ts` | Mentions `kb_backup`, but asserts the content of a historical migration file, which is still correct. | Keep |
| `src/core/domain/usecases/NoOpSecurityLogger.ts` | Misleading name, but it is the live `SecurityLogger` factory used by `rateLimiter.ts`. | Keep (a rename would be a refactor, not cleanup) |
| Security advisor: leaked password protection | Requires the Pro plan; accepted while on Free. | Keep as known warning |
| References to dropped objects in `CHANGELOG.md`, `docs/`, `openspec/`, `migrationHistory.structure.test.ts` | Historical records; the guard test asserts absence. | Keep |

## Validation
- `npx knip`: pass (no findings).
- External: Supabase advisors read on 2026-10-23.

## Follow-ups
- None. Note for future reviews: knip ignores `supabase/functions/**` and does not flag stray `.js` files under `tests/`; check runner globs and the live DB before calling anything dead.
