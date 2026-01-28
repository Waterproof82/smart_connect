# 🏗️ ARQUITECTURA - SmartConnect AI RAG Chatbot

## 🧱 CLEAN ARCHITECTURE OVERVIEW

SmartConnect AI sigue los principios de **Clean Architecture** (Uncle Bob) con separación estricta de capas y flujo de dependencias hacia adentro.

### Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         📱 PRESENTATION LAYER                                   │
│                         (React Components, UI)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ExpertAssistantWithRAG.tsx                                             │   │
│  │  - useState, useRef (React Hooks)                                       │   │
│  │  - ChatSessionEntity for state management                               │   │
│  │  - Dependency Injection via ChatbotContainer                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ChatbotContainer (Dependency Injection)                                │   │
│  │  - Wires Data Sources → Repositories → Use Cases                        │   │
│  │  - Singleton pattern with getChatbotContainer()                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │ Calls Use Cases
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🧠 DOMAIN LAYER                                       │
│                      (Business Logic, Pure TS)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Use Cases (Business Logic Orchestration)                               │   │
│  │  ✅ GenerateResponseUseCase                                              │   │
│  │     - execute(userQuery, conversationHistory)                           │   │
│  │     - Orchestrates: search docs → build context → generate response     │   │
│  │  ✅ SearchDocumentsUseCase                                               │   │
│  │     - execute(query, limit, threshold)                                  │   │
│  │     - Logic: generate embedding → search similar docs                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Entities (Domain Objects)                                              │   │
│  │  ✅ MessageEntity: Immutable message with validation                     │   │
│  │  ✅ DocumentEntity: Document with similarity scoring                     │   │
│  │  ✅ ChatSessionEntity: Aggregate for message management                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Repository Interfaces (Contracts)                                      │   │
│  │  ✅ IChatRepository                                                      │   │
│  │  ✅ IEmbeddingRepository                                                 │   │
│  │  ✅ IDocumentRepository                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┲──────────────────────────────────────────────┘
                                   ┃ Implements
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          💾 DATA LAYER                                          │
│                   (Infrastructure, External APIs)                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Repository Implementations                                             │   │
│  │  ✅ ChatRepositoryImpl (implements IChatRepository)                      │   │
│  │  ✅ EmbeddingRepositoryImpl (implements IEmbeddingRepository)            │   │
│  │  ✅ DocumentRepositoryImpl (implements IDocumentRepository)              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Data Sources (External Communication)                                  │   │
│  │  ✅ GeminiDataSource                                                     │   │
│  │     - generateEmbedding() → Supabase Edge Function                      │   │
│  │     - generateResponse() → Supabase Edge Function                       │   │
│  │  ✅ SupabaseDataSource                                                   │   │
│  │     - searchSimilarDocuments() → PostgreSQL pgvector                    │   │
│  │     - storeDocument() → PostgreSQL INSERT                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each class has one reason to change (e.g., `MessageEntity` only handles message data, `GenerateResponseUseCase` only orchestrates RAG) |
| **O**pen/Closed | Repository interfaces allow extension (new data sources) without modifying existing code |
| **L**iskov Substitution | All repository implementations can replace their interfaces without breaking functionality |
| **I**nterface Segregation | Small, focused interfaces (`IChatRepository`, `IEmbeddingRepository`, `IDocumentRepository`) instead of one large interface |
| **D**ependency Inversion | High-level modules (Use Cases) depend on abstractions (Repository Interfaces), not concrete implementations |

---

## 📊 DIAGRAMA DE ARQUITECTURA COMPLETA (Infraestructura)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🌐 NAVEGADOR (Browser)                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                    React App (Vite Dev Server)                            │ │
│  │                     http://localhost:5173                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ExpertAssistantWithRAG.tsx (Presentation Layer)                    │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  ChatbotContainer (Dependency Injection)                        │ │ │ │
│  │  │  │  - generateResponseUseCase.execute()                            │ │ │ │
│  │  │  │  - searchDocumentsUseCase.execute()                             │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────────┘ │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Domain Layer (Business Logic)                                  │ │ │ │
│  │  │  │  - GenerateResponseUseCase                                      │ │ │ │
│  │  │  │  - IChatRepository, IEmbeddingRepository, IDocumentRepository  │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────────┘ │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Data Layer (Infrastructure)                                    │ │ │ │
│  │  │  │  - ChatRepositoryImpl, EmbeddingRepositoryImpl                  │ │ │ │
│  │  │  │  - GeminiDataSource, SupabaseDataSource                         │ │ │ │
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
│  │  │  - Deno.env.get('API_KEY')    │  │  │  │  - id: UUID                │ │ │
│  │  │  - POST to Gemini API         │  │  │  │  - content: TEXT           │ │ │
│  │  │  - Return embedding           │  │  │  │  - metadata: JSONB         │ │ │
│  │  └───────────────────────────────┘  │  │  │  - embedding: VECTOR(768) │ │ │
│  │  ┌───────────────────────────────┐  │  │  └────────────────────────────┘ │ │
│  │  │  gemini-generate              │  │  │  ┌────────────────────────────┐ │ │
│  │  │  - Deno.env.get('API_KEY')    │  │  │  │  Function:                 │ │ │
│  │  │  - POST to Gemini API         │  │  │  │  match_documents(          │ │ │
│  │  │  - Return response            │  │  │  │    query_embedding,        │ │ │
│  │  └───────────────────────────────┘  │  │  │    match_threshold,        │ │ │
│  │                                     │  │  │    match_count             │ │ │
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

## 🔄 FLUJO DE DATOS: PREGUNTA DEL USUARIO (Clean Architecture)

### 1️⃣ Usuario pregunta: "¿Cuánto cuesta QRIBAR?"

```
React Component (handleSend)
    │
    ├─> Create MessageEntity({ role: 'user', content: userMessage })
    ├─> chatSessionRef.current.addMessage(userEntity)
    │
    └─> container.generateResponseUseCase.execute({
            userQuery: userMessage,
            conversationHistory: chatSessionRef.current.messages,
            maxDocuments: 3,
            similarityThreshold: 0.3
        })
        │
        ┌───────────────────────────────────────────────────────────┐
        │  DOMAIN LAYER: GenerateResponseUseCase                    │
        └───────────────────────────────────────────────────────────┘
        │
        ├─> embeddingRepository.generateEmbedding(userQuery)
        │       │
        │       ┌───────────────────────────────────────────────────┐
        │       │  DATA LAYER: EmbeddingRepositoryImpl              │
        │       └───────────────────────────────────────────────────┘
        │       │
        │       └─> geminiDataSource.generateEmbedding(userQuery)
        │               │
        │               ┌───────────────────────────────────────────┐
        │               │  DATA SOURCE: GeminiDataSource            │
        │               └───────────────────────────────────────────┘
        │               │
        │               └─> supabase.functions.invoke('gemini-embedding', { body: { text } })
        │                       │
        │                       └─> Supabase Edge Function (Deno)
        │                               │
        │                               └─> POST https://generativelanguage.googleapis.com/...
        │                                   Header: x-goog-api-key: {GEMINI_API_KEY from Deno.env}
        │                                   Body: { content: { parts: [{ text }] } }
        │                                       │
        │                                       └─> Returns: { embedding: { values: [768 floats] } }
        │
        ├─> documentRepository.searchSimilarDocuments({
        │       queryEmbedding: embedding,
        │       threshold: 0.3,
        │       limit: 3
        │   })
        │       │
        │       ┌───────────────────────────────────────────────────┐
        │       │  DATA LAYER: DocumentRepositoryImpl              │
        │       └───────────────────────────────────────────────────┘
        │       │
        │       └─> supabaseDataSource.searchSimilarDocuments({
        │               queryEmbedding: embedding,
        │               matchThreshold: 0.3,
        │               matchCount: 3
        │           })
        │               │
        │               ┌───────────────────────────────────────────┐
        │               │  DATA SOURCE: SupabaseDataSource          │
        │               └───────────────────────────────────────────┘
        │               │
        │               └─> supabase.rpc('match_documents', {
        │                       query_embedding: embedding,
        │                       match_threshold: 0.3,
        │                       match_count: 3
        │                   })
        │                       │
        │                       └─> PostgreSQL Function (SECURITY DEFINER)
        │                               │
        │                               └─> SELECT * FROM documents
        │                                   WHERE 1 - (embedding <=> query_embedding) > match_threshold
        │                                   ORDER BY similarity DESC
        │                                   LIMIT match_count
        │                                       │
        │                                       └─> Returns: [
        │                                             { id, content, metadata, similarity },
        │                                             ...
        │                                           ]
        │                                           │
        │                                           └─> Map to DocumentEntity[]
        │
        └─> chatRepository.generateResponse({
                systemPrompt: "Eres el Asistente...",
                userQuery: userMessage,
                context: relevantDocs.map(d => d.content).join('\n\n'),
                conversationHistory: []
            })
                │
                ┌───────────────────────────────────────────────────┐
                │  DATA LAYER: ChatRepositoryImpl                   │
                └───────────────────────────────────────────────────┘
                │
                └─> geminiDataSource.generateResponse({...})
                        │
                        └─> supabase.functions.invoke('gemini-generate', {
                                body: {
                                    contents: [
                                        { parts: [{ text: systemPrompt + context + userQuery }] }
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
GenerateResponseUseCase.execute() returns:
    {
      response: "QRIBAR tiene un costo único de $200 USD...",
      contextUsed: "QRIBAR cuesta $200 USD...\n\nIncluye hosting...",
      documentsFound: 2
    }
    │
    └─> React Component (handleSend)
            │
            ├─> Create MessageEntity({ role: 'assistant', content: result.response })
            ├─> chatSessionRef.current.addMessage(assistantEntity)
            │
            └─> UI Update (React re-render)
                    │
                    └─> Chatbot muestra: "QRIBAR tiene un costo único de $200 USD..."
```

### Key Benefits of Clean Architecture Flow

| Aspect | Benefit |
|--------|---------|
| **Testability** | Can mock repositories to test use cases without hitting real APIs |
| **Flexibility** | Can swap Supabase for another database by changing `DocumentRepositoryImpl` |
| **Maintainability** | Clear separation of concerns (business logic in domain, infrastructure in data) |
| **Scalability** | Easy to add new use cases (e.g., `DeleteMessageUseCase`) without touching infrastructure |
| **SOLID Compliance** | All five principles applied (SRP, OCP, LSP, ISP, DIP) |

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

## 📁 ESTRUCTURA DEL PROYECTO

### Clean Architecture + Feature-Based Structure

```
smart-connect/
│
├── 📂 src/                           # Source code principal
│   ├── 📂 core/                      # ⚙️ SHARED SCOPE - Lógica Global
│   │   ├── 📂 domain/               
│   │   │   ├── entities/            # Entidades globales (User, Business, etc.)
│   │   │   ├── usecases/            # Casos de uso compartidos
│   │   │   └── repositories/        # Interfaces de repositorios
│   │   └── 📂 data/
│   │       ├── repositories/        # Implementaciones de repositorios
│   │       └── datasources/         # APIs, LocalStorage, etc.
│   │
│   ├── 📂 features/                  # 🎯 LOCAL SCOPE - Features Independientes
│   │   ├── 📂 landing/              # Landing Page (SEO)
│   │   │   └── presentation/
│   │   │       └── components/      # Navbar, Hero, Features, Stats, Contact
│   │   │
│   │   ├── 📂 qribar/               # 🍔 QRIBAR - Producto Estrella
│   │   │   ├── presentation/        # UI Components
│   │   │   ├── domain/              # Business Logic (Menu, Orders)
│   │   │   └── data/                # API Calls, Cache
│   │   │
│   │   ├── 📂 chatbot/              # 🤖 Asistente Experto RAG
│   │   │   ├── presentation/        # ExpertAssistant Component
│   │   │   ├── domain/              # Conversation Logic, RAG
│   │   │   └── data/                # Gemini API Integration (train_rag.js)
│   │   │
│   │   └── 📂 lead-scoring/         # 🌡️ Análisis de Temperatura del Lead
│   │       ├── presentation/        # Lead Dashboard
│   │       ├── domain/              # Scoring Algorithm
│   │       └── data/                # n8n Integration, Google Sheets
│   │
│   ├── 📂 shared/                    # 🔄 SHARED SCOPE - Utilidades Comunes
│   │   ├── components/              # DashboardPreview, etc.
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # env.config.ts (Security)
│   │   ├── types/                   # TypeScript types compartidos
│   │   └── constants/               # Constantes globales
│   │
│   ├── App.tsx                      # Root Component
│   └── main.tsx                     # Entry Point
│
├── 📂 supabase/                      # 🚀 Supabase Infrastructure
│   └── functions/                   # Edge Functions (Deno)
│       ├── gemini-embedding/        # Embedding generation
│       └── gemini-generate/         # Response generation
│
├── 📂 tests/                         # 🧪 Testing - TDD
│   ├── unit/                        # Unit Tests
│   ├── integration/                 # Integration Tests
│   ├── e2e/                         # End-to-End Tests
│   ├── test_gemini_generate.js     # Edge Function tests
│   ├── setup.ts                     # Jest Configuration
│   └── README.md                    # TDD Guide
│
├── 📂 scripts/                       # 🔧 Automation Scripts
│   └── deploy-edge-functions.ps1   # Deploy Edge Functions
│
├── 📂 docs/                          # 📚 Documentación Técnica
│   ├── adr/                         # Architecture Decision Records
│   ├── audit/                       # Audit Logs
│   ├── context/                     # Context for AI Agents
│   ├── CHATBOT_RAG_ARCHITECTURE.md  # RAG técnico completo
│   ├── CONTACT_FORM_WEBHOOK.md      # Webhook integration
│   └── EDGE_FUNCTIONS_DEPLOYMENT.md # Edge Functions guide
│
├── 📂 public/                        # Static Assets
│   └── assets/                      # Images, Icons, etc.
│
├── 📄 AGENTS.md                     # AI Agent protocols
├── 📄 ARQUITECTURA.md               # This file - System architecture
├── 📄 CHANGELOG.md                  # Version history
├── 📄 README.md                     # Project documentation
├── 📄 index.html                    # HTML Template
├── 📄 vite.config.ts                # Vite Configuration
├── 📄 tsconfig.json                 # TypeScript Configuration
├── 📄 jest.config.ts                # Jest Configuration
├── 📄 package.json                  # Dependencies & Scripts
├── 📄 .env.example                  # Environment Variables Template
└── 📄 .gitignore                    # Git Ignore Rules
```

### 🎯 Dependency Flow (Scope Rule)

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION LAYER (UI)                        │
│  - Components, Pages, Hooks                     │
└─────────────────┬───────────────────────────────┘
                  │ ↓ Depends on
┌─────────────────────────────────────────────────┐
│  DOMAIN LAYER (Business Logic)                  │
│  - Use Cases, Entities, Repository Interfaces   │
└─────────────────┬───────────────────────────────┘
                  │ ↓ Depends on
┌─────────────────────────────────────────────────┐
│  DATA LAYER (Infrastructure)                    │
│  - API Calls, Local Storage, External Services  │
└─────────────────────────────────────────────────┘
```

**⚠️ GOLDEN RULE:** Dependencies flow inward. Domain never knows Presentation. Data implements Domain interfaces.

### 📚 Import Paths Examples

```typescript
// ✅ Shared Scope (Global)
import { ENV } from '@shared/config/env.config';
import { DashboardPreview } from '@shared/components';
import { formatCurrency } from '@shared/utils';

// ✅ Local Scope (Feature)
import { Hero } from '@features/landing/presentation/components';
import { QRIBARSection } from '@features/qribar/presentation';
import { ExpertAssistant } from '@features/chatbot/presentation';

// ✅ Core (Business Logic Global)
import { User } from '@core/domain/entities';
import { UserRepository } from '@core/data/repositories';
```

---

*Diagrama actualizado: 2026-01-26*
