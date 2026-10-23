-- supabase-schema-hygiene (PR2)
-- 1. Dead write RPCs: replaced by upsert_document (KB ingest); zero references
--    in code and zero calls in API logs. No CASCADE: fail if anything depends.
--    Rollback definitions: docs/audit/2026-10-23_supabase-schema-hygiene.md
DROP FUNCTION IF EXISTS public.batch_insert_document(text);
DROP FUNCTION IF EXISTS public.insert_document(text, text, text);
DROP FUNCTION IF EXISTS public.insert_document_with_embedding(text, text, jsonb, text);

-- 2. Trigger function: API roles never need EXECUTE (Postgres checks it only
--    at CREATE TRIGGER time, not when the trigger fires).
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3. Duplicate service_role INSERT policy (service_insert_security_logs stays).
DROP POLICY IF EXISTS service_role_insert_logs ON public.security_logs;
