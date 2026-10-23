-- Update admin email from admin@smartconnect.ai to info@digitalizatenerife.es

ALTER POLICY documents_admin_insert ON documents
WITH CHECK ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY documents_admin_update ON documents
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es')
WITH CHECK ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');

ALTER POLICY documents_admin_delete ON documents
USING ((auth.jwt() ->> 'email') = 'info@digitalizatenerife.es');
