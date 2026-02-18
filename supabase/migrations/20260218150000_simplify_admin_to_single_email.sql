-- Security Fix: Verify specific admin email instead of roles
-- Admin: admin@smartconnect.ai only (verified email in JWT)
-- Anonymous: read-only access for chatbot RAG

-- ============================================
-- DOCUMENTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;
DROP POLICY IF EXISTS "Anon read access for chatbot" ON public.documents;
DROP POLICY IF EXISTS "Service role full access" ON public.documents;

-- Policy 1: Admin full access (specific email only)
-- Only admin@smartconnect.ai can INSERT/UPDATE/DELETE
CREATE POLICY "Admin full access to documents"
ON public.documents
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
);

-- Policy 2: Anonymous read-only (for chatbot RAG)
CREATE POLICY "Anon read access for chatbot"
ON public.documents
FOR SELECT
TO anon
USING (true);

-- Policy 3: Authenticated read-only (optional - for other authenticated users)
CREATE POLICY "Authenticated read access"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Policy 4: Service role full access (for Edge Functions)
CREATE POLICY "Service role full access documents"
ON public.documents
FOR ALL
TO service_role
USING (true);

-- ============================================
-- APP_SETTINGS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anon read access to app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Service role full access to app_settings" ON public.app_settings;

-- Policy 1: Admin full access (specific email only)
CREATE POLICY "Admin full access to app_settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
);

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
-- EMBEDDING_CACHE TABLE (if exists)
-- ============================================

DO $$
BEGIN
  -- Check if embedding_cache table exists
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'embedding_cache' 
    AND schemaname = 'public'
  ) THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Admin full access to embedding_cache" ON public.embedding_cache;
    DROP POLICY IF EXISTS "Anon read access to embedding_cache" ON public.embedding_cache;
    DROP POLICY IF EXISTS "Service role full access to embedding_cache" ON public.embedding_cache;

    -- Policy 1: Admin full access (specific email only)
    CREATE POLICY "Admin full access to embedding_cache"
    ON public.embedding_cache
    FOR ALL
    TO authenticated
    USING (
      (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
    )
    WITH CHECK (
      (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
    );

    -- Policy 2: Anonymous read/write (for caching - chatbot uses cache)
    CREATE POLICY "Anon full access to embedding_cache"
    ON public.embedding_cache
    FOR ALL
    TO anon
    USING (true);

    -- Policy 3: Service role full access
    CREATE POLICY "Service role full access to embedding_cache"
    ON public.embedding_cache
    FOR ALL
    TO service_role
    USING (true);
  END IF;
END $$;

-- ============================================
-- SECURITY_LOGS TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admins read logs" ON public.security_logs;
DROP POLICY IF EXISTS "Service role delete logs" ON public.security_logs;
DROP POLICY IF EXISTS "service_role_update_logs" ON public.security_logs;

-- Policy 1: Admin read only (specific email)
CREATE POLICY "Only admins read logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
);

-- Policy 2: Service role full access
CREATE POLICY "Service role full access to security_logs"
ON public.security_logs
FOR ALL
TO service_role
USING (true);

-- Comments
COMMENT ON POLICY "Admin full access to documents" ON public.documents 
IS 'Only admin@smartconnect.ai can INSERT/UPDATE/DELETE. SELECT is public for RAG chatbot.';

COMMENT ON POLICY "Admin full access to app_settings" ON public.app_settings 
IS 'Only admin@smartconnect.ai can modify settings. SELECT is public for landing page.';

COMMENT ON POLICY "Only admins read logs" ON public.security_logs 
IS 'Only admin@smartconnect.ai can read security logs.';
