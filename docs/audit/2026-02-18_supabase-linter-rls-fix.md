# Supabase Linter RLS Fix - 2026-02-18

**Date:** 2026-02-18  
**Task:** Fix Supabase Database Linter warnings related to Row Level Security (RLS) policies  
**Status:** COMPLETED

## Problem

The Supabase Database Linter reported two types of warnings:

1. **auth_rls_initplan** - Calls to `auth.jwt()` being re-evaluated for each row in RLS policies
2. **multiple_permissive_policies** - Multiple permissive policies for the same role/action combination

### Affected Tables

| Table | Warning Type | Policies Affected |
|-------|-------------|-------------------|
| `app_settings` | auth_rls_initplan | Admin full access |
| `security_logs` | auth_rls_initplan | only_admins_read_logs, service_role_insert_logs, service_role_delete_logs |
| `documents` | multiple_permissive_policies | admin_full_access, authenticated_read, public_read |

## Solution

### 1. Fixed auth_rls_initplan

Changed all occurrences of `auth.jwt()` to `(SELECT auth.jwt())` in RLS policies:

```sql
-- Before
USING ((auth.jwt() ->> 'email') = 'admin@smartconnect.ai')

-- After
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai')
```

This prevents re-evaluation of the JWT function for each row.

### 2. Fixed multiple_permissive_policies

- **documents table:** Unified SELECT policies into single policy for public role
- **documents table:** Separated INSERT/UPDATE/DELETE into individual policies (not using FOR ALL)
- **security_logs table:** Removed duplicate SELECT policies

### Migrations Created

| File | Description |
|------|-------------|
| `20260219130000_fix_linter_warnings.sql` | Main fix for auth_rls_initplan and multiple policies |
| `20260219140000_fix_duplicate_policies.sql` | Remove authenticated_read duplicate |
| `20260219150000_unify_select_policies.sql` | Single SELECT policy for documents |
| `20260219160000_remove_duplicate_admin_policies.sql` | Remove old duplicate admin policies |

## Result

All WARN-level linter errors resolved. Only INFO-level warnings remain for unused indexes, which are intentionally kept for future use (RAG vector search, security log filtering).

## References

- [Supabase RLS Performance Docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Supabase Multiple Policies Docs](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)
