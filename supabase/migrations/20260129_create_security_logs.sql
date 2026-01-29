-- Migration: Create security_logs table
-- Date: 2026-01-29
-- Purpose: Persist security events for monitoring and incident response
-- Security: OWASP A09:2021 - Security Logging and Monitoring Failures

-- Create security_logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);

-- Enable Row Level Security
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow Edge Functions to insert security logs (using service role)
CREATE POLICY "Allow insert for authenticated users and service role" 
ON public.security_logs
FOR INSERT 
WITH CHECK (true);

-- Allow select only for service role (admin dashboard access)
-- Note: Regular users cannot read security logs
CREATE POLICY "Deny select for all users" 
ON public.security_logs
FOR SELECT 
USING (false);

-- Comment on table
COMMENT ON TABLE public.security_logs IS 'Security event logs for monitoring and incident response. OWASP A09:2021 compliance.';

-- Comment on columns
COMMENT ON COLUMN public.security_logs.event_type IS 'Type of security event (AUTH_FAILURE, XSS_ATTEMPT, etc.)';
COMMENT ON COLUMN public.security_logs.severity IS 'Event severity: INFO, WARNING, or CRITICAL';
COMMENT ON COLUMN public.security_logs.metadata IS 'Additional context as JSON object';
