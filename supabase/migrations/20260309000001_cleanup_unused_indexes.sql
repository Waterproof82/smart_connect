-- ============================================================================
-- Migration: Drop unused indexes flagged by Supabase linter
-- These indexes have never been used and waste storage/write performance
-- Applied: 2026-03-09 via Supabase MCP
-- ============================================================================

DROP INDEX IF EXISTS public.idx_documents_source;
DROP INDEX IF EXISTS public.idx_documents_embedding;
DROP INDEX IF EXISTS public.idx_security_logs_type;
DROP INDEX IF EXISTS public.idx_security_logs_user_id;
DROP INDEX IF EXISTS public.idx_security_logs_severity;

-- Note: documents_embedding_idx (vector index) is kept for similarity search at scale
