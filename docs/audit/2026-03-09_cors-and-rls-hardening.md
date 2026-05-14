# Audit Log: CORS Cleanup & RLS Hardening

**Date:** 2026-03-09
**Type:** Security Hardening
**Status:** Applied

---

## Changes Applied

### 1. CORS Origin Cleanup (Edge Functions)

**Affected:** `chat-with-rag`, `gemini-generate`, `gemini-embedding`, `test-log`

- Removed `https://smartconnect.ai` (unused placeholder domain)
- Removed `https://www.smartconnect.ai` (unused placeholder domain)
- Removed `https://smart-connect-landing.vercel.app` (old Vercel project name)
- Added `https://digitalizatenerife.es` (current production domain)
- All 3 functions redeployed via Supabase CLI (test-log later deleted as dead code)

**Final ALLOWED_ORIGINS:**
```
https://digitalizatenerife.es
http://localhost:5173
http://localhost:3000
```

### 2. insert_document: SECURITY DEFINER → INVOKER

- `insert_document` function was using `SECURITY DEFINER`, bypassing RLS
- Changed to `SECURITY INVOKER` so RLS policies are enforced
- Other write functions (`insert_document_with_embedding`, `batch_insert_document`) already used INVOKER

### 3. Revoked Excessive Grants from `anon` Role

| Table | Before | After |
|---|---|---|
| `documents` | ALL (INSERT, UPDATE, DELETE, TRUNCATE, etc.) | SELECT only |
| `app_settings` | ALL | SELECT only |
| `security_logs` | ALL | No access |

Defense in depth: even though RLS blocked unauthorized operations, table-level grants now also restrict the `anon` role.

### 4. RLS Policy Performance Fix

- `admin_insert_security_logs` policy was using `auth.jwt()` directly
- Changed to `(SELECT auth.jwt())` subselect to avoid per-row re-evaluation
- Supabase performance advisor confirmed fix (warning cleared)

### 5. Orphan Function Cleanup

- Dropped `update_embedding_cache_updated_at()` function
- Referenced non-existent `embedding_cache` table (cache is in-memory in Edge Functions)

## Documentation Updated

- `ARQUITECTURA.md`: Updated `SECURITY DEFINER` → `SECURITY INVOKER` in RAG flow diagram
- `docs/SUPABASE_SECURITY.md`: Updated CORS config to use `smart-connect-olive.vercel.app`
- `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`: Replaced wildcard CORS example with origin whitelist
- `CHANGELOG.md`: Added all changes under `[Unreleased]`

## Supabase Advisor Status Post-Fix

**Security:** All warnings are known/expected (pgvector in public, intentional anonymous SELECT, leaked password protection pending manual action)
**Performance:** `auth_rls_initplan` warning cleared. Only remaining: `documents_embedding_idx` unused (expected with 6 rows)
