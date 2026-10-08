-- Unit 6 (rag-knowledge-base-refresh, design D14): idempotent knowledge-base
-- schema for the upcoming ingestion pipeline (Units 5/7).
--
-- 1. content_hash: nullable column (existing rows have none and must keep
--    working with chat-with-rag's current match_documents* calls — a
--    nullable ADD COLUMN is a metadata-only change, no table rewrite of
--    existing values, no NOT NULL/backfill requirement).
-- 2. UNIQUE index on content_hash: standard btree semantics already allow
--    any number of NULL rows (admin-inserted rows with no hash), so no
--    partial-index predicate is needed.
-- 3. Replace the ivfflat index (documents_embedding_idx, see
--    20260204130000_fix_documents_embedding_type.sql) with HNSW — better
--    recall/query performance, no `lists` tuning needed for this row count.
-- 4. upsert_document / delete_stale_documents: service_role-only RPCs for
--    the ingestion script (scripts/kb/store.mjs, Unit 7). SECURITY INVOKER
--    is safe here because the "Service role full access" RLS policy
--    (20260204120000_enable_documents_rls.sql) already bypasses RLS for
--    service_role; there is no DEFINER privilege to escalate.
-- 5. match_documents / match_documents_by_source: add `metadata` to the
--    returned columns so chat-with-rag's buildSystemInstruction (which
--    already reads `doc.metadata?.url` optionally) can cite source URLs.
--    Adding a column is additive/backward-compatible with existing callers
--    that destructure by name.
-- 6. Drop the dead embedding_cache table (ADR-003 Phase 2, never wired to
--    any caller — chat-with-rag's cache is in-memory only).
--
-- All vector-touching functions pin `SET search_path = public, extensions`
-- per 20261006100000_move_vector_extension_out_of_public.sql (vector lives
-- in `extensions`, not `public`).

-- ============================================================
-- 1-3. content_hash column, unique index, HNSW index
-- ============================================================

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

COMMENT ON COLUMN public.documents.content_hash IS
  'sha256(contractVersion\nsource\nurl\nsection\nnormalizedContent) — set by the ingestion pipeline (scripts/kb/hash.mjs) for idempotent upsert/stale-cleanup. NULL for admin-authored rows not managed by ingestion.';

CREATE UNIQUE INDEX IF NOT EXISTS documents_content_hash_key
  ON public.documents (content_hash);

DROP INDEX IF EXISTS public.documents_embedding_idx;

CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx
  ON public.documents
  USING hnsw (embedding extensions.vector_cosine_ops);

-- ============================================================
-- 4a. upsert_document — service_role only
-- ============================================================

DROP FUNCTION IF EXISTS public.upsert_document(TEXT, TEXT, JSONB, TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.upsert_document(
  p_content TEXT,
  p_embedding TEXT,
  p_metadata JSONB,
  p_source TEXT,
  p_content_hash TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.documents (content, embedding, metadata, source, content_hash, updated_at)
  VALUES (
    p_content,
    p_embedding::vector(768),
    COALESCE(p_metadata, '{}'::jsonb),
    p_source,
    p_content_hash,
    now()
  )
  ON CONFLICT (content_hash) DO UPDATE SET
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    source = EXCLUDED.source,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_document(TEXT, TEXT, JSONB, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_document(TEXT, TEXT, JSONB, TEXT, TEXT) TO service_role;

-- ============================================================
-- 4b. delete_stale_documents — service_role only, fail-closed on empty input
-- ============================================================

DROP FUNCTION IF EXISTS public.delete_stale_documents(TEXT[]) CASCADE;

CREATE OR REPLACE FUNCTION public.delete_stale_documents(p_keep_hashes TEXT[])
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_deleted INT;
BEGIN
  IF p_keep_hashes IS NULL OR array_length(p_keep_hashes, 1) IS NULL THEN
    RAISE EXCEPTION 'delete_stale_documents: p_keep_hashes must not be empty (refusing to wipe the ingestion-managed knowledge base)';
  END IF;

  DELETE FROM public.documents
  WHERE source ~ '^(site|faq|curated):'
    AND (content_hash IS NULL OR content_hash <> ALL (p_keep_hashes));

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_stale_documents(TEXT[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_stale_documents(TEXT[]) TO service_role;

-- ============================================================
-- 5a. match_documents — add metadata to return columns
-- ============================================================

DROP FUNCTION IF EXISTS public.match_documents(TEXT, float, int) CASCADE;

CREATE FUNCTION public.match_documents(
  query_embedding TEXT,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content::TEXT,
    d.source::TEXT,
    d.metadata,
    1 - (d.embedding <=> query_embedding::vector(768)) AS similarity
  FROM public.documents d
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding::vector(768)) > match_threshold
  ORDER BY d.embedding <=> query_embedding::vector(768)
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents(TEXT, float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_documents(TEXT, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents(TEXT, float, int) TO service_role;

-- ============================================================
-- 5b. match_documents_by_source — add metadata to return columns
-- ============================================================

DROP FUNCTION IF EXISTS public.match_documents_by_source(TEXT, TEXT, float, int) CASCADE;

CREATE FUNCTION public.match_documents_by_source(
  query_embedding TEXT,
  source_filter TEXT,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content::TEXT,
    d.source::TEXT,
    d.metadata,
    1 - (d.embedding <=> query_embedding::vector(768)) AS similarity
  FROM public.documents d
  WHERE d.source ILIKE '%' || source_filter || '%'
    AND d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding::vector(768)) > match_threshold
  ORDER BY d.embedding <=> query_embedding::vector(768)
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents_by_source(TEXT, TEXT, float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_documents_by_source(TEXT, TEXT, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents_by_source(TEXT, TEXT, float, int) TO service_role;

-- ============================================================
-- 6. Drop dead embedding_cache (ADR-003 Phase 2, no real caller)
-- ============================================================

DROP TRIGGER IF EXISTS update_embedding_cache_updated_at_trigger ON public.embedding_cache;
DROP FUNCTION IF EXISTS public.update_embedding_cache_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.clean_expired_embedding_cache() CASCADE;
DROP TABLE IF EXISTS public.embedding_cache CASCADE;
