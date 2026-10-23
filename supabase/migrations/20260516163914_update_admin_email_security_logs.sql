ALTER POLICY only_admins_read_logs ON security_logs
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY admin_insert_security_logs ON security_logs
WITH CHECK ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');
