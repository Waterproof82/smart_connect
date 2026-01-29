-- Update insert_document to return void instead of UUID
-- This fixes Supabase JS client parsing issues
DROP FUNCTION IF EXISTS insert_document(TEXT, TEXT, TEXT);

CREATE FUNCTION insert_document(
  doc_content TEXT,
  doc_embedding TEXT,
  doc_source TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.documents (content, embedding, source)
  VALUES (doc_content, doc_embedding::vector(768), doc_source);
END;
$$;

GRANT EXECUTE ON FUNCTION insert_document(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION insert_document(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION insert_document(TEXT, TEXT, TEXT) TO authenticated;
