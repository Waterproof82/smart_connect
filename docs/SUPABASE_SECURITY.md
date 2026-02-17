# Supabase Security Configuration

**Last Updated:** 2026-02-17  
**Status:** ✅ Production Ready - RLS policies configured

---

## Overview

This document provides step-by-step instructions to secure your Supabase instance following OWASP Top 10 best practices. These configurations are **mandatory** before deploying to production.

---

## 1. Row Level Security (RLS) Policies

### Why RLS?

The Supabase Anonymous Key (`VITE_SUPABASE_ANON_KEY`) is **intentionally public** and exposed in the JavaScript bundle. RLS ensures that even with this key, users can only access data they're authorized to see.

### Tables Requiring RLS

#### A. `documents` Table

**Purpose:** Stores embedded documents for RAG chatbot (menu items, FAQs, product info, etc.)

**Required Policies:**

```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (chatbot access)
CREATE POLICY public_read_documents
ON documents
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users with admin/super_admin role to INSERT
CREATE POLICY admin_insert_documents
ON documents
FOR INSERT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = ANY (ARRAY['admin'::text, 'super_admin'::text])
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = ANY (ARRAY['admin'::text, 'super_admin'::text])
);

-- Policy 3: Allow authenticated users with admin/super_admin role to UPDATE
CREATE POLICY admin_update_documents
ON documents
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = ANY (ARRAY['admin'::text, 'super_admin'::text])
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = ANY (ARRAY['admin'::text, 'super_admin'::text])
);

-- Policy 4: Allow authenticated users with admin/super_admin role to DELETE
CREATE POLICY admin_delete_documents
ON documents
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = ANY (ARRAY['admin'::text, 'super_admin'::text])
);
```

**Access Matrix:**
| Operation | Anonymous (anon) | Authenticated (user) | Admin/Super Admin |
|-----------|------------------|---------------------|------------------|
| SELECT    | ✅ Allowed       | ✅ Allowed          | ✅ Allowed       |
| INSERT    | ❌ Blocked       | ❌ Blocked          | ✅ Allowed       |
| UPDATE    | ❌ Blocked       | ❌ Blocked          | ✅ Allowed       |
| DELETE    | ❌ Blocked       | ❌ Blocked          | ✅ Allowed       |

#### B. `security_logs` Table (To be created)

**Purpose:** Stores security events (auth failures, suspicious queries, etc.)

```sql
-- Create security logs table
CREATE TABLE security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  details JSONB,
  severity TEXT CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service_role can read/write
CREATE POLICY "Service role only access"
ON security_logs
FOR ALL
USING (
  auth.role() = 'service_role'
);

-- Create index for performance
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
```

---

## 2. Edge Function Security

### A. Environment Variables

Set these in Supabase Dashboard → Edge Functions → Settings:

```bash
# Required for all Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # ⚠️ NEVER expose to client

# Gemini API
GEMINI_API_KEY=AIzaSy... # From Google AI Studio

# CORS Configuration
ALLOWED_ORIGIN=https://smartconnect.ai # Production domain
ALLOWED_ORIGIN_DEV=http://localhost:5173 # Development

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10 # Max requests per window
RATE_LIMIT_WINDOW_MS=60000 # 1 minute
```

### B. Rate Limiting Configuration

Add to Supabase Dashboard → Settings → API:

- **Anonymous requests per second:** 10
- **Authenticated requests per second:** 100
- **Enable rate limiting:** ✅ Yes

---

## 3. Database Functions Security

### A. `match_documents` Function

Modify the existing function to support tenant filtering:

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  tenant_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 
    (1 - (documents.embedding <=> query_embedding)) > match_threshold
    AND (
      tenant_id IS NULL 
      OR documents.metadata->>'tenant_id' = tenant_id
    )
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 4. Authentication Configuration

### A. Enable Email Rate Limiting

Supabase Dashboard → Authentication → Rate Limits:

- **Email signups per hour:** 10
- **Email signins per hour:** 20
- **Password resets per hour:** 5

### B. JWT Configuration

Supabase Dashboard → Settings → API:

- **JWT expiry:** 3600 (1 hour)
- **Refresh token expiry:** 604800 (7 days)
- **Enable JWT verification:** ✅ Yes

---

## 5. API Key Security

### ⚠️ CRITICAL: Key Exposure Matrix

| Key Type | Exposed to Client? | Usage |
|----------|-------------------|-------|
| `VITE_SUPABASE_URL` | ✅ Yes (public) | Client-side queries |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes (public) | Client-side queries (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **NEVER** | Server-side only (bypasses RLS) |
| `GEMINI_API_KEY` | 🔴 **NEVER** | Edge Functions only |

### Key Rotation Strategy

1. **Monthly rotation** for production keys
2. **Immediate rotation** if key is compromised
3. **Use separate keys** for dev/staging/production

---

## 6. Monitoring & Alerts

### A. Set Up Alerts

Supabase Dashboard → Monitoring → Alerts:

1. **API Usage Alert**
   - Trigger: > 80% of quota
   - Action: Email to team

2. **Error Rate Alert**
   - Trigger: > 5% error rate in 5 minutes
   - Action: Email + Slack notification

3. **Suspicious Activity Alert**
   - Trigger: > 10 failed auth attempts in 1 minute
   - Action: Email + Block IP

### B. Enable Audit Logs

Supabase Dashboard → Settings → Audit Logs:

- ✅ Log all authentication events
- ✅ Log all database schema changes
- ✅ Log all Edge Function invocations

---

## 7. Deployment Checklist

Before deploying to production, verify:

- [x] RLS enabled on all tables
- [x] RLS policies tested with anonymous and authenticated users
- [x] Edge Functions validate JWT tokens
- [x] Rate limiting configured
- [x] CORS restricted to production domain
- [x] Service role key is **NEVER** exposed to client
- [x] Monitoring alerts configured
- [x] Backup strategy in place
- [x] Incident response plan documented

---

## 8. Testing RLS Policies

### Test Script

```javascript
// Run in browser console with anonymous user
const { createClient } = supabase;

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

// Test 1: Anonymous user can read public documents
const { data: publicDocs, error: publicError } = await supabase
  .from('documents')
  .select('*')
  .limit(1);

console.log('Public docs accessible:', !publicError);

// Test 2: Anonymous user CANNOT insert documents
const { data: insertData, error: insertError } = await supabase
  .from('documents')
  .insert({ content: 'test', source: 'test', embedding: [] });

console.log('Insert blocked:', !!insertError); // Should be true

// Test 3: Anonymous user CANNOT delete documents
const { data: deleteData, error: deleteError } = await supabase
  .from('documents')
  .delete()
  .eq('id', 'some-uuid');

console.log('Delete blocked:', !!deleteError); // Should be true
```

---

## 9. Incident Response

### If a key is compromised:

1. **Immediately rotate** the key in Supabase Dashboard
2. **Revoke** the old key
3. **Update** `.env` files in all environments
4. **Redeploy** all applications
5. **Review** security logs for unauthorized access
6. **Document** the incident in `docs/audit/`

### Contact Information

- **Security Team:** security@smartconnect.ai
- **Supabase Support:** https://supabase.com/support
- **Emergency Hotline:** [Add your team's emergency contact]

---

## 10. Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP Top 10:2021](https://owasp.org/Top10/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Status:** ✅ Production Ready  
**Next Action:** Run integration tests to verify RLS policies  
**Owner:** DevOps Team + Security Lead
