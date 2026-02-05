-- Add category and updated_at columns to documents table for admin panel
-- This allows categorization of documents and tracking modifications

-- Add updated_at column first (required by existing trigger)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add category column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_category 
ON public.documents(category);

CREATE INDEX IF NOT EXISTS idx_documents_updated_at 
ON public.documents(updated_at);

-- Update existing documents with inferred categories based on source
UPDATE public.documents
SET category = CASE
  WHEN source ILIKE '%qribar%' THEN 'producto_digital'
  WHEN source ILIKE '%review%' OR source ILIKE '%nfc%' THEN 'reputacion_online'
  ELSE 'general'
END
WHERE category = 'general' OR category IS NULL;

-- Add comments
COMMENT ON COLUMN public.documents.category IS 'Document category for classification (producto_digital, reputacion_online, general)';
COMMENT ON COLUMN public.documents.updated_at IS 'Timestamp of last update to the document';
