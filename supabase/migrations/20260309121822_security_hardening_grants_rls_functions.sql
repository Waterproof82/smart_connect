
-- ============================================================
-- 1. FIX: Change insert_document from SECURITY DEFINER to INVOKER
-- ============================================================
ALTER FUNCTION public.insert_document SECURITY INVOKER;

-- ============================================================
-- 2. FIX: Revoke excessive grants from anon role
-- ============================================================

-- documents: anon only needs SELECT (for chatbot RAG)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.documents FROM anon;

-- app_settings: anon only needs SELECT (for landing page)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.app_settings FROM anon;

-- security_logs: anon should have NO access at all
REVOKE ALL ON public.security_logs FROM anon;

-- ============================================================
-- 3. FIX: Optimize admin_insert_security_logs policy (subselect)
-- ============================================================
DROP POLICY IF EXISTS admin_insert_security_logs ON public.security_logs;
CREATE POLICY admin_insert_security_logs ON public.security_logs
  FOR INSERT TO authenticated
  WITH CHECK (((SELECT auth.jwt()) ->> 'email'::text) = 'admin@smartconnect.ai'::text);

-- ============================================================
-- 4. CLEANUP: Remove orphan function (embedding_cache table doesn't exist)
-- ============================================================
DROP FUNCTION IF EXISTS public.update_embedding_cache_updated_at();
