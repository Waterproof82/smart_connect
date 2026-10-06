# Audit: move pgvector out of the public schema

**Date:** 2026-10-06
**Trigger:** Supabase security linter — `extension_in_public` (vector) and `auth_leaked_password_protection`.

## Actions

- 2026-10-06 — Inspected `public` functions: 5 RAG functions use `vector`/`<=>` and pin `search_path=public`. Moving the extension alone would break them.
- 2026-10-06 — Created `supabase/migrations/20261006100000_move_vector_extension_out_of_public.sql`: `ALTER EXTENSION vector SET SCHEMA extensions` plus `search_path = public, extensions` on `match_documents`, `match_documents_by_source`, `insert_document`, `insert_document_with_embedding`, `batch_insert_document`.
- 2026-10-06 — Migration applied manually in production by the owner; history marked with `supabase migration repair --status applied 20261006100000`.
- 2026-10-06 — Validated: security advisor no longer reports `extension_in_public`; `vector` is in `extensions`; `match_documents(..., 0.4, 3)` returns 3 rows.

## Accepted risk

- `auth_leaked_password_protection`: requires the Supabase Pro plan. Not available on the current plan; accepted by the owner.
