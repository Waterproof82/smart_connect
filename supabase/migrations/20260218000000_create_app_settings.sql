-- Create app_settings table for global application settings
-- This replaces hardcoded env variables with database-configurable values

-- Create the settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    n8n_webhook_url TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    whatsapp_phone TEXT DEFAULT '',
    physical_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admin full access (authenticated users with admin role)
CREATE POLICY "Admin full access to app_settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (
    COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'role')::text,
        ''
    ) IN ('admin', 'super_admin')
);

-- Policy: Service role full access
CREATE POLICY "Service role full access to app_settings"
ON public.app_settings
FOR ALL
TO service_role
USING (true);

-- Policy: Anon can read (for landing page to access contact info)
CREATE POLICY "Anon read access to app_settings"
ON public.app_settings
FOR SELECT
TO anon
USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings row if not exists
INSERT INTO public.app_settings (id, n8n_webhook_url, contact_email, whatsapp_phone, physical_address)
VALUES ('global', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.app_settings IS 'Global application settings - stores configurable values shown on landing page and used by the app';
COMMENT ON COLUMN public.app_settings.n8n_webhook_url IS 'URL for n8n webhook to receive leads';
COMMENT ON COLUMN public.app_settings.contact_email IS 'Contact email shown on landing page';
COMMENT ON COLUMN public.app_settings.whatsapp_phone IS 'WhatsApp phone number shown on landing page';
COMMENT ON COLUMN public.app_settings.physical_address IS 'Physical address shown on landing page';
