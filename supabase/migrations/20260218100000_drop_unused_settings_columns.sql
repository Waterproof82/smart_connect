-- Remove unused columns from app_settings table
-- These are now handled internally by n8n, not by our app

ALTER TABLE public.app_settings 
DROP COLUMN IF EXISTS n8n_notification_email,
DROP COLUMN IF EXISTS google_sheets_id;
