-- Fix remaining multiple_permissive_policies warning
-- Remove authenticated_read policy to avoid duplicate SELECT for authenticated role

BEGIN;

-- Drop the duplicate authenticated_read policy
DROP POLICY IF EXISTS "authenticated_read" ON public.documents;

COMMIT;
