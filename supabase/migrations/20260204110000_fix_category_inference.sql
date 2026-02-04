-- Migration: Fix category inference to match RAGIndexer logic
-- Date: 2026-02-04
-- Description: Update categories to match chatbot's _inferCategory() method

-- Update all documents with corrected category logic
-- The chatbot uses case-insensitive search with includes()
UPDATE documents
SET category = CASE
  -- Match 'qribar' (case insensitive)
  WHEN LOWER(source) LIKE '%qribar%' THEN 'producto_digital'
  
  -- Match 'review' (case insensitive) - this covers nfc_reviews_product
  WHEN LOWER(source) LIKE '%review%' THEN 'reputacion_online'
  
  -- Everything else is general (automation_product, company_philosophy, contact_info)
  ELSE 'general'
END;

-- Verify results
-- Expected:
-- qribar_product -> producto_digital
-- nfc_reviews_product -> reputacion_online
-- automation_product -> general
-- company_philosophy -> general
-- contact_info -> general
