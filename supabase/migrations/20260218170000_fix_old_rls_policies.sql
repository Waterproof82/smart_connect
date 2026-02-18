-- Drop ALL policies on documents and recreate fresh
DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;
DROP POLICY IF EXISTS "admin_insert_documents" ON public.documents;
DROP POLICY IF EXISTS "admin_update_documents" ON public.documents;
DROP POLICY IF EXISTS "admin_delete_documents" ON public.documents;
DROP POLICY IF EXISTS "public_read_documents" ON public.documents;
DROP POLICY IF EXISTS "Anon read access for chatbot" ON public.documents;
DROP POLICY IF EXISTS "Service role full access" ON public.documents;
DROP POLICY IF EXISTS "admin_full_access_documents" ON public.documents;
DROP POLICY IF EXISTS "service_role_full_access_documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated read access" ON public.documents;

-- Recreate all policies from scratch

-- 1. Public read (for RAG chatbot)
CREATE POLICY "public_read_documents"
ON public.documents
FOR SELECT
TO public
USING (true);

-- 2. Authenticated read (for other logged users)
CREATE POLICY "authenticated_read_documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- 3. Admin full access (only admin@smartconnect.ai)
CREATE POLICY "admin_full_access_documents"
ON public.documents
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') = 'admin@smartconnect.ai')
WITH CHECK ((auth.jwt() ->> 'email') = 'admin@smartconnect.ai');

-- 4. Service role full access (for Edge Functions)
CREATE POLICY "service_role_full_access_documents"
ON public.documents
FOR ALL
TO service_role
USING (true);
