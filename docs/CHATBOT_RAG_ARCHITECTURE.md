# 🤖 Chatbot RAG - Arquitectura Completa con Supabase + Gemini

## Objetivo

Implementar un chatbot experto con arquitectura RAG (Retrieval-Augmented Generation) que responde preguntas sobre los servicios de SmartConnect AI usando una base de conocimiento vectorial.

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  ExpertAssistantWithRAG.tsx                             │      │
│  │  ┌──────────────────────────────────────────────────┐  │      │
│  │  │  RAGService Class                                 │  │      │
│  │  │  • generateEmbedding(text)                       │  │      │
│  │  │  • searchSimilarDocs(query)                      │  │      │
│  │  │  • generateWithRAG(userQuery)                    │  │      │
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
    │  • text-embedding-004│
    │    (768 dimensions)  │
    │                      │
    │  • gemini-2.0-flash  │
    │    -exp              │
    └──────────────────────┘
```

---

## 🔄 Flujo de Procesamiento RAG

### 1. **User Query** (Entrada del Usuario)

```
Usuario: "¿Cuánto cuesta QRIBAR?"
```

### 2. **Generate Query Embedding**

```typescript
// Frontend: RAGService.generateEmbedding()
const { data, error } = await supabase.functions.invoke('gemini-embedding', {
  body: { text: "¿Cuánto cuesta QRIBAR?" }
});

// Edge Function: gemini-embedding/index.ts
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent',
  {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY  // ✅ Protegida en servidor
    },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text: "¿Cuánto cuesta QRIBAR?" }] }
    })
  }
);

// Resultado: [0.123, -0.456, 0.789, ..., 0.234] (768 números)
```

### 3. **Vector Similarity Search**

```typescript
// Frontend: RAGService.searchSimilarDocs()
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
// Frontend: RAGService.generateWithRAG()
const context = relevantDocs.map(doc => doc.content).join('\n\n');

const systemPrompt = `Eres el Asistente Experto de SmartConnect AI. 

TUS SERVICIOS PRINCIPALES:
1. QRIBAR: Menús digitales interactivos para restaurantes y bares
2. Automatización n8n: Flujos de trabajo inteligentes para empresas
3. Tarjetas Tap-to-Review NFC: Sistema para aumentar reseñas en Google Maps

INFORMACIÓN DE LA BASE DE CONOCIMIENTO:
${context}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé profesional, conciso y entusiasta
- Si la información está en la base de conocimiento, úsala
- Si no sabes algo, reconócelo y ofrece contactar al equipo
- Mantén respuestas bajo 150 palabras`;
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
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
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
    'Access-Control-Allow-Origin': '*',
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
      'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY  // ✅ API key en servidor
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
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
    'Access-Control-Allow-Origin': '*',
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
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
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

## 🚀 Entrenamiento del RAG (Training Pipeline)

### Script: `train_rag.js`

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
    'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent',
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
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
  'Access-Control-Allow-Origin': '*',
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
-- text-embedding-004 = 768 dimensiones
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
