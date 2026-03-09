-- ============================================================================
-- Migration: Fix security_logs INSERT policy to only allow admin
-- Only admin@smartconnect.ai should be able to insert security logs
-- Applied: 2026-03-09
-- ============================================================================

BEGIN;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "authenticated_insert_logs" ON public.security_logs;

-- Create restrictive INSERT policy: only admin can insert
-- Note: INSERT policies only support WITH CHECK (not USING)
CREATE POLICY "admin_insert_security_logs" ON public.security_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@smartconnect.ai'
  );

-- Also add for service_role (Edge Functions)
CREATE POLICY "service_insert_security_logs" ON public.security_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

COMMIT;
