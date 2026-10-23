ALTER POLICY "Admin full access to app_settings" ON app_settings
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY "Admin full access to app_settings_insert" ON app_settings
WITH CHECK ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY "Admin full access to app_settings_update" ON app_settings
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es')
WITH CHECK ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY "Admin full access to app_settings_delete" ON app_settings
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');
