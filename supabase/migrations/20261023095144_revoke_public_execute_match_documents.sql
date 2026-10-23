-- match_documents / match_documents_by_source keep their explicit grants:
-- anon (chat-with-rag calls them with the anon key), authenticated and
-- service_role. Only the redundant implicit PUBLIC grant is removed so every
-- role that can execute them is listed explicitly.
REVOKE EXECUTE ON FUNCTION public.match_documents(text, double precision, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.match_documents_by_source(text, text, double precision, integer) FROM PUBLIC;
