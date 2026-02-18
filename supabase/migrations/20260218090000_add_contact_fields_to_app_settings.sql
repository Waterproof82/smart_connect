-- Add contact fields to app_settings table
-- New fields: whatsapp_phone, physical_address

ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS physical_address TEXT DEFAULT '';

-- Add comments for new columns
COMMENT ON COLUMN public.app_settings.whatsapp_phone IS 'WhatsApp phone number for direct contact (format: +549...)';
COMMENT ON COLUMN public.app_settings.physical_address IS 'Physical business address';
