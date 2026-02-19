-- Fix: Unify SELECT policies to avoid multiple permissive policies
-- All authenticated users and anon can SELECT

BEGIN;

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "public_read" ON public.documents;
DROP POLICY IF EXISTS "admin_select" ON public.documents;

-- Single permissive SELECT policy for all users
CREATE POLICY "documents_select"
ON public.documents
FOR SELECT
TO public
USING (true);

-- Admin only for INSERT/UPDATE/DELETE
CREATE POLICY "documents_admin_insert"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "documents_admin_update"
ON public.documents
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai')
WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

CREATE POLICY "documents_admin_delete"
ON public.documents
FOR DELETE
TO authenticated
USING ((SELECT auth.jwt()) ->> 'email' = 'admin@smartconnect.ai');

-- Service role full access (already exists, skip)
-- CREATE POLICY "service_role_full_access"
-- ON public.documents
-- FOR ALL
-- TO service_role
-- USING (true);

COMMIT;
