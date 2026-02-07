-- 1. ACTIVAR LA EXTENSIÓN (Lo primero de todo)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- 2. CREAR LA TABLA (Con todas las columnas necesarias incluidas)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  source text,
  embedding vector(768), -- Para Gemini
  is_public boolean default true,
  category text, -- Agregada directamente aquí
  updated_at timestamptz default now(), -- Agregada directamente aquí
  created_at timestamptz default now()
);

-- 3. CREAR ÍNDICE DE BÚSQUEDA (Opcional, mejora velocidad)
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON public.documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- 4. CREAR LA FUNCIÓN DE BÚSQUEDA (RAG)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter jsonb default '{}'
) RETURNS TABLE (
  id uuid,
  content text,
  source text,
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
  AND (filter = '{}'::jsonb OR documents.source ILIKE ('%' || (filter->>'source') || '%'))
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;