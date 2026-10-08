-- rag-knowledge-base-refresh: add documents.updated_at.
--
-- upsert_document (20261008065448) writes `updated_at`, but production never
-- had this column: it only existed in an older repo migration that was never
-- applied remotely. The first real ingestion (2026-10-08) failed on its first
-- row with `column "updated_at" of relation "documents" does not exist`.
-- Nothing was written; the run aborted before any upsert succeeded.
--
-- Purely additive: existing rows get now() via the default.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

COMMENT ON COLUMN public.documents.updated_at IS
  'Last time the ingestion pipeline (upsert_document) wrote this row.';
