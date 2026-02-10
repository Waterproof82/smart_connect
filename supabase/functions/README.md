# Supabase Edge Functions

This directory contains serverless functions that run on Supabase infrastructure (Deno runtime).

## Purpose

These Edge Functions act as a secure proxy layer between the React frontend and the Gemini API, preventing API key exposure in the browser.

## Functions

### 1. `gemini-embedding`
- **Endpoint:** `/functions/v1/gemini-embedding`
- **Method:** POST
- **Purpose:** Generate 768-dimensional embeddings for RAG vector search
- **Model:** `gemini-embedding-001`

**Request Body:**
```json
{
  "text": "¿Cuánto cuesta QRIBAR?"
}
```

**Response:**
```json
{
  "embedding": {
    "values": [0.123, -0.456, ...]
  }
}
```

### 2. `gemini-generate`
- **Endpoint:** `/functions/v1/gemini-generate`
- **Method:** POST
- **Purpose:** Generate AI responses with RAG context
- **Model:** `gemini-2.0-flash-exp`

**Request Body:**
```json
{
  "contents": [
    { "parts": [{ "text": "System prompt..." }] },
    { "parts": [{ "text": "User query..." }] }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 500
  }
}
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "AI response..." }]
      }
    }
  ]
}
```

## Deployment

See [EDGE_FUNCTIONS_DEPLOYMENT.md](../docs/EDGE_FUNCTIONS_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
```powershell
.\scripts\deploy-edge-functions.ps1
```

## Security

- ✅ API key stored server-side in Supabase secrets
- ✅ CORS configured for client requests
- ✅ HTTPS only
- ✅ No API key in browser

## Environment Variables

Required secrets in Supabase:
- `GEMINI_API_KEY` - Your Google AI Studio API key

Configure via:
```powershell
supabase secrets set GEMINI_API_KEY="your-key-here"
```

## Local Development

To test locally:

1. Install Supabase CLI:
```powershell
npm install -g supabase
```

2. Link project:
```powershell
supabase link --project-ref tysjedvujvsmrzzrmesr
```

3. Run locally:
```powershell
supabase functions serve
```

4. Test with cURL:
```powershell
curl -i --location --request POST 'http://localhost:54321/functions/v1/gemini-embedding' `
  --header 'Authorization: Bearer YOUR_ANON_KEY' `
  --header 'Content-Type: application/json' `
  --data '{"text":"test"}'
```

## Monitoring

View logs in Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/tysjedvujvsmrzzrmesr
2. Navigate to **Edge Functions**
3. Click on function name
4. View **Logs** tab

## Cost

**Free Tier:**
- 500K invocations/month
- 100GB bandwidth/month

**Paid:**
- $2 per million invocations after free tier

## References

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/)
- [Gemini API Documentation](https://ai.google.dev/docs)
