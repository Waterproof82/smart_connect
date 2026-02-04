-- Create embedding_cache table for RAG system optimization (ADR-003 Phase 2)
-- This table provides persistent backup for in-memory embedding cache
-- TTL: 7 days default (configurable per entry)

CREATE TABLE IF NOT EXISTS public.embedding_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  embedding vector(768) NOT NULL,
  timestamp BIGINT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ttl BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast key lookup
CREATE INDEX IF NOT EXISTS idx_embedding_cache_key 
ON public.embedding_cache(key);

-- Index for timestamp-based cleanup
CREATE INDEX IF NOT EXISTS idx_embedding_cache_timestamp 
ON public.embedding_cache(timestamp);

-- RLS Policies (allow all operations for authenticated users)
ALTER TABLE public.embedding_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read cache
CREATE POLICY "Allow authenticated read access"
ON public.embedding_cache
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow anon users to read cache (for chatbot)
CREATE POLICY "Allow anon read access"
ON public.embedding_cache
FOR SELECT
TO anon
USING (true);

-- Policy: Allow authenticated users to insert/update cache
CREATE POLICY "Allow authenticated write access"
ON public.embedding_cache
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow anon users to insert/update cache (for chatbot)
CREATE POLICY "Allow anon write access"
ON public.embedding_cache
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embedding_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_embedding_cache_updated_at_trigger
BEFORE UPDATE ON public.embedding_cache
FOR EACH ROW
EXECUTE FUNCTION update_embedding_cache_updated_at();

-- Function to clean up expired entries (run via cron job)
CREATE OR REPLACE FUNCTION clean_expired_embedding_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.embedding_cache
  WHERE (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT - timestamp > COALESCE(ttl, 604800000); -- 7 days default
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION clean_expired_embedding_cache() TO service_role;

COMMENT ON TABLE public.embedding_cache IS 'Persistent cache for Gemini embeddings (768-dim vectors). Used as backup for in-memory cache in RAG system (ADR-003 Phase 2).';
COMMENT ON COLUMN public.embedding_cache.key IS 'Unique cache key (format: source_hash)';
COMMENT ON COLUMN public.embedding_cache.embedding IS '768-dimensional vector from Gemini text-embedding-004';
COMMENT ON COLUMN public.embedding_cache.timestamp IS 'Unix timestamp in milliseconds';
COMMENT ON COLUMN public.embedding_cache.ttl IS 'Time-to-live in milliseconds (default: 7 days = 604800000ms)';
