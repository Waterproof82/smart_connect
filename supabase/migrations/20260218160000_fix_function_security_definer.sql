-- Simple function security fixes
ALTER FUNCTION public.clean_expired_embedding_cache() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_embedding_cache_updated_at() SET search_path = public;
