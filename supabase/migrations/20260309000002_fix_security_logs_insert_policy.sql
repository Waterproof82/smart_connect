-- ============================================================================
-- Migration: Allow authenticated users to insert security logs
-- The frontend SecurityLogger needs to persist events via the anon/authenticated client
-- Only service_role and admin can READ logs; anyone authenticated can INSERT
-- Applied: 2026-03-09 via Supabase MCP
-- ============================================================================

CREATE POLICY "authenticated_insert_logs" ON public.security_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);
