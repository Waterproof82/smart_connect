-- Fix linter 0014_extension_in_public: move pgvector out of the exposed `public` schema.
-- The RAG functions pin search_path=public, so they must also see `extensions`,
-- otherwise `::vector` casts and the `<=>` operator stop resolving.
-- Columns and indexes reference the type by OID and keep working untouched.

ALTER EXTENSION vector SET SCHEMA extensions;

ALTER FUNCTION public.match_documents(text, double precision, integer)
  SET search_path = public, extensions;
ALTER FUNCTION public.match_documents_by_source(text, text, double precision, integer)
  SET search_path = public, extensions;
ALTER FUNCTION public.insert_document(text, text, text)
  SET search_path = public, extensions;
ALTER FUNCTION public.insert_document_with_embedding(text, text, jsonb, text)
  SET search_path = public, extensions;
ALTER FUNCTION public.batch_insert_document(text)
  SET search_path = public, extensions;
