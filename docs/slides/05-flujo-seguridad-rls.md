# 🛡️ Slide 05: Seguridad RLS

## Row Level Security - Políticas de Acceso a Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RLS OVERVIEW                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         WHY RLS?                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┐        ┌───────────────────────┐
│  TRADITIONAL APPROACH │        │  RLS APPROACH        │
├───────────────────────┤        ├───────────────────────┤
│  Client sends request│        │  Client sends request│
│  Server validates    │        │  Database validates   │
│  Server queries DB   │        │  DB returns filtered │
│  Server filters      │        │  rows only           │
│  Server returns data │        │                      │
├───────────────────────┤        ├───────────────────────┤
│  ❌ If server code   │        │  ✅ Even if client   │
│     is bypassed,     │        │     is compromised,  │
│     data is exposed  │        │     DB still denies  │
└───────────────────────┘        └───────────────────────┘
```

---

## Tabla: Documents - Políticas Actuales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENTS TABLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  id (UUID)          │ content (TEXT)      │ source (VARCHAR)              │
│  123e4567...        │ QRIBAR cuesta $200  │ qribar                       │
│  223e4567...        │ Excelentes reviews  │ reviews                      │
│  323e4567...        │ Automatizaciones IA │ general                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  embedding (VECTOR) │ metadata (JSONB)    │ created_at                   │
│  [0.1, -0.5, ...]   │ {"title": "..."}   │ 2026-02-17 10:00:00         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tables with RLS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TABLES WITH RLS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  documents:                                                               │
│  • SELECT: public (anon + authenticated) - for chatbot RAG             │
│  • ALL: info@digitalizatenerife.es only                                        │
│  • service_role: full access                                             │
│                                                                         │
│  app_settings:                                                            │
│  • SELECT: public (anon) - for landing page contact info                │
│  • ALL: info@digitalizatenerife.es only                                        │
│  • service_role: full access                                             │
│                                                                         │
│  security_logs:                                                           │
│  • SELECT: info@digitalizatenerife.es only                                     │
│  • ALL: service_role only                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLICY MATRIX                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ OPERATION: SELECT (Read)                                           │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ POLICY: public_read_documents                                      │  │
│  │ TO: public (anon + authenticated)                                  │  │
│  │ USING: true                                                        │  │
│  │ RESULT: ✅ Anyone can read                                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ OPERATION: INSERT (Create)                                        │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ POLICY: admin_insert_documents                                    │  │
│  │ TO: authenticated                                                  │  │
│  │ USING/WITH CHECK: role IN ('admin', 'super_admin')                │  │
│  │ RESULT: ✅ Only admins can create                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ OPERATION: UPDATE (Edit)                                          │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ POLICY: admin_update_documents                                    │  │
│  │ TO: authenticated                                                  │  │
│  │ USING/WITH CHECK: role IN ('admin', 'super_admin')                │  │
│  │ RESULT: ✅ Only admins can update                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ OPERATION: DELETE (Remove)                                        │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ POLICY: admin_delete_documents                                    │  │
│  │ TO: authenticated                                                  │  │
│  │ USING: role IN ('admin', 'super_admin')                          │  │
│  │ RESULT: ✅ Only admins can delete                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Access Flow Diagram

```
                    ┌──────────────────────┐
                    │   CLIENT REQUEST     │
                    │  (Supabase Client)   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  ANON KEY USED?     │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │ YES           │                │ NO
              ▼               │                ▼
       ┌─────────────┐        │        ┌─────────────┐
       │ Authenticated│        │        │  Same flow  │
       │ User         │        │        │  (checked   │
       └──────┬──────┘        │        │   by JWT)   │
              │               │        └─────────────┘
              ▼               │
    ┌─────────────────┐       │
    │  APPLY RLS      │       │
    │  POLICIES       │       │
    └────────┬────────┘       │
             │                │
             ▼                │
    ┌─────────────────┐       │
    │  SELECT → true  │       │
    │  UPDATE → role │       │
    │  DELETE → role │       │
    └────────┬────────┘       │
             │                │
             ▼                ▼
    ┌─────────────────────────────────────┐
    │         DATABASE RESPONSE            │
    │   (Filtered by RLS policies)        │
    └─────────────────────────────────────┘
```

---

## SQL Definition

```sql
-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Public read (chatbot RAG access - anonymous)
CREATE POLICY "Anon read access for chatbot"
ON public.documents
FOR SELECT
TO anon
USING (true);

-- 2. SELECT: Authenticated read (for logged in users)
CREATE POLICY "Authenticated read access"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- 3. INSERT/UPDATE/DELETE: Only info@digitalizatenerife.es (email verified in JWT)
CREATE POLICY "Admin full access to documents"
ON public.documents
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'info@digitalizatenerife.es'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'info@digitalizatenerife.es'
);

-- 4. Service role bypass (for Edge Functions)
CREATE POLICY "Service role full access documents"
ON public.documents
FOR ALL
TO service_role
USING (true);
```

---

## Security Test Results

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEST RESULTS (11/11 PASSING)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Anon Access (Chatbot)                                                    │
│  ✅ should allow anonymous SELECT on documents                             │
│  ✅ should deny anonymous INSERT on documents                             │
│  ✅ should deny anonymous UPDATE on documents                             │
│  ✅ should deny anonymous DELETE on documents                             │
│                                                                         │
│  Non-Admin User Access                                                   │
│  ✅ should allow non-admin SELECT on documents                            │
│  ✅ should deny non-admin INSERT on documents                            │
│                                                                         │
│  Admin User Access                                                       │
│  ✅ should allow admin SELECT on documents                               │
│  ✅ should allow admin INSERT on documents                               │
│  ✅ should allow admin UPDATE on documents                               │
│  ✅ should allow admin DELETE on documents                               │
│                                                                         │
│  Service Role Access                                                     │
│  ✅ should allow service role full access                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## OWASP Compliance

| OWASP Category              | Protection | Implementation                |
| --------------------------- | ---------- | ----------------------------- |
| A01: Broken Access Control  | ✅         | RLS policies + JWT role check |
| A02: Cryptographic Failures | ✅         | API keys in Edge Functions    |
| A03: Injection              | ✅         | Parameterized queries         |
| A07: Auth Failures          | ✅         | Supabase Auth + JWT           |
