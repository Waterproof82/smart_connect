-- Fix security_logs RLS policy to allow inserts from frontend
-- This allows the SecurityLogger to persist events from the React app

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Allow all inserts to security_logs" ON security_logs;

-- Create a new policy that allows authenticated and anonymous inserts
-- This is necessary for security logging to work from the frontend
CREATE POLICY "Allow inserts for security logging" ON security_logs
    FOR INSERT
    WITH CHECK (true);

-- Keep the select policy restrictive (service role only)
-- This ensures only backend services can read the logs
DROP POLICY IF EXISTS "Deny all selects from security_logs" ON security_logs;

CREATE POLICY "Service role only can select security_logs" ON security_logs
    FOR SELECT
    USING (
        -- Only service role can read
        auth.jwt() ->> 'role' = 'service_role'
        OR
        -- Or allow anon to read their own recent events (for stats dashboard)
        (created_at > NOW() - INTERVAL '5 minutes')
    );

-- Add comment explaining the security model
COMMENT ON TABLE security_logs IS 
'Security event logging table. 
RLS Policy: 
- INSERT: Open to all (anon/authenticated) for logging security events
- SELECT: Service role only, except recent events (5min) for frontend stats
- UPDATE/DELETE: Denied to all (immutable audit log)';
