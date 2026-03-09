-- ============================================================================
-- Migration: Fix function EXECUTE grants - Restrict write functions to service_role
-- Critical: insert_document (SECURITY DEFINER) was callable by anon, bypassing RLS
-- Applied: 2026-03-09 via Supabase MCP
-- ============================================================================

-- 1. CRITICAL: insert_document is SECURITY DEFINER + callable by anon = RLS bypass
REVOKE EXECUTE ON FUNCTION public.insert_document(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_document(text, text, text) TO service_role;

-- 2. insert_document_with_embedding - should only be called by service_role
REVOKE EXECUTE ON FUNCTION public.insert_document_with_embedding(text, text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_document_with_embedding(text, text, jsonb, text) TO service_role;

-- 3. batch_insert_document - should only be called by service_role
REVOKE EXECUTE ON FUNCTION public.batch_insert_document(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.batch_insert_document(text) TO service_role;

-- 4. match_documents / match_documents_by_source - READ functions, safe for anon (chatbot RAG)
-- Keep as-is: anon + authenticated + service_role
