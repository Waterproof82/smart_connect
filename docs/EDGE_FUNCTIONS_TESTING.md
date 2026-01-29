# 🧪 Edge Functions Testing Guide

## 📋 Overview

This guide provides testing procedures for SmartConnect AI Edge Functions deployed on Supabase.

---

## 🔧 Prerequisites

1. **Supabase CLI** installed (`npm i -g supabase`)
2. **Edge Functions deployed** (`.\scripts\deploy-edge-functions.ps1`)
3. **Anon Key** from Supabase Dashboard

---

## 🧪 Test 1: Gemini Chat (RAG Chatbot)

### **Local Testing**

```powershell
# Start local Edge Functions server
supabase functions serve gemini-chat

# In another terminal, send test request
curl -X POST http://localhost:54321/functions/v1/gemini-chat `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{
    "userQuery": "What is QRiBar?",
    "conversationHistory": [],
    "maxDocuments": 3,
    "similarityThreshold": 0.3
  }'
```

### **Production Testing**

```powershell
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat `
  -H "Authorization: Bearer $ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{
    "userQuery": "Explain SmartConnect AI services",
    "conversationHistory": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi! How can I help?"}
    ]
  }'
```

### **Expected Response**

```json
{
  "response": "SmartConnect AI specializes in...",
  "sources": ["Knowledge Base: Products", "Knowledge Base: Services"],
  "documentsUsed": 2,
  "rateLimitRemaining": 9
}
```

---

## 🧪 Test 2: Rate Limiting

### **Spam 15 Requests** (Should block after 10)

```powershell
# PowerShell script to test rate limiting
$ANON_KEY = "YOUR_ANON_KEY"
$url = "https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat"

for ($i = 1; $i -le 15; $i++) {
    Write-Host "Request $i..." -ForegroundColor Cyan
    
    $response = curl -X POST $url `
      -H "Authorization: Bearer $ANON_KEY" `
      -H "Content-Type: application/json" `
      -d "{\"userQuery\": \"Test $i\"}" `
      -s -w "\n%{http_code}"
    
    $statusCode = $response[-1]
    
    if ($statusCode -eq 429) {
        Write-Host "❌ Rate limited at request $i" -ForegroundColor Red
        break
    } else {
        Write-Host "✅ Request $i successful" -ForegroundColor Green
    }
    
    Start-Sleep -Milliseconds 500
}
```

### **Expected Behavior**

- Requests 1-10: ✅ HTTP 200
- Requests 11-15: ❌ HTTP 429 (Rate Limited)

---

## 🧪 Test 3: Security Logging Verification

After running tests, verify logs in Supabase:

```sql
-- Check recent chatbot queries
SELECT 
  event_type,
  details,
  severity,
  created_at,
  metadata
FROM security_logs
WHERE event_type = 'CHATBOT_QUERY'
ORDER BY created_at DESC
LIMIT 10;
```

### **Expected Logs**

| event_type | details | severity | metadata |
|------------|---------|----------|----------|
| CHATBOT_QUERY | Query: "What is QRiBar?" | INFO | {"documentsUsed": 2} |
| RATE_LIMIT_EXCEEDED | User exceeded rate limit | WARNING | {"attempt": 11} |

---

## 🧪 Test 4: Error Handling

### **Test Invalid Request**

```powershell
# Missing userQuery parameter
curl -X POST https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat `
  -H "Authorization: Bearer $ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{"invalid": "data"}'
```

**Expected Response:**
```json
{
  "error": "Invalid or missing userQuery parameter"
}
```
**Status Code:** 400

### **Test Missing Authorization**

```powershell
# No Authorization header
curl -X POST https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-chat `
  -H "Content-Type: application/json" `
  -d '{"userQuery": "test"}'
```

**Expected Response:**
```json
{
  "error": "Missing authorization header"
}
```
**Status Code:** 401

---

## 🧪 Test 5: Integration with Frontend

### **Update React Component**

```typescript
// src/features/chatbot/data/geminiChatRepository.ts
import { ENV } from '@/shared/config/env.config';

export class GeminiChatRepository {
  private readonly edgeFunctionUrl = `${ENV.SUPABASE_URL}/functions/v1/gemini-chat`;

  async sendMessage(
    userQuery: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userQuery,
          conversationHistory,
          maxDocuments: 3,
          similarityThreshold: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Edge Function error:', error);
      throw error;
    }
  }
}
```

---

## 📊 Monitoring Commands

### **View Real-Time Logs**

```powershell
# Stream logs from deployed function
supabase functions logs gemini-chat --project-ref tysjedvujvsmrzzrmesr
```

### **Check Function Status**

```powershell
# List all deployed functions
supabase functions list --project-ref tysjedvujvsmrzzrmesr
```

---

## ✅ Success Criteria

- [ ] **Test 1:** Chatbot responds with relevant answers
- [ ] **Test 2:** Rate limiting blocks after 10 requests
- [ ] **Test 3:** Security logs appear in `security_logs` table
- [ ] **Test 4:** Error responses return correct HTTP status codes
- [ ] **Test 5:** Frontend integration works without API key exposure

---

## 🔧 Troubleshooting

### **Issue: "Missing authorization header"**
**Solution:** Ensure `Authorization: Bearer YOUR_ANON_KEY` header is present

### **Issue: "Service configuration error"**
**Solution:** Run `.\scripts\deploy-edge-functions.ps1` to set secrets

### **Issue: "AI service temporarily unavailable"**
**Solution:** Check Gemini API quota at https://aistudio.google.com/

### **Issue: Rate limit not working**
**Solution:** In-memory rate limiter resets on function restart. Use Redis for production.

---

## 📝 Notes

- **Development:** Use local testing (`supabase functions serve`) before deploying
- **Production:** Monitor rate limits and adjust `maxRequests` if needed
- **Security:** Never expose `GEMINI_API_KEY` in frontend code
- **Scaling:** Consider upgrading to Redis-based rate limiting for multi-region support

---

**Last Updated:** 2026-01-29  
**Author:** SmartConnect AI Team
