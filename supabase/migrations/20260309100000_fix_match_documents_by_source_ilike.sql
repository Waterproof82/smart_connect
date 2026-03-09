-- Fix match_documents_by_source to support comma-separated sources
-- Previously: WHERE d.source::TEXT = source_filter (exact match only)
-- Now: WHERE d.source ILIKE '%' || source_filter || '%' (partial match for comma-separated sources)

DROP FUNCTION IF EXISTS match_documents_by_source(TEXT, TEXT, FLOAT, INT) CASCADE;

CREATE FUNCTION match_documents_by_source(
  query_embedding TEXT,
  source_filter TEXT,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content::TEXT,
    d.source::TEXT,
    1 - (d.embedding <=> query_embedding::vector(768)) AS similarity
  FROM public.documents d
  WHERE d.source ILIKE '%' || source_filter || '%'
    AND d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding::vector(768)) > match_threshold
  ORDER BY d.embedding <=> query_embedding::vector(768)
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_documents_by_source(TEXT, TEXT, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_documents_by_source(TEXT, TEXT, float, int) TO authenticated;
