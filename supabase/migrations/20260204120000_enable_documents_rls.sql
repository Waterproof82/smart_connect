-- Enable Row Level Security on documents table
-- Security: OWASP A01:2021 - Broken Access Control
-- Purpose: Restrict document access to admin users only, while allowing chatbot read access

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin full access (authenticated users with admin role)
CREATE POLICY "Admin full access to documents"
ON public.documents
FOR ALL
TO authenticated
USING (
  COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    ''
  ) IN ('admin', 'super_admin')
);

-- Policy 2: Anon read-only access for chatbot
CREATE POLICY "Anon read access for chatbot"
ON public.documents
FOR SELECT
TO anon
USING (true);

-- Policy 3: Service role bypass (for Edge Functions)
CREATE POLICY "Service role full access"
ON public.documents
FOR ALL
TO service_role
USING (true);

-- Add comments for documentation
COMMENT ON POLICY "Admin full access to documents" ON public.documents 
IS 'Allows authenticated users with admin or super_admin role to perform all operations on documents';

COMMENT ON POLICY "Anon read access for chatbot" ON public.documents 
IS 'Allows anonymous users (chatbot) to read documents for RAG context retrieval';

COMMENT ON POLICY "Service role full access" ON public.documents 
IS 'Allows service role (Edge Functions) to perform all operations for system-level tasks';
