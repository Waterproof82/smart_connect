-- Update match_documents to accept text/json array and cast to vector
-- This allows Supabase JS to send number[] arrays from Edge Functions

DROP FUNCTION IF EXISTS match_documents(vector, float, int);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding text, -- Changed from vector(768) to text
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
DECLARE
  embedding_vector vector(768);
BEGIN
  -- Cast text to vector (handles both [1,2,3] string and JSON array)
  embedding_vector := query_embedding::vector(768);
  
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.source,
    1 - (documents.embedding <=> embedding_vector) AS similarity
  FROM public.documents
  WHERE documents.embedding IS NOT NULL
    AND 1 - (documents.embedding <=> embedding_vector) > match_threshold
  ORDER BY documents.embedding <=> embedding_vector
  LIMIT match_count;
END;
$$;

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION match_documents(text, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_documents(text, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents(text, float, int) TO service_role;
