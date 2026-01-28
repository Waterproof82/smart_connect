# 🏗️ ARQUITECTURA - SmartConnect AI RAG Chatbot

## 📊 DIAGRAMA DE ARQUITECTURA COMPLETA

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🌐 NAVEGADOR (Browser)                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                    React App (Vite Dev Server)                            │ │
│  │                     http://localhost:5173                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ExpertAssistantWithRAG.tsx                                         │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  RAGService                                                     │ │ │ │
│  │  │  │  - generateEmbedding(text)                                      │ │ │ │
│  │  │  │  - searchSimilarDocs(query)                                     │ │ │ │
│  │  │  │  - generateWithRAG(query)                                       │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────┬───────────────────────────┘
                    │                                 │
                    │ ❌ NO EXPONE API KEY           │
                    │                                 │
                    │                                 │
        ┌───────────▼────────────┐       ┌───────────▼────────────┐
        │ supabase.functions     │       │ supabase.rpc()         │
        │ .invoke('gemini-...')  │       │ ('match_documents')    │
        └───────────┬────────────┘       └───────────┬────────────┘
                    │                                 │
                    │ HTTPS                           │ HTTPS
                    │ Authorization: Bearer           │ Authorization: Bearer
                    │ (Supabase ANON_KEY)             │ (Supabase ANON_KEY)
                    │                                 │
┌───────────────────▼─────────────────────────────────▼───────────────────────────┐
│                        🚀 SUPABASE INFRASTRUCTURE                               │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │   Edge Functions (Deno Runtime)     │  │   PostgreSQL + pgvector          │ │
│  │  ┌───────────────────────────────┐  │  │  ┌────────────────────────────┐ │ │
│  │  │  gemini-embedding             │  │  │  │  Table: documents          │ │ │
│  │  │  - Deno.env.get('API_KEY')   │  │  │  │  - id: UUID                │ │ │
│  │  │  - POST to Gemini API        │  │  │  │  - content: TEXT           │ │ │
│  │  │  - Return embedding          │  │  │  │  - metadata: JSONB         │ │ │
│  │  └───────────────────────────────┘  │  │  │  - embedding: VECTOR(768) │ │ │
│  │  ┌───────────────────────────────┐  │  │  └────────────────────────────┘ │ │
│  │  │  gemini-generate              │  │  │  ┌────────────────────────────┐ │ │
│  │  │  - Deno.env.get('API_KEY')   │  │  │  │  Function:                 │ │ │
│  │  │  - POST to Gemini API        │  │  │  │  match_documents(          │ │ │
│  │  │  - Return response           │  │  │  │    query_embedding,        │ │ │
│  │  └───────────────────────────────┘  │  │  │    match_threshold,        │ │ │
│  │                                      │  │  │    match_count             │ │ │
│  │  🔑 Secrets (Server-Side):          │  │  │  )                         │ │ │
│  │  - GEMINI_API_KEY (hidden)          │  │  │  Returns: Similar docs     │ │ │
│  └──────────────┬───────────────────────┘  │  └────────────────────────────┘ │ │
│                 │                           │                                  │
│                 │ HTTPS (with API key)      │  🔐 RLS Policies:                │
│                 │                           │  - SELECT: anon, authenticated   │
│                 │                           │  - INSERT: service_role          │
└─────────────────┼───────────────────────────┴──────────────────────────────────┘
                  │
                  │
┌─────────────────▼─────────────────────────────────────────────────────────────┐
│                      🤖 GOOGLE GEMINI API                                      │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  text-embedding-004                 │  │  gemini-2.0-flash-exp        │   │
│  │  - Input: Text string               │  │  - Input: Prompt + Context   │   │
│  │  - Output: 768-dim embedding        │  │  - Output: AI response       │   │
│  │  - Free: 1,500 requests/day         │  │  - Free: 1,500 requests/day  │   │
│  └─────────────────────────────────────┘  └──────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS: PREGUNTA DEL USUARIO

### 1️⃣ Usuario pregunta: "¿Cuánto cuesta QRIBAR?"

```
React Component (handleSend)
    │
    ├─> setMessages([...prev, { role: 'user', content: userMessage }])
    │
    └─> ragService.generateWithRAG(userMessage)
            │
            ├─> generateEmbedding(userMessage)
            │       │
            │       └─> supabase.functions.invoke('gemini-embedding', { body: { text } })
            │               │
            │               └─> Supabase Edge Function (Deno)
            │                       │
            │                       └─> POST https://generativelanguage.googleapis.com/...
            │                           Header: x-goog-api-key: {GEMINI_API_KEY from Deno.env}
            │                           Body: { content: { parts: [{ text }] } }
            │                               │
            │                               └─> Returns: { embedding: { values: [768 floats] } }
            │
            ├─> searchSimilarDocs(embedding)
            │       │
            │       └─> supabase.rpc('match_documents', {
            │               query_embedding: embedding,
            │               match_threshold: 0.3,
            │               match_count: 5
            │           })
            │               │
            │               └─> PostgreSQL Function (SECURITY DEFINER)
            │                       │
            │                       └─> SELECT * FROM documents
            │                           WHERE 1 - (embedding <=> query_embedding) > match_threshold
            │                           ORDER BY similarity DESC
            │                           LIMIT match_count
            │                               │
            │                               └─> Returns: [
            │                                     { content: "QRIBAR cuesta $200 USD...", similarity: 0.78 },
            │                                     { content: "Incluye hosting...", similarity: 0.65 }
            │                                   ]
            │
            └─> generateWithRAG(query, relevantDocs)
                    │
                    └─> Build systemPrompt with context:
                        "Eres el Asistente de SmartConnect...
                         INFORMACIÓN DE LA BASE DE CONOCIMIENTO:
                         - QRIBAR cuesta $200 USD...
                         - Incluye hosting..."
                        │
                        └─> supabase.functions.invoke('gemini-generate', {
                                body: {
                                    contents: [
                                        { parts: [{ text: systemPrompt }] },
                                        { parts: [{ text: userQuery }] }
                                    ],
                                    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                                }
                            })
                                │
                                └─> Supabase Edge Function (Deno)
                                        │
                                        └─> POST https://generativelanguage.googleapis.com/...
                                            Header: x-goog-api-key: {GEMINI_API_KEY from Deno.env}
                                            Body: { contents, generationConfig }
                                                │
                                                └─> Returns: {
                                                      candidates: [{
                                                        content: {
                                                          parts: [{
                                                            text: "QRIBAR tiene un costo único de $200 USD..."
                                                          }]
                                                        }
                                                      }]
                                                    }
```

### 2️⃣ Respuesta mostrada al usuario

```
React Component (setMessages)
    │
    └─> [...prev, { role: 'assistant', content: response }]
            │
            └─> UI Update (React re-render)
                    │
                    └─> Chatbot muestra: "QRIBAR tiene un costo único de $200 USD..."
```

---

## 🔒 SEGURIDAD: COMPARACIÓN

### ❌ ANTES (Insecuro)

```
React Component
    │
    └─> fetch(`https://generativelanguage.googleapis.com/...?key=AIzaSy...`)
            ↑
            ❌ API KEY EXPUESTA EN EL NAVEGADOR
            
DevTools Network Tab:
Request URL: https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=AIzaSy***[EXPUESTA]
                                                                                                            ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                                                                                            ❌ VISIBLE EN EL NAVEGADOR
```

### ✅ DESPUÉS (Seguro)

```
React Component
    │
    └─> supabase.functions.invoke('gemini-embedding')
            │
            └─> Supabase Edge Function (Server-Side)
                    │
                    └─> fetch(`https://generativelanguage.googleapis.com/...`, {
                            headers: { 'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') }
                        })
                        ↑
                        ✅ API KEY OCULTA (SERVER-SIDE)

DevTools Network Tab:
Request URL: https://tysjedvujvsmrzzrmesr.supabase.co/functions/v1/gemini-embedding
Request Headers:
  Authorization: Bearer eyJhbGciOiJI... (Supabase ANON_KEY, pública y segura)
                         ↑↑↑↑↑↑↑↑↑↑↑↑
                         ✅ NO EXPONE GEMINI_API_KEY
```

---

## 📦 ESTRUCTURA DE DATOS

### Documento en Supabase

```json
{
  "id": "uuid-1234-5678",
  "content": "QRIBAR es nuestro producto estrella: una carta digital interactiva con código QR...",
  "metadata": {
    "title": "QRIBAR - Producto Principal",
    "category": "producto",
    "pricing": "$200 USD único",
    "last_updated": "2026-01-26"
  },
  "embedding": [0.123, -0.456, 0.789, ...] // 768 floats
}
```

### Resultado de match_documents

```json
[
  {
    "id": "uuid-1234-5678",
    "content": "QRIBAR es nuestro producto estrella...",
    "metadata": { "title": "QRIBAR - Producto Principal", ... },
    "similarity": 0.78
  },
  {
    "id": "uuid-8765-4321",
    "content": "El precio incluye hosting gratuito por 1 año...",
    "metadata": { "title": "QRIBAR - Detalles de Pricing", ... },
    "similarity": 0.65
  }
]
```

---

## 🎯 CAPAS DE LA ARQUITECTURA

### 1. **Presentation Layer** (React)
- **Componente:** `ExpertAssistantWithRAG.tsx`
- **Responsabilidad:** UI, manejo de estado, eventos del usuario
- **Tecnologías:** React, TypeScript, Tailwind CSS

### 2. **Service Layer** (Client-Side)
- **Clase:** `RAGService`
- **Responsabilidad:** Orquestación de llamadas a Supabase
- **Tecnologías:** Supabase Client SDK

### 3. **Serverless Layer** (Edge Functions)
- **Funciones:** `gemini-embedding`, `gemini-generate`
- **Responsabilidad:** Proxy seguro a Gemini API
- **Tecnologías:** Deno, Supabase Edge Functions

### 4. **Data Layer** (PostgreSQL)
- **Base de datos:** Supabase PostgreSQL
- **Responsabilidad:** Almacenamiento de embeddings, búsqueda vectorial
- **Tecnologías:** pgvector, RLS policies

### 5. **AI Layer** (Gemini API)
- **Modelos:** text-embedding-004, gemini-2.0-flash-exp
- **Responsabilidad:** Generación de embeddings y respuestas
- **Tecnologías:** Google Generative AI

---

## 💰 COSTOS ESTIMADOS

### Free Tier (MVP)
| Componente | Límite Free | Costo Excedente |
|------------|-------------|-----------------|
| Supabase Edge Functions | 500K invocaciones/mes | $2 por millón |
| Supabase Database | 500 MB storage | $0.125/GB-mes |
| Supabase Bandwidth | 5 GB/mes | $0.09/GB |
| Gemini Embeddings | 1,500 requests/día | Gratis |
| Gemini Generation | 1,500 requests/día | Gratis |

**Total MVP:** $0/mes (dentro del free tier)

### Estimación con Tráfico (1,000 usuarios/mes)
- Promedio 5 preguntas/usuario = 5,000 queries/mes
- 2 llamadas/query (1 embedding + 1 generation) = 10,000 llamadas/mes
- **Costo:** $0 (muy por debajo del límite de 500K)

---

## 🔄 CICLO DE VIDA DE UNA PETICIÓN

```
1. Usuario escribe pregunta → 50ms (UI input)
2. React envía a RAGService → 10ms (client-side)
3. Generate embedding (Edge Function) → 300-500ms (Gemini API)
4. Search similar docs (PostgreSQL) → 50-100ms (vector search)
5. Generate response (Edge Function) → 800-1200ms (Gemini API)
6. Display response → 20ms (React render)

⏱️ TOTAL: ~1.2-2 segundos (aceptable para chatbot)
```

---

## 📊 MÉTRICAS DE RENDIMIENTO

### Latencia Objetivo
- ✅ Embedding generation: < 500ms
- ✅ Vector search: < 100ms
- ✅ Response generation: < 1500ms
- ✅ **Total:** < 2 segundos

### Precisión RAG
- Similarity threshold: 0.3 (30%)
- Top K documents: 5
- Expected relevance: > 70%

### Disponibilidad
- Supabase SLA: 99.9%
- Gemini API SLA: 99.95%
- **Total esperado:** 99.85%

---

*Diagrama actualizado: 2026-01-26*
