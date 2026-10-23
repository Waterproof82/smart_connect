
-- Migration: explicit_grants_and_revoke_defaults
-- Reason: Supabase breaking change (2026-10-30) — tables in public schema
-- will no longer receive automatic Data API grants. This migration:
--   1. Explicitly declares the grants we WANT (idempotent on existing tables)
--   2. Revokes future auto-grants so we opt in early and avoid surprises
-- Ref: https://github.com/orgs/supabase/discussions/45329

-- ─── 1. documents ────────────────────────────────────────────────────────────
-- anon: read-only (chatbot RAG queries via PostgREST)
GRANT SELECT ON public.documents TO anon;

-- authenticated: full CRUD (admin dashboard, RLS restricts who is admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;

-- service_role: full access (Edge Functions bypass RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO service_role;

-- ─── 2. app_settings ─────────────────────────────────────────────────────────
-- anon: read-only (landing page fetches webhook URL & config)
GRANT SELECT ON public.app_settings TO anon;

-- authenticated: full CRUD (admin can change settings, RLS enforces admin check)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;

-- service_role: full access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO service_role;

-- ─── 3. security_logs ────────────────────────────────────────────────────────
-- anon: NO access (security audit table — never expose to public)
REVOKE ALL ON public.security_logs FROM anon;

-- authenticated: INSERT + SELECT only (log writes; RLS restricts SELECT to admins)
GRANT SELECT, INSERT ON public.security_logs TO authenticated;
REVOKE UPDATE, DELETE ON public.security_logs FROM authenticated;

-- service_role: full access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_logs TO service_role;

-- ─── 4. Opt in to new Supabase behavior ──────────────────────────────────────
-- Revoke the legacy default privileges that auto-granted on table creation.
-- Going forward, every new table MUST have explicit GRANTs in its migration.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM authenticated;
