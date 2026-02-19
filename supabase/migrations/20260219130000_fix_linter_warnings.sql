-- Fix Supabase Linter Warnings:
-- 1. auth_rls_initplan: Use (SELECT auth.jwt()) instead of auth.jwt()
-- 2. multiple_permissive_policies: Separate SELECT from INSERT/UPDATE/DELETE policies

BEGIN;

-- ============================================
-- DOCUMENTS TABLE
-- ============================================

-- Drop existing documents policies
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'documents' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol) || ' ON public.documents';
  END LOOP;
END $$;

-- Policy 1: Public SELECT (for RAG chatbot)
CREATE POLICY "public_read"
ON public.documents
FOR SELECT
TO public
USING (true);

-- Policy 2: Authenticated users can read
CREATE POLICY "authenticated_read"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Admin SELECT only (separated from INSERT/UPDATE/DELETE to avoid multiple permissive policies)
CREATE POLICY "admin_select"
ON public.documents
FOR SELECT
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

-- Policy 4: Admin INSERT/UPDATE/DELETE (separate from SELECT)
CREATE POLICY "admin_insert_update_delete"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "admin_update"
ON public.documents
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai')
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "admin_delete"
ON public.documents
FOR DELETE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

-- Policy 5: Service role full access
CREATE POLICY "service_role_full_access"
ON public.documents
FOR ALL
TO service_role
USING (true);

-- ============================================
-- APP_SETTINGS TABLE
-- ============================================

-- Drop existing app_settings policies
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'app_settings' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol) || ' ON public.app_settings';
  END LOOP;
END $$;

-- Policy 1: Admin full access (with SELECT fix)
CREATE POLICY "Admin full access to app_settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "Admin full access to app_settings_insert"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "Admin full access to app_settings_update"
ON public.app_settings
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai')
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "Admin full access to app_settings_delete"
ON public.app_settings
FOR DELETE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

-- Policy 2: Anonymous read-only (for landing page contact info)
CREATE POLICY "Anon read access to app_settings"
ON public.app_settings
FOR SELECT
TO anon
USING (true);

-- Policy 3: Service role full access
CREATE POLICY "Service role full access to app_settings"
ON public.app_settings
FOR ALL
TO service_role
USING (true);

-- ============================================
-- SECURITY_LOGS TABLE
-- ============================================

-- Drop existing security_logs policies
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'security_logs' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol) || ' ON public.security_logs';
  END LOOP;
END $$;

-- Policy 1: Admin read only (with SELECT fix)
CREATE POLICY "only_admins_read_logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

-- Policy 2: Service role INSERT
CREATE POLICY "service_role_insert_logs"
ON public.security_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 3: Service role DELETE
CREATE POLICY "service_role_delete_logs"
ON public.security_logs
FOR DELETE
TO service_role
USING (true);

-- Policy 4: Service role UPDATE
CREATE POLICY "service_role_update_logs"
ON public.security_logs
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 5: Service role SELECT (for viewing logs)
CREATE POLICY "service_role_read_logs"
ON public.security_logs
FOR SELECT
TO service_role
USING (true);

COMMIT;
