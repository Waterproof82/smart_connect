# Audit Log - 2026-02-10

## Action: Allow anonymous access and normalize roles in chat-with-rag Edge Function

- Enabled support for Supabase JWT with role 'anon' (canonical for anonymous users).
- Internal logic now maps 'anon' to 'anonymous' for permission checks.
- Fixed error handling to return custom HTTP errors (401, etc) as intended.
- Fixed minor code issues: removed useless assignment to 'prompt', improved cacheHit logic.

Timestamp: 2026-02-10
