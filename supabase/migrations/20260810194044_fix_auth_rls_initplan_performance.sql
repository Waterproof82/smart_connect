-- Wrap auth.jwt() calls in a scalar subquery so Postgres evaluates them
-- once per query instead of once per row (Supabase lint 0003_auth_rls_initplan).
-- Pure performance fix — semantics of every policy are unchanged.

-- documents
ALTER POLICY documents_admin_delete ON public.documents
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY documents_admin_insert ON public.documents
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY documents_admin_update ON public.documents
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

-- security_logs
ALTER POLICY admin_insert_security_logs ON public.security_logs
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY only_admins_read_logs ON public.security_logs
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

-- app_settings
ALTER POLICY "Admin full access to app_settings" ON public.app_settings
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY "Admin full access to app_settings_delete" ON public.app_settings
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY "Admin full access to app_settings_insert" ON public.app_settings
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);

ALTER POLICY "Admin full access to app_settings_update" ON public.app_settings
  USING (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text)
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'info@digitalizatenerife.es'::text);
