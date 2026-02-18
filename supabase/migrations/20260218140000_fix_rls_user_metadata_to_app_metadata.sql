-- Fix: Replace user_metadata with app_metadata in RLS policies
-- Security Fix: OWASP A01:2021 - Broken Access Control
-- Issue: user_metadata is editable by end users, app_metadata is only modifiable by server
-- Reference: https://supabase.com/docs/guides/auth/server-side-auth#using-app-metadata

-- Drop existing policy that uses user_metadata
DROP POLICY IF EXISTS "Admin full access to documents" ON public.documents;

-- Create new policy using app_metadata (secure - only modifiable by server admin)
CREATE POLICY "Admin full access to documents"
ON public.documents
FOR ALL
TO authenticated
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    ''
  ) IN ('admin', 'super_admin')
);

-- Also fix app_settings table if it has the same issue
-- (This will be applied if the table exists)

DO $$
BEGIN
  -- Check if app_settings table exists and has RLS policies
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'app_settings' 
    AND schemaname = 'public'
  ) THEN
    -- Drop old policy using user_metadata
    DROP POLICY IF EXISTS "Admin full access to app_settings" ON public.app_settings;
    
    -- Create new policy using app_metadata
    CREATE POLICY "Admin full access to app_settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (
      COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role')::text,
        ''
      ) IN ('admin', 'super_admin')
    );
  END IF;
END $$;

-- Note: To assign admin role, use Supabase Admin API (server-side only)
-- Example: supabase.auth.admin.updateUser(uid, { app_metadata: { role: 'admin' } })
-- Never assign roles from client-side code using user_metadata
