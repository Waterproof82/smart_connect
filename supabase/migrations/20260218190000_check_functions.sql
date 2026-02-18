-- Check what functions exist in public schema
SELECT proname, pronargs, proargnames 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;
