-- sdd/notify-lead-antibot (D1): `anon` must not be able to read delivery
-- secrets (`n8n_webhook_url`) from `app_settings`. Replace blanket
-- table-level SELECT with column-level grants on the public columns the
-- landing page actually needs. `id` is required because the client query
-- filters with `id=eq.global`, which needs SELECT on `id` under
-- column-level grants. `n8n_enabled`/`n8n_webhook_url` are deliberately
-- excluded — the client no longer needs them (notify-lead resolves
-- routing server-side with the service role).
--
-- Admin (`authenticated`) and `service_role` are untouched by this
-- migration — they keep full table-level access via existing grants/RLS.
--
-- Rollback: a new migration re-granting table-level SELECT to anon:
--   GRANT SELECT ON public.app_settings TO anon;

REVOKE SELECT ON public.app_settings FROM anon;

GRANT SELECT (id, contact_email, whatsapp_phone, physical_address)
  ON public.app_settings
  TO anon;
