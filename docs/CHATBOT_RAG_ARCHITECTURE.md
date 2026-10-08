# 🤖 Chatbot RAG - Arquitectura Completa con Supabase + Gemini

## Objetivo

Implementar un chatbot experto con arquitectura RAG (Retrieval-Augmented Generation) que responde preguntas sobre los servicios de SmartConnect AI usando una base de conocimiento vectorial.

---

## ⚠️ Arquitectura Actual (2026-10-08) — sustituye lo descrito más abajo

> El diagrama y los ejemplos de código de las secciones siguientes (p. ej. `gemini-generate` como fallback, generación de embeddings desde el Admin Panel, `gemini-2.5-flash`) documentan una versión anterior del sistema y se conservan solo como referencia histórica. Esta sección describe el estado real tras el cambio `rag-knowledge-base-refresh` (Unidades 1-8).

### Generación con failover (sin fallback sin grounding)

- `chat-with-rag` ya NO usa `gemini-generate` como fallback. Si la generación falla, el usuario recibe un mensaje de error estático con CTA de contacto; nunca una respuesta sin grounding.
- `supabase/functions/_shared/generate.ts` → `generateWithFailover({models, fetchFn, now, deadlineMs})`:
  - Modelo primario: env `GEMINI_PRIMARY_MODEL` (default `gemini-3.1-flash-lite`).
  - Modelo backup: env `GEMINI_BACKUP_MODEL` (default `gemini-3.5-flash-lite`).
  - Timeout primario 10s; backup `min(8s, tiempo restante - 500ms)`; techo total de 20s (`AbortController` por intento).
  - Reintenta en: abort/timeout, error de red, 429, 404 (modelo retirado), 5xx, 200 sin candidates (salvo `blockReason`). NO reintenta en 400/401/403 (mismo fallo en ambos modelos).
  - `supabase/functions/gemini-generate/` fue eliminada del código fuente; si aún está desplegada, el owner debe borrarla manualmente (`supabase functions delete gemini-generate`) tras desplegar el frontend.

### Prompt grounding (`_shared/prompt.ts`)

- `buildSystemInstruction({documents})` construye el `systemInstruction` de Gemini (no se inyecta en el turno de usuario, así sobrevive mejor al historial).
- Reglas: responder en el idioma del usuario (español de España: tuteo, sin voseo ni "celular/computadora"); basarse solo en el CONTEXTO (nunca inventar precios/plazos/garantías); si preguntan el precio de páginas web, carta digital, TPV o chatbots → "depende del tipo de proyecto y de su complejidad" + CTA a `https://digitalizatenerife.es/#contacto`; si no hay información suficiente → invitar a contactar (nunca un callejón sin salida); preguntas de privacidad/cookies/aviso legal → redirigir siempre a `/legal/privacidad`, `/legal/cookies`, `/legal/aviso` (nunca responder con contenido del contexto); 0 documentos recuperados → seguir generando (saludos funcionan, dudas genéricas también); texto plano, nunca Markdown.

### Embedding contract (`_shared/embedding.ts`)

- `buildEmbedRequest(text, {mode, role, title?})` + `parseEmbedResponse`.
- `EMBEDDING_MODE` (env, compartido por `chat-with-rag` y `gemini-embedding`):
  - `legacy` (default, sin definir la variable): sin `taskType`, vector recortado a 768 dims — compatible con los vectores ya existentes.
  - `v2`: `taskType RETRIEVAL_QUERY` (consulta) / `RETRIEVAL_DOCUMENT` (documento, con `title`), `outputDimensionality: 768`.
- Modelo: `gemini-embedding-001` (no cambia entre modos).
- El flag se cambia SOLO después de re-embeber todo el contenido con `npm run ingest-kb` (ver abajo) — cambiarlo antes mezclaría vectores legacy con consultas v2, que no son comparables por coseno.

### Ingesta de la base de conocimiento (`npm run ingest-kb`)

Reemplaza por completo el flujo "Admin Panel → CreateDocumentUseCase → generateEmbedding()" descrito más abajo. Pipeline (`scripts/ingest-knowledge-base.mjs`):

```
dist/*.html (rutas de site-routes.json, scope "main") ─┐
dist JSON-LD FAQ ───────────────────────────────────────┼─> chunk ─> guarda TODO ─> hash ─> diff vs. documents ─> embed (solo nuevos) ─> upsert_document ─> delete_stale_documents
content/knowledge-base/*.md (curado) ───────────────────┘
```

- Fuentes: `site:<ruta>` (todas las rutas de `scripts/site-routes.json` excepto `/legal/*`), `faq:<ruta>` (JSON-LD FAQPage ya prerenderizado), `curated:<archivo>` (`content/knowledge-base/*.md`).
- Chunking por encabezado (`##`/`###`), 400-1200 caracteres, con solape de ~150 caracteres en secciones largas (`scripts/kb/chunk.mjs`).
- Idempotente: `content_hash = sha256(contractVersion + source + url + section + contenido)`. Solo se generan embeddings para chunks nuevos; `delete_stale_documents` borra filas cuyo hash ya no está en el keep-set (p. ej. una página eliminada o un archivo curado modificado).
- Comandos:
  ```bash
  npm run build                                         # genera dist/ (necesario para extraer las páginas)
  npm run ingest-kb -- --dry-run                        # revisa cuántos chunks se extraerían, sin tocar la base
  npm run ingest-kb                                      # ejecuta el pipeline completo (requiere SUPABASE_SERVICE_ROLE_KEY)
  npm run ingest-kb -- --purge-legacy                    # lista (no borra) filas con content_hash NULL
  npm run ingest-kb -- --purge-legacy --confirm-purge    # las borra (solo tras confirmar que son basura real)
  ```
- `populate-knowledge-base.mjs` y `clean-knowledge-base.mjs` (truncar-y-reinsertar) fueron eliminados — sustituidos por este pipeline idempotente.

### Contenido curado (`content/knowledge-base/*.md`)

- Solo hechos confirmados por el owner. Frontmatter: `title`, `lang`, `url?`, `draft?`.
- Cualquier sección (`##`/`###`) que contenga el token literal `TODO(owner)` se excluye automáticamente de la ingesta (`scripts/kb/curated.mjs`) — nunca llega a `documents`. `draft: true` excluye el archivo completo.
- Política de precios: NUNCA se cita una cifra para páginas web, carta digital, TPV o chatbots — siempre "depende del tipo de proyecto y de su complejidad" + CTA de contacto. La ÚNICA excepción confirmada es el precio de las tarjetas NFC: "de 15 € a 35 € por unidad, con descuentos por volumen".
- Archivos actuales: `servicios-web.md`, `carta-digital.md`, `preguntas-clave.md`.

### Evaluación (`npm run eval-kb`)

- `scripts/kb/eval-set.json`: ≥15 preguntas en español + ≥5 en inglés, cada una con `mustInclude`/`mustNotInclude`.
- `scripts/eval-knowledge-base.mjs`: inicia sesión anónima (clave publicable/anon), llama a `chat-with-rag` desplegado para cada pregunta, comprueba los criterios, imprime una tabla pass/fail + p95 de latencia. Sale con código distinto de 0 si el % de aciertos es menor al 90% o si alguna respuesta contiene un término prohibido (precio inventado, marca antigua, etc.).
- Ejecutar SOLO manualmente, después de desplegar y de haber ingerido contenido: `npm run eval-kb`.

### Rollout y rollback (manual, owner)

1. Desplegar funciones: `supabase functions deploy chat-with-rag`, `supabase functions deploy gemini-embedding`. Variables: `GEMINI_PRIMARY_MODEL`, `GEMINI_BACKUP_MODEL`, `EMBEDDING_MODE` (dejar sin definir = `legacy` al principio).
2. Migraciones (snapshot `kb_backup.documents_YYYYMMDD` + `content_hash`/`updated_at`/HNSW/RPCs) — ya aplicadas en producción el 2026-10-08.
3. `npm run build` → `npm run ingest-kb -- --dry-run` (revisar chunks y que no haya `TODO`) → `npm run ingest-kb`.
4. Cambiar `EMBEDDING_MODE=v2` y volver a ejecutar `npm run ingest-kb` (re-embeber todo bajo el nuevo contrato) → `npm run eval-kb`.
5. Si el eval pasa (≥90%, sin términos prohibidos): `npm run ingest-kb -- --purge-legacy --confirm-purge` para limpiar filas legacy reales (revisar la lista primero).
6. **Rollback**: volver `EMBEDDING_MODE=legacy`, restaurar `documents` desde `kb_backup.documents_YYYYMMDD`, recrear el índice `ivfflat` si es necesario.

---

## 🏗️ Arquitectura del Sistema (histórico — ver sección anterior para el estado actual)

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  ExpertAssistantWithRAG.tsx                             │      │
│  │  ┌──────────────────────────────────────────────────┐  │      │
│  │  │  ChatbotContainer → GenerateResponseUseCase        │  │      │
│  │  │  → ChatRepositoryImpl                            │  │      │
│  │  │  • invoke('chat-with-rag') → Full RAG pipeline   │  │      │
│  │  │  • invoke('gemini-generate') → Fallback          │  │      │
│  │  └──────────────────────────────────────────────────┘  │      │
│  └────────────────────────────────────────────────────────┘      │
└───────────────────────┬──────────────────────────┬───────────────┘
                        │                          │
                        ▼                          ▼
        ┌───────────────────────┐    ┌──────────────────────────┐
        │  Supabase Client      │    │   Supabase Client        │
        │  .functions.invoke()  │    │   .rpc()                 │
        └───────────┬───────────┘    └───────────┬──────────────┘
                    │                            │
                    ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                              │
│                                                                    │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐   │
│  │  Edge Functions (Deno)      │  │  PostgreSQL + pgvector  │   │
│  │                              │  │                          │   │
│  │  ┌────────────────────────┐ │  │  ┌────────────────────┐ │   │
│  │  │ gemini-embedding       │ │  │  │ Table: documents   │ │   │
│  │  │ • Recibe: text         │ │  │  │ • id (uuid)        │ │   │
│  │  │ • Llama: Gemini API    │ │  │  │ • content (text)   │ │   │
│  │  │ • Retorna: embedding[] │ │  │  │ • metadata (jsonb) │ │   │
│  │  └────────────────────────┘ │  │  │ • embedding (vector│ │   │
│  │                              │  │  │   768 dimensions)  │ │   │
│  │  ┌────────────────────────┐ │  │  └────────────────────┘ │   │
│  │  │ gemini-generate        │ │  │                          │   │
│  │  │ • Recibe: contents[]   │ │  │  ┌────────────────────┐ │   │
│  │  │ • Llama: Gemini API    │ │  │  │ Function:          │ │   │
│  │  │ • Retorna: text        │ │  │  │ match_documents()  │ │   │
│  │  └────────────────────────┘ │  │  │ • Cosine similarity│ │   │
│  └─────────────────────────────┘  │  │ • Returns top N    │ │   │
│                                    │  └────────────────────┘ │   │
└─────────────┬──────────────────────┴─────────────────────────────┘
              │
              ▼
    ┌──────────────────────┐
    │   Gemini API         │
    │   (Google AI)        │
    │                      │
    │  • embedding-001     │
    │    (768 dimensions)  │
    │                      │
    │  • gemini-2.5-flash  │
    │    (v1beta/models/gemini-2.5-flash:generateContent) │
    └──────────────────────┘
```

---

## 🏢 Flujo de Administración de Documentos (histórico — reemplazado por `npm run ingest-kb`, ver arriba)

El Admin Panel permite crear, actualizar y eliminar documentos del conocimiento RAG. La generación de embeddings se realiza automáticamente al crear/actualizar documentos.

### Flujo: Crear Nuevo Documento

```
Admin Panel → CreateDocumentUseCase → SupabaseDocumentRepository.generateEmbedding() → gemini-embedding Edge Function → Guardar en DB
```

### 1. Admin crea documento en el Panel

```typescript
// Frontend: AdminDashboard.tsx
const content = "QRIBAR es el sistema de carta digital de SmartConnect...";
await createDocumentUseCase.execute({
  content,
  metadata: { source: 'qribar', category: 'product' }
});
```

### 2. Generate Document Embedding

```typescript
// Repository: SupabaseDocumentRepository.generateEmbedding()
const { data, error } = await supabase.functions.invoke('gemini-embedding', {
  body: { text: content }
});

// Edge Function: gemini-embedding/index.ts (misma función que para búsqueda)
// Retorna: { embedding: { values: [0.123, -0.456, ..., 0.234] } } (768 dimensiones)
```

### 3. Guardar documento con embedding

```typescript
// Repository: SupabaseDocumentRepository.create()
const { data, error } = await supabase
  .from('documents')
  .insert({
    content: content,
    metadata: metadata,
    embedding: embeddingData.embedding.values  // Array de 768 números
  });
```

### Resumen: Usos de `gemini-embedding`

| Caso | Cuándo se usa | Endpoint |
|------|---------------|----------|
| **Búsqueda RAG** | Usuario hace pregunta | `gemini-embedding` → generar embedding de query |
| **Crear documento** | Admin crea nuevo documento | `gemini-embedding` → generar embedding del contenido |
| **Actualizar documento** | Admin edita documento existente | `gemini-embedding` → regenerar embedding |

---

## 🔄 Flujo de Procesamiento RAG

### 1. **User Query** (Entrada del Usuario)

```
Usuario: "¿Cuánto cuesta QRIBAR?"
```

### 2. **Generate Query Embedding**

```typescript
// Edge Function: chat-with-rag (step 1 - embedding)
const { data, error } = await supabase.functions.invoke('gemini-embedding', {
  body: { text: "¿Cuánto cuesta QRIBAR?" }
});

// Edge Function: gemini-embedding/index.ts
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
  {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY  // ✅ Protegida en servidor
    },
    body: JSON.stringify({
      model: 'gemini-embedding-001',
      content: { parts: [{ text: "¿Cuánto cuesta QRIBAR?" }] }
    })
  }
);

// Resultado: [0.123, -0.456, 0.789, ..., 0.234] (768 números)
```

### 3. **Vector Similarity Search**

```typescript
// Edge Function: chat-with-rag (step 2 - vector search)
const { data, error } = await supabase.rpc('match_documents', {
  query_embedding: [0.123, -0.456, 0.789, ..., 0.234],
  match_threshold: 0.3,  // Mínimo 30% de similitud
  match_count: 3         // Top 3 documentos
});

// PostgreSQL Function: match_documents()
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int
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
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

// Resultado:
[
  {
    id: "uuid-1",
    content: "Precios QRIBAR 2026\n\nPlan BÁSICO - 29€/mes...",
    metadata: { category: "precio", service: "qribar", tags: [...] },
    similarity: 0.87
  },
  {
    id: "uuid-2",
    content: "QRIBAR - Menús Digitales para Hostelería...",
    metadata: { category: "producto", service: "qribar", tags: [...] },
    similarity: 0.72
  }
]
```

### 4. **Build Context Prompt**

```typescript
// Edge Function: chat-with-rag (step 3 - context + generation)
const context = relevantDocs.map(doc => doc.content).join('\n\n');

const systemPrompt = `Eres el Asistente Experto de SmartConnect AI.\n\nTUS SERVICIOS PRINCIPALES:\n1. QRIBAR: Menús digitales interactivos para restaurantes y bares\n2. Automatización n8n: Flujos de trabajo inteligentes para empresas\n3. Tarjetas Tap-to-Review NFC: Sistema para aumentar reseñas en Google Maps\n\nINFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n${context}\n\nINSTRUCCIONES:\n- Responde SIEMPRE en español\n- Sé profesional, conciso y entusiasta\n- Usa solo la información de la base de conocimiento proporcionada\n- No cites ni hagas referencia a ningún documento ni número de documento\n- Si no sabes algo, reconócelo y ofrece contactar al equipo\n- Mantén respuestas bajo 150 palabras`;
```

### 5. **Generate AI Response**

```typescript
// Frontend: Llamada a Edge Function
const { data, error } = await supabase.functions.invoke('gemini-generate', {
  body: {
    contents: [
      { 
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nPregunta del usuario: ${userQuery}` }] 
      }
    ],
    generationConfig: {
      temperature: 0.7,      // Creatividad moderada
      maxOutputTokens: 500   // ~150 palabras
    }
  }
});

// Edge Function: gemini-generate/index.ts
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({ contents, generationConfig })
  }
);

// Resultado:
{
  candidates: [{
    content: {
      parts: [{
        text: "¡Claro! QRIBAR tiene tres planes:\n\n• Plan BÁSICO: 29€/mes..."
      }]
    }
  }]
}
```

### 6. **Display Response**

```typescript
// Frontend: Extrae y muestra la respuesta
const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

setMessages([
  ...messages,
  { role: 'user', content: '¿Cuánto cuesta QRIBAR?' },
  { role: 'assistant', content: responseText }
]);
```

---

## 🗄️ Estructura de la Base de Datos (PostgreSQL + pgvector)

### Extensión pgvector

```sql
-- Habilitar extensión para vectores
CREATE EXTENSION IF NOT EXISTS vector;
```

### Tabla: `documents`

```sql
CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,                    -- Texto completo del documento
  metadata jsonb DEFAULT '{}'::jsonb,       -- Categoría, servicio, tags, prioridad
  embedding vector(768),                    -- Vector de 768 dimensiones (Gemini)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para búsqueda vectorial rápida
CREATE INDEX documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índice para búsquedas por metadata
CREATE INDEX documents_metadata_idx ON documents USING gin(metadata);
```

### Función: `match_documents`

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 3
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
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Operadores de pgvector:**
- `<=>` : Distancia coseno (1 - similitud)
- `<->` : Distancia euclidiana
- `<#>` : Producto punto negativo

---

## 📦 Edge Functions (Supabase Deno Runtime)

### `gemini-embedding/index.ts`

```typescript
// @ts-nocheck - Deno runtime types
import "https://deno.land/x/xhr@0.1.0/mod.ts";

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '<origin-whitelist>',  // smart-connect-olive.vercel.app + localhost
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamada a Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY  // ✅ API key en servidor
        },
        body: JSON.stringify({
          model: 'gemini-embedding-001',
          content: { parts: [{ text }] }
        })
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### `gemini-generate/index.ts`

```typescript
// @ts-nocheck - Deno runtime types
import "https://deno.land/x/xhr@0.1.0/mod.ts";

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '<origin-whitelist>',  // smart-connect-olive.vercel.app + localhost
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contents, generationConfig } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamada a Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({ contents, generationConfig })
      }
    );

    const data = await response.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🚀 Gestión de Documentos RAG (Admin Panel)

> **Nota:** El script `train_rag.js` fue eliminado. Los documentos se gestionan desde el Admin Panel (`/admin`), que genera embeddings automáticamente al crear/editar documentos via la Edge Function `gemini-embedding`.

### Ejemplo histórico del script (referencia):

```javascript
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Base de conocimiento
const knowledgeBase = [
  {
    content: `QRIBAR - Menús Digitales para Hostelería
    
    QRIBAR es la solución completa para digitalizar tu carta...
    
    Características principales:
    • Menú digital interactivo con fotos HD
    • Actualización en tiempo real
    • Filtros de alérgenos
    • Multiidioma (español, inglés, francés, alemán)
    ...`,
    metadata: {
      category: 'producto',
      service: 'qribar',
      tags: ['menu', 'restaurante', 'qr', 'hosteleria'],
      priority: 'high'
    }
  },
  {
    content: `Precios QRIBAR 2026
    
    Plan BÁSICO - 29€/mes
    • 1 restaurante/local
    • Menú ilimitado
    ...`,
    metadata: {
      category: 'precio',
      service: 'qribar',
      tags: ['precio', 'planes', 'coste'],
      priority: 'high'
    }
  },
  // ... más documentos
];

// Función para generar embedding
async function generateEmbedding(text) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        model: 'gemini-embedding-001',
        content: { parts: [{ text }] }
      })
    }
  );
  
  const data = await response.json();
  return data.embedding.values;  // Array de 768 números
}

// Entrenar el sistema
async function trainRAG() {
  console.log('🚀 Iniciando entrenamiento del RAG...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < knowledgeBase.length; i++) {
    const doc = knowledgeBase[i];
    
    console.log(`📄 Procesando documento ${i + 1}/${knowledgeBase.length}...`);
    console.log(`   Servicio: ${doc.metadata.service}`);
    console.log(`   Categoría: ${doc.metadata.category}`);
    
    try {
      // 1. Generar embedding
      console.log('   🧠 Generando embedding...');
      const embedding = await generateEmbedding(doc.content);
      console.log(`   ✅ Embedding generado (${embedding.length} dimensiones)`);
      
      // 2. Insertar en Supabase
      console.log('   💾 Insertando en Supabase...');
      const { error } = await supabase
        .from('documents')
        .insert({
          content: doc.content,
          metadata: doc.metadata,
          embedding: embedding
        });
      
      if (error) throw error;
      
      console.log('   ✅ Documento insertado correctamente\n');
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      errorCount++;
    }
    
    // Delay para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Entrenamiento completado!');
  console.log(`✅ Documentos insertados: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
}

trainRAG();
```

### Ejecución del Training

```bash
# 1. Instalar dependencias
npm install @supabase/supabase-js node-fetch dotenv

# 2. Configurar .env.local
GEMINI_API_KEY=AIzaSy...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 3. Ejecutar entrenamiento
node src/features/chatbot/data/train_rag.js

# Output esperado:
🚀 Iniciando entrenamiento del RAG...

📄 Procesando documento 1/10...
   Servicio: qribar
   Categoría: producto
   🧠 Generando embedding...
   ✅ Embedding generado (768 dimensiones)
   💾 Insertando en Supabase...
   ✅ Documento insertado correctamente

...

🎉 Entrenamiento completado!
✅ Documentos insertados: 10
❌ Errores: 0
```

---

## 🔐 Seguridad y Buenas Prácticas

### 1. **Protección de API Keys**

**❌ NUNCA HACER:**
```typescript
// MALO: API key expuesta en el cliente
const GEMINI_API_KEY = 'AIzaSy...'; // ⚠️ VISIBLE EN EL NAVEGADOR
```

**✅ HACER:**
```typescript
// BUENO: API key en servidor (Edge Function)
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
```

### 2. **Variables de Entorno**

**`.env.local` (Frontend):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  # ✅ Pública (solo lectura)
# ❌ NO incluir GEMINI_API_KEY aquí
```

**Supabase Secrets (Edge Functions):**
```bash
# Configurar en Supabase Dashboard o CLI
supabase secrets set GEMINI_API_KEY=AIzaSy...
```

### 3. **Row Level Security (RLS)**

```sql
-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública (para chatbot)
CREATE POLICY "Public documents are viewable by everyone"
ON documents FOR SELECT
USING (true);

-- Política: Solo admin puede insertar
CREATE POLICY "Only admins can insert documents"
ON documents FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### 4. **Rate Limiting**

```typescript
// En Edge Function
const RATE_LIMIT = 10; // requests por minuto
const clientIP = req.headers.get('x-forwarded-for');

// Implementar rate limiting con Redis o Supabase
```

---

## 📊 Métricas y Monitoreo

### Logging en Edge Functions

```typescript
console.log('Query:', text.substring(0, 50));
console.log('Embedding dimensions:', embedding.length);
console.log('Similarity threshold:', match_threshold);
console.log('Results found:', data.length);
```

### Métricas en Supabase Dashboard

- **Edge Functions**: Invocations, errors, latency
- **Database**: Query performance, table size
- **Auth**: Active users, failed logins

### Analíticas del Chatbot

```sql
-- Crear tabla de logs de consultas
CREATE TABLE chatbot_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query text NOT NULL,
  documents_found int,
  response_length int,
  similarity_avg float,
  latency_ms int,
  created_at timestamp with time zone DEFAULT now()
);

-- Insertar log después de cada consulta
INSERT INTO chatbot_logs (user_query, documents_found, response_length, similarity_avg, latency_ms)
VALUES ($1, $2, $3, $4, $5);
```

---

## 🧪 Testing

### Test de Embedding

```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/gemini-embedding \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"text": "¿Cuánto cuesta QRIBAR?"}'

# Respuesta esperada:
{
  "embedding": {
    "values": [0.123, -0.456, 0.789, ..., 0.234]  # 768 números
  }
}
```

### Test de Generate

```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/gemini-generate \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [{"text": "¿Qué es QRIBAR?"}]
      }
    ],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 500
    }
  }'

# Respuesta esperada:
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "QRIBAR es un sistema de menús digitales..."
      }]
    }
  }]
}
```

### Test de Similarity Search

```sql
-- Verificar documentos
SELECT COUNT(*) FROM documents;

-- Test de búsqueda vectorial
SELECT 
  content,
  metadata,
  1 - (embedding <=> '[0.123, -0.456, ..., 0.234]'::vector) as similarity
FROM documents
WHERE 1 - (embedding <=> '[0.123, -0.456, ..., 0.234]'::vector) > 0.3
ORDER BY embedding <=> '[0.123, -0.456, ..., 0.234]'::vector
LIMIT 3;
```

---

## 🚀 Despliegue

### Checklist Completo

#### Backend (Supabase)
- [ ] Proyecto Supabase creado
- [ ] Extensión pgvector habilitada
- [ ] Tabla `documents` creada con índices
- [ ] Función `match_documents` creada
- [ ] RLS policies configuradas
- [ ] Edge Functions desplegadas:
  - [ ] `gemini-embedding`
  - [ ] `gemini-generate`
- [ ] Secret `GEMINI_API_KEY` configurada
- [ ] CORS habilitado en Edge Functions

#### Training
- [ ] Script `train_rag.js` ejecutado exitosamente
- [ ] 10+ documentos insertados en la base de datos
- [ ] Embeddings generados correctamente (768 dimensiones)
- [ ] Verificación manual de búsqueda vectorial

#### Frontend
- [ ] Variables de entorno configuradas (`.env.local`)
  - [ ] **NO incluir nunca la Gemini API Key en el frontend**
- [ ] Supabase client inicializado
- [ ] Componente `ExpertAssistantWithRAG.tsx` integrado
- [ ] Testing manual de flujo completo:
  - [ ] Pregunta sobre precios → Respuesta correcta
  - [ ] Pregunta sobre servicios → Respuesta correcta
  - [ ] Pregunta fuera de contexto → Respuesta adecuada
- [ ] UI responsiva y accesible

#### Producción
- [ ] Edge Functions en modo producción
- [ ] Rate limiting configurado
- [ ] Logging y monitoring activos
- [ ] Backup de base de datos configurado
- [ ] Documentación actualizada

---

## 💰 Costos y Escalabilidad

### Tier Gratuito (Desarrollo)
- **Gemini API**: 1,500 requests/día = **GRATIS**
- **Supabase**: 500MB DB + 2GB storage = **GRATIS**
- **Edge Functions**: 500K invocations/mes = **GRATIS**
- **Total**: **0€/mes** 🎉

### Escalado (Producción)
**1,000 usuarios/mes:**
- Gemini API: ~3,000 requests × $0.00025 = **$0.75/mes**
- Supabase Pro: **$25/mes** (incluye más DB, bandwidth, backups)
- **Total**: **~26€/mes**

**10,000 usuarios/mes:**
- Gemini API: ~30,000 requests = **$7.50/mes**
- Supabase Pro: **$25/mes**
- **Total**: **~33€/mes**

### Optimizaciones de Costos
1. **Cache de embeddings**: No regenerar para queries frecuentes
2. **Batch processing**: Agrupar requests similares
3. **Throttling**: Limitar requests por usuario
4. **Compression**: Comprimir documentos largos

---

## 🔧 Troubleshooting

### Problema: "API key not valid"

**Causa**: API key mal configurada o expirada

**Solución**:
```bash
# 1. Verificar API key en Google AI Studio
# 2. Re-crear secret en Supabase
supabase secrets set GEMINI_API_KEY=nueva_key

# 3. Re-desplegar Edge Functions
supabase functions deploy gemini-embedding
supabase functions deploy gemini-generate
```

### Problema: "No similar documents found"

**Causa**: Threshold muy alto o documentos no entrenados

**Solución**:
```typescript
// Bajar threshold de 0.5 a 0.3
const { data } = await supabase.rpc('match_documents', {
  query_embedding: embedding,
  match_threshold: 0.3,  // ← Ajustar aquí
  match_count: 3
});
```

### Problema: "CORS error"

**Causa**: Headers CORS mal configurados

**Solución**:
```typescript
// Añadir headers completos en Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '<origin-whitelist>',  // smart-connect-olive.vercel.app + localhost
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

### Problema: "Embedding dimension mismatch"

**Causa**: Modelo cambiado o vector incorrecto

**Solución**:
```sql
-- Verificar dimensiones en DB
SELECT id, array_length(embedding, 1) as dimensions 
FROM documents 
LIMIT 5;

-- Si es necesario, re-entrenar con el modelo correcto
-- gemini-embedding-001 = 768 dimensiones
```

---

## 📚 Referencias Técnicas

### Gemini API
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Text Embedding Guide](https://ai.google.dev/tutorials/text_embedding)
- [Content Generation API](https://ai.google.dev/api/rest/v1/models/generateContent)

### Supabase
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [pgvector Extension](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### pgvector
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Vector Similarity Search](https://github.com/pgvector/pgvector#querying)
- [Indexing Strategies](https://github.com/pgvector/pgvector#indexing)

### RAG (Retrieval-Augmented Generation)
- [RAG Explained (OpenAI)](https://platform.openai.com/docs/guides/retrieval-augmented-generation)
- [Building RAG Applications](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Vector Database Best Practices](https://www.pinecone.io/learn/vector-database/)

---

## 🎓 Próximos Pasos

### Mejoras Avanzadas

1. **Hybrid Search**: Combinar búsqueda vectorial + full-text search
2. **Reranking**: Usar modelo adicional para ordenar resultados
3. **Streaming Responses**: Respuestas en tiempo real (word-by-word)
4. **Conversation Memory**: Mantener contexto de conversaciones previas
5. **Multi-modal RAG**: Incluir imágenes y documentos PDF
6. **A/B Testing**: Experimentar con diferentes prompts y thresholds

### Integración con n8n

```
Chatbot → Webhook n8n → Análisis de intención → Google Sheets
                     ↓
              Lead Caliente? → Telegram + Email
```

### Dashboard de Analytics

- Preguntas más frecuentes
- Tasa de satisfacción (thumbs up/down)
- Documentos más relevantes
- Tiempo de respuesta promedio
