-- ========================================
-- DOCUMENTS TABLE (Knowledge Base)
-- ========================================
-- Stores documents for RAG (Retrieval-Augmented Generation)
-- Each document has content and vector embedding for semantic search

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768), -- text-embedding-004 dimension
  source TEXT, -- e.g., 'qribar_guide', 'reviews_guide'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for vector similarity search (HNSW for performance)
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
  ON public.documents 
  USING hnsw (embedding vector_cosine_ops);

-- Create index for source filtering
CREATE INDEX IF NOT EXISTS documents_source_idx 
  ON public.documents (source);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access (public knowledge base)
CREATE POLICY "Allow anonymous read access"
  ON public.documents
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete documents
CREATE POLICY "Service role can manage documents"
  ON public.documents
  FOR ALL
  USING (auth.role() = 'service_role');

-- ========================================
-- VECTOR SEARCH FUNCTION
-- ========================================
-- Function to find similar documents using cosine similarity
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

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION match_documents TO anon;
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;

-- ========================================
-- UPDATED_AT TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
