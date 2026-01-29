-- Helper function to insert documents with vector embeddings
CREATE OR REPLACE FUNCTION insert_document(
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
