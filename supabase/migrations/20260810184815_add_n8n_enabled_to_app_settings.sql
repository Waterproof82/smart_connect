ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS n8n_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.app_settings.n8n_enabled IS
  'When true, landing leads go to n8n_webhook_url. When false, they are emailed to contact_email via the notify-lead function.';
