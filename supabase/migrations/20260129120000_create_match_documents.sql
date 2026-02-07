-- Create match_documents function for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.source,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM public.documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_documents(vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_documents(vector, float, int) TO authenticated;
