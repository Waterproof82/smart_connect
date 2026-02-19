-- Final fix: drop ALL functions and recreate with correct types

-- First, drop ALL versions of these functions
DROP FUNCTION IF EXISTS match_documents(TEXT, FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS match_documents(TEXT, FLOAT) CASCADE;
DROP FUNCTION IF EXISTS match_documents(TEXT) CASCADE;
DROP FUNCTION IF EXISTS match_documents CASCADE;

DROP FUNCTION IF EXISTS match_documents_by_source(TEXT, TEXT, FLOAT, INT) CASCADE;
DROP FUNCTION IF EXISTS match_documents_by_source(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS match_documents_by_source CASCADE;

DROP FUNCTION IF EXISTS insert_document_with_embedding(TEXT, TEXT, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS insert_document_with_embedding(TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS insert_document_with_embedding(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS insert_document_with_embedding CASCADE;

DROP FUNCTION IF EXISTS batch_insert_document(TEXT) CASCADE;
DROP FUNCTION IF EXISTS batch_insert_document CASCADE;

-- ============================================
-- MATCH_DOCUMENTS function
-- ============================================

CREATE FUNCTION match_documents(
  query_embedding TEXT,
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
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding::vector(768)) > match_threshold
  ORDER BY d.embedding <=> query_embedding::vector(768)
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_documents(TEXT, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_documents(TEXT, float, int) TO authenticated;

-- ============================================
-- MATCH_DOCUMENTS_BY_SOURCE function
-- ============================================

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
  WHERE d.source::TEXT = source_filter
    AND d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding::vector(768)) > match_threshold
  ORDER BY d.embedding <=> query_embedding::vector(768)
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_documents_by_source(TEXT, TEXT, float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_documents_by_source(TEXT, TEXT, float, int) TO authenticated;

-- ============================================
-- INSERT_DOCUMENT_WITH_EMBEDDING function
-- ============================================

CREATE FUNCTION insert_document_with_embedding(
  doc_content TEXT,
  doc_source TEXT,
  doc_metadata JSONB DEFAULT '{}',
  doc_embedding TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  new_id := gen_random_uuid();
  
  INSERT INTO public.documents (id, content, source, metadata, embedding)
  VALUES (
    new_id,
    doc_content,
    doc_source,
    doc_metadata,
    CASE 
      WHEN doc_embedding IS NOT NULL THEN doc_embedding::vector(768)
      ELSE NULL::vector(768)
    END
  );
  
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_document_with_embedding(TEXT, TEXT, JSONB, TEXT) TO service_role;

-- ============================================
-- BATCH_INSERT_DOCUMENT function
-- ============================================

CREATE FUNCTION batch_insert_document(documents_json TEXT)
RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  inserted_count INT := 0;
  doc_record JSONB;
  doc_array JSONB;
BEGIN
  doc_array := documents_json::jsonb;
  
  FOR doc_record IN SELECT * FROM jsonb_array_elements(doc_array)
  LOOP
    INSERT INTO public.documents (content, source, metadata, embedding)
    VALUES (
      doc_record->>'content',
      doc_record->>'source',
      COALESCE(doc_record->>'metadata', '{}')::jsonb,
      CASE 
        WHEN doc_record->>'embedding' IS NOT NULL THEN (doc_record->>'embedding')::vector(768)
        ELSE NULL::vector(768)
      END
    );
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION batch_insert_document(TEXT) TO service_role;
