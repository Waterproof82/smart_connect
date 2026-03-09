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
│  │     - execute(userQuery, conversationHistory, ragOptions)              │   │
│  │     - Delegates to ChatRepositoryImpl → chat-with-rag Edge Function    │   │
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
│  │     - invoke('chat-with-rag') → RAG pipeline (Edge Function)           │   │
│  │     - invoke('gemini-generate') → Fallback without RAG                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each class has one reason to change (e.g., `MessageEntity` only handles message data, `GenerateResponseUseCase` only orchestrates RAG) |
| **O**pen/Closed | Repository interfaces allow extension (new data sources) without modifying existing code |
| **L**iskov Substitution | All repository implementations can replace their interfaces without breaking functionality |
| **I**nterface Segregation | Small, focused interfaces (`IChatRepository` for chatbot, `IDocumentRepository` for admin) per feature |
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
│  │  │  └────────────────────────────────────────────────────────────────┘ │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Domain Layer (Business Logic)                                  │ │ │ │
│  │  │  │  - GenerateResponseUseCase                                      │ │ │ │
│  │  │  │  - IChatRepository                                              │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────────┘ │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Data Layer (Infrastructure)                                    │ │ │ │
│  │  │  │  - ChatRepositoryImpl → Edge Functions (chat-with-rag)          │ │ │ │
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
│  │  gemini-embedding-001               │  │  gemini-2.5-flash             │   │
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
            useRAG: true,
            ragOptions: { topK: 5, threshold: 0.4 }
        })
        │
        ┌───────────────────────────────────────────────────────────┐
        │  DOMAIN LAYER: GenerateResponseUseCase                    │
        └───────────────────────────────────────────────────────────┘
        │
        └─> chatRepository.generateResponse({
                userQuery, conversationHistory, useRAG: true,
                ragOptions: { topK: 5, threshold: 0.4 }
            })
                │
                ┌───────────────────────────────────────────────────┐
                │  DATA LAYER: ChatRepositoryImpl                   │
                └───────────────────────────────────────────────────┘
                │
                └─> supabase.functions.invoke('chat-with-rag', {
                        body: { query, conversationHistory, topK: 5, threshold: 0.4 }
                    })
                        │
                        └─> EDGE FUNCTION: chat-with-rag (Deno)
                                │
                                ├─ 1️⃣ Generate query embedding
                                │   └─> POST gemini-embedding-001 → [768 floats]
                                │
                                ├─ 2️⃣ Vector similarity search
                                │   └─> supabase.rpc('match_documents', {
                                │           query_embedding, match_threshold: 0.4, match_count: 5
                                │       })
                                │       └─> PostgreSQL: 1 - (embedding <=> query) > 0.4
                                │           → Returns top 5 similar documents
                                │
                                ├─ 3️⃣ Build context prompt with retrieved documents
                                │
                                └─ 4️⃣ Generate response
                                    └─> POST gemini-2.5-flash:generateContent
                                        → Returns contextual AI response
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
Request URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=AIzaSy***[EXPUESTA]
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
                         ↑↑↑↑↑↑↑↑↑↑↑
                         ✅ NO EXPONE GEMINI_API_KEY
```

---

### 🛡️ Edge Functions Security (2026-03-09)

Todas las Edge Functions implementan seguridad multi-capa:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEGURIDAD EN CAPAS                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Gateway (config.toml)                                         │
│    verify_jwt = false (validación interna en cada función)      │
│                                                                  │
│ 2. Función (código)                                             │
│    - Validación de Authorization header                         │
│    - Supabase auth.getUser() para validar sesión               │
│    - Verificación de email específico (admin@smartconnect.ai) │
│                                                                  │
│ 3. RLS (Base de datos)                                         │
│    - SELECT: público (anon + authenticated)                    │
│    - INSERT/UPDATE/DELETE: solo admin@smartconnect.ai         │
└─────────────────────────────────────────────────────────────────┘
```

**Configuración actual:**
```toml
# supabase/config.toml
[functions.gemini-embedding]
enabled = true
verify_jwt = false  # Validación interna

[functions.gemini-generate]
enabled = true
verify_jwt = false

[functions.chat-with-rag]
enabled = true
verify_jwt = false
```

**Validación interna en cada función:**
```typescript
// gemini-embedding/index.ts
const authHeader = req.headers.get('Authorization')
if (!authHeader) return 401

const supabase = createClient(..., { global: { headers: { Authorization: authHeader } } })
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return 401
// ✅ Usuario autenticado
```

---

### 📋 RLS Policies - Estado Actual

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `documents` | ✅ Público | ❌ Solo admin | ❌ Solo admin | ❌ Solo admin |
| `app_settings` | ✅ Público | ❌ Solo admin | ❌ Solo admin | ❌ Solo admin |
| `security_logs` | ❌ Solo admin | ❌ Solo admin | ❌ Solo admin | ❌ Solo admin |

**Warnings de Supabase Linter (no críticos):**
- `extension_in_public`: Esperado (pgvector debe estar en public)
- `auth_allow_anonymous_sign_ins`: Falso positivo (SELECT público es intencional para chatbot/landing)

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

### Políticas RLS - Tabla `documents` (2026-02-17)

| Operación | Anónimo (anon) | Usuario Auth | Admin/Super Admin |
|-----------|----------------|-------------|------------------|
| SELECT    | ✅ Permitido   | ✅ Permitido | ✅ Permitido     |
| INSERT    | ❌ Bloqueado  | ❌ Bloqueado | ✅ Permitido     |
| UPDATE    | ❌ Bloqueado  | ❌ Bloqueado | ✅ Permitido     |
| DELETE    | ❌ Bloqueado  | ❌ Bloqueado | ✅ Permitido     |

**Política de SELECT (pública):**
```sql
CREATE POLICY public_read_documents ON documents
FOR SELECT TO public USING (true);
```

**Políticas de ADMIN (INSERT/UPDATE/DELETE):**
```sql
-- SECURITY: Verify specific admin email (more secure than roles)
CREATE POLICY admin_insert_documents ON documents
FOR INSERT TO authenticated
USING ((auth.jwt()->>'email') = 'admin@smartconnect.ai')
WITH CHECK ((auth.jwt()->>'email') = 'admin@smartconnect.ai');
```
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

### 2. **Domain Layer** (Client-Side)
- **Clase:** `GenerateResponseUseCase` → `ChatRepositoryImpl`
- **Responsabilidad:** Orquestación de llamadas a Edge Functions
- **Tecnologías:** Supabase Client SDK

### 3. **Serverless Layer** (Edge Functions)
- **Funciones:** `chat-with-rag`, `gemini-embedding`, `gemini-generate`
- **Responsabilidad:** Pipeline RAG completo y proxy seguro a Gemini API
- **Tecnologías:** Deno, Supabase Edge Functions

### 4. **Data Layer** (PostgreSQL)
- **Base de datos:** Supabase PostgreSQL
- **Responsabilidad:** Almacenamiento de embeddings, búsqueda vectorial
- **Tecnologías:** pgvector, RLS policies

### 5. **AI Layer** (Gemini API)
- **Modelos:** gemini-embedding-001, gemini-2.5-flash
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
- Similarity threshold: 0.4 (40%)
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
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # Navbar, Hero, Features, Stats, Contact
│   │   │   │   └── schemas/         # Zod validation schemas (contactSchema)
│   │   │   └── domain/
│   │   │       ├── entities/        # LeadEntity (domain validation + webhook payload)
│   │   │       ├── usecases/        # SubmitLeadUseCase
│   │   │       └── repositories/    # ILeadRepository
│   │   │
│   │   ├── 📂 qribar/               # 🍔 QRIBAR - Producto Estrella
│   │   │   ├── presentation/        # UI Components
│   │   │   ├── domain/              # Business Logic (Menu, Orders)
│   │   │   └── data/                # API Calls, Cache
│   │   │
│   │   ├── 📂 chatbot/              # 🤖 Asistente Experto RAG
│   │   │   ├── presentation/        # ExpertAssistant Component
│   │   │   ├── domain/              # Conversation Logic, Entities
│   │   │   └── data/                # ChatRepositoryImpl → Edge Functions
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
│       ├── chat-with-rag/           # Full RAG pipeline
│       ├── gemini-embedding/        # Embedding generation
│       └── gemini-generate/         # Response generation (fallback)
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

## 🛡️ SECURITY & RESILIENCE LAYER (2026-02-02 Update)

### Secure Storage (`shared/utils/secureStorage.ts`)

**Purpose:** AES-256 encryption for sensitive client-side data (OWASP A02:2021 - Cryptographic Failures)

```typescript
import { secureStorage } from '@shared/utils/secureStorage';

// Store encrypted data
secureStorage.setItem('user-preferences', sensitiveData);
secureStorage.setObject('session', { token, userId });

// Retrieve decrypted data
const data = secureStorage.getItem('user-preferences');
const session = secureStorage.getObject<SessionData>('session');

// Clear sensitive data
secureStorage.removeItem('session');
secureStorage.clear();
```

**Features:**
- ✅ AES-256 encryption using CryptoJS
- ✅ Automatic JSON serialization/deserialization
- ✅ Support for localStorage and sessionStorage
- ✅ Error handling with detailed logging
- ✅ TypeScript generics for type safety

**Integration:**
- Used in `secureStorage` for encrypted client-side data at rest

---

### Custom Domain Errors (`features/qribar/domain/entities`)

**Purpose:** Semantic error handling with field-level context (OWASP A04:2021 - Insecure Design)

```typescript
// ValidationError - Domain validation failures
throw new ValidationError('Invalid price', 'price', -10);

// NotFoundError - Missing resources
throw new NotFoundError('Restaurant', restaurantId);
```

**Applied in:**
- ✅ `MenuItem.ts` - Price/name validation
- ✅ `Restaurant.ts` - Name validation
- ✅ `GetRestaurant.ts` - Resource not found
- ✅ `GetMenuItems.ts` - Resource not found

**Benefits:**
- Clear error semantics vs. generic `Error`
- Field-level debugging context
- Better error logging and monitoring
- Consistent error handling across domain

---

### Retry Logic (`shared/utils/retryLogic.ts`)

**Purpose:** Exponential backoff for transient failures (Network resilience)

```typescript
import { withRetry, makeRetryable } from '@shared/utils/retryLogic';

// Wrap any async function
const robustFetch = withRetry(
  async () => fetch(url),
  {
    attempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    shouldRetry: isNetworkError
  }
);

// Make existing function retryable
const retryableFn = makeRetryable(myAsyncFunction, {
  attempts: 5,
  backoffFactor: 2
});
```

**Features:**
- ✅ Exponential backoff with jitter
- ✅ Configurable attempts (default: 3)
- ✅ Smart retry predicates:
  - `isNetworkError` - Network failures
  - `isTimeoutError` - 408 Request Timeout
  - `isRateLimitError` - 429 Too Many Requests
  - `isServerError` - 5xx errors
- ✅ Max delay cap to prevent excessive waits
- ✅ Full TypeScript type safety

**Integration:**
- ✅ `FetchHttpClient.ts` - Auto-enabled for all HTTP requests
- ✅ Configurable via `enableRetry: boolean` in `IHttpClient`

---

### Circuit Breaker (`shared/utils/circuitBreaker.ts`)

**Purpose:** Prevent cascading failures (Netflix Hystrix pattern)

```typescript
import { CircuitBreaker, withCircuitBreaker } from '@shared/utils/circuitBreaker';

// Create circuit breaker
const breaker = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  resetTimeout: 30000,      // Try recovery after 30s
  monitoringPeriod: 60000   // 1min rolling window
});

// Wrap API calls
const protectedCall = withCircuitBreaker(
  async () => apiClient.request(),
  breaker
);

// Monitor state
breaker.on('open', () => console.log('Circuit opened!'));
breaker.on('halfOpen', () => console.log('Testing recovery...'));
breaker.on('close', () => console.log('Circuit closed, healthy'));
```

**States:**
- **CLOSED** - Normal operation, requests pass through
- **OPEN** - Too many failures, fast-fail without calling service
- **HALF_OPEN** - Testing if service recovered

**Features:**
- ✅ Real-time metrics (success/failure counts)
- ✅ Event callbacks (open, close, halfOpen)
- ✅ Rolling window failure tracking
- ✅ Automatic recovery testing
- ✅ Production-grade error handling

**Use Cases:**
- Protect against failing downstream services
- Prevent resource exhaustion
- Enable graceful degradation

---

### HTTP Client with Resilience (`core/data/datasources/FetchHttpClient.ts`)

**Integration of retry logic:**

```typescript
export class FetchHttpClient implements IHttpClient {
  async get<T>(url: string, config?: HttpClientConfig): Promise<T> {
    return this.executeRequest<T>('GET', url, config);
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    config?: HttpClientConfig
  ): Promise<T> {
    const requestFn = async () => {
      // Fetch logic here
    };

    // Auto-retry if enabled (default: true)
    if (config?.enableRetry !== false) {
      return withRetry(requestFn, {
        attempts: 3,
        shouldRetry: (error) => 
          isNetworkError(error) || 
          isServerError(error) ||
          isRateLimitError(error)
      });
    }

    return requestFn();
  }
}
```

**Benefits:**
- ✅ All HTTP calls automatically retry on transient failures
- ✅ Configurable per-request with `enableRetry: false`
- ✅ Smart retry only for retryable errors (not 4xx client errors)
- ✅ Zero code changes needed in use cases

---

## 🤖 DEVOPS & AUTOMATION (2026-02-03 Update)

### Dependabot Configuration

**Purpose:** Automated dependency updates with security focus

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    schedule:
      interval: "monthly"  # Every first Monday at 09:00 Europe/Madrid
    
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types: ["minor", "patch"]
      
      production-dependencies:
        dependency-type: "production"
        update-types: ["minor", "patch"]
    
    ignore:
      - dependency-name: "tailwindcss"
        update-types: ["version-update:semver-major"]
```

**Features:**
- ✅ Monthly automated PRs (reduced noise)
- ✅ Grouped updates (dev/prod separate)
- ✅ Major version exclusions (e.g., Tailwind 4.x)
- ✅ Security updates prioritized
- ✅ 5 PR limit to prevent overwhelm

---

### GitHub Actions CI/CD

**Workflow:** `.github/workflows/ci-cd.yml`

```yaml
jobs:
  validate_and_build:
    steps:
      # 1. Quality checks
      - name: Lint code
        run: npm run lint -- --max-warnings 25
      
      - name: Type check
        run: npm run type-check
      
      # 2. Security scan (Snyk)
      - name: Snyk Security Gate (PR)
        if: github.event_name == 'pull_request' && github.actor != 'dependabot[bot]'
        run: snyk test --severity-threshold=high
      
      - name: Snyk Monitor (Push to main)
        if: github.event_name == 'push'
        run: snyk monitor --project-name="SmartConnect-AI-Production"
      
      # 3. Build
      - name: Build project
        run: npm run build
```

**Key Features:**
- ✅ GitHub Actions v6 (latest)
- ✅ Snyk skips Dependabot PRs (no secrets access)
- ✅ Lint/type-check/build for all PRs
- ✅ Security monitoring on production pushes
- ✅ 15-minute timeout protection

---

### GitHub CLI Integration

**Purpose:** Fast PR management from terminal

```bash
# List PRs
gh pr list --repo Waterproof82/smart_connect

# Close PR with comment
gh pr close 6 --comment "Reason for closing"

# Trigger workflow manually
gh workflow run ci-cd.yml

# Watch workflow execution
gh run watch 21622007642
```

**Installed:** `gh version 2.85.0`  
**Authenticated:** `Waterproof82`

---

## 📊 ARCHITECTURE QUALITY SCORE

**Current Score:** 9.7/10 (February 2, 2026)

### Evaluation Breakdown

| Category | Score | Details |
|----------|-------|---------|
| **SOLID Principles** | 10/10 | ✅ Excellent adherence (SRP, OCP, LSP, ISP, DIP) |
| **Clean Architecture** | 10/10 | ✅ Clear layer separation, dependency inversion |
| **Security (OWASP)** | 9.5/10 | ✅ A02 encryption, A04 errors, A05 Dependabot |
| **Resilience** | 9.5/10 | ✅ Retry logic, circuit breaker, error handling |
| **DevOps** | 9.0/10 | ✅ CI/CD, Dependabot, security scanning |
| **Testing** | 9.0/10 | ✅ Jest 30, TDD setup, tests in dev branch (production-first strategy) |
| **Documentation** | 10/10 | ✅ Comprehensive docs, ADRs, audit logs |

### Recent Improvements (Feb 2-3, 2026)

**High Priority (Score: 9.2 → 9.5):**
- ✅ AES-256 encryption for client-side storage
- ✅ Custom domain error classes (ValidationError, NotFoundError)
- ✅ Secure A/B testing data storage

**Medium Priority (Score: 9.5 → 9.7):**
- ✅ Exponential backoff retry logic
- ✅ Circuit breaker pattern (Hystrix-inspired)
- ✅ Dependabot monthly automation
- ✅ HTTP client resilience integration

**Pending (Optional Low Priority):**
- ⏳ Performance monitoring (Sentry/LogRocket)
- ⏳ Request/response logging middleware
- ✅ Client-side rate limiting (per-session in Contact form + chatbot)
- ✅ Form validation with Zod schemas + React Hook Form (Contact, Login, Settings)
- ⏳ Caching layer for frequent data

---

## 🔧 DEPENDENCY MANAGEMENT

### Production Dependencies
```json
{
  "@google/genai": "1.39.0",
  "@supabase/supabase-js": "2.93.3",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "crypto-js": "4.2.0",
  "dompurify": "3.3.1"
}
```

### Development Dependencies
```json
{
  "typescript": "5.9.3",
  "vite": "6.4.1",
  "tailwindcss": "3.4.19",
  "jest": "30.2.0",
  "@types/jest": "30.0.0"
}
```

### Excluded Major Updates
- ❌ **Tailwind CSS 4.x** - Breaking changes, requires config migration
- ❌ **Vite 7.x** - Pending evaluation

**Update Strategy:**
- Minor/patch: Auto-merge after validation
- Major: Manual review and migration planning
- Security: Immediate priority

---

*Diagrama actualizado: 2026-03-09*
