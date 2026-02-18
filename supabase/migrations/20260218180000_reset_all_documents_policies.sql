-- Force reset all RLS policies on documents table
-- This migration completely replaces all existing policies

BEGIN;

-- Drop every single policy on documents
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'documents' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol) || ' ON public.documents';
  END LOOP;
END
$$;

-- Create fresh policies

-- 1. Public SELECT (for RAG chatbot)
CREATE POLICY "public_read"
ON public.documents
FOR SELECT
TO public
USING (true);

-- 2. Authenticated users can read
CREATE POLICY "authenticated_read"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- 3. Only admin@smartconnect.ai can INSERT/UPDATE/DELETE
CREATE POLICY "admin_full_access"
ON public.documents
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') = 'admin@smartconnect.ai')
WITH CHECK ((auth.jwt() ->> 'email') = 'admin@smartconnect.ai');

-- 4. Service role can do everything
CREATE POLICY "service_role_full_access"
ON public.documents
FOR ALL
TO service_role
USING (true);

COMMIT;
