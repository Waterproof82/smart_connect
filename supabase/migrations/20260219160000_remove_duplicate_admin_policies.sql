-- Remove duplicate policies from previous migrations

BEGIN;

-- Drop old duplicate policies
DROP POLICY IF EXISTS "admin_insert_update_delete" ON public.documents;
DROP POLICY IF EXISTS "admin_update" ON public.documents;
DROP POLICY IF EXISTS "admin_delete" ON public.documents;

COMMIT;
