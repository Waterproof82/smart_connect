-- Defense-in-depth for Supabase lint 0012 (auth_allow_anonymous_sign_ins).
-- These "authenticated"-scoped admin policies already require an email match
-- that an anonymous sign-in session (no email claim) can never satisfy, so
-- this does not close an active hole — it makes that guarantee explicit and
-- silences the linter. `IS NOT TRUE` is null-safe: a normal admin session
-- with no `is_anonymous` claim at all still passes.
-- Anon-role / public read policies (landing page, chatbot) are untouched.

-- documents
ALTER POLICY documents_admin_delete ON public.documents
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY documents_admin_insert ON public.documents
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY documents_admin_update ON public.documents
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  )
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

-- security_logs
ALTER POLICY admin_insert_security_logs ON public.security_logs
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY only_admins_read_logs ON public.security_logs
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

-- app_settings
ALTER POLICY "Admin full access to app_settings" ON public.app_settings
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY "Admin full access to app_settings_delete" ON public.app_settings
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY "Admin full access to app_settings_insert" ON public.app_settings
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );

ALTER POLICY "Admin full access to app_settings_update" ON public.app_settings
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  )
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
    AND (((select auth.jwt()) ->> 'is_anonymous')::boolean IS NOT TRUE)
  );
