# 🤖 Guía Completa: Implementación RAG para Chatbot

## ⚠️ Estado actual (2026-10-08)

> Esta guía documenta la puesta en marcha ORIGINAL del proyecto (configuración inicial de Supabase/Gemini, script `train_rag.js`). Ese script ya no existe y el flujo de ingesta descrito en el PASO 3 está obsoleto. Para el pipeline real hoy, ver `docs/CHATBOT_RAG_ARCHITECTURE.md` → "Arquitectura Actual (2026-10-08)". Resumen:
>
> - **Modelos de generación**: primario/backup vía env (`GEMINI_PRIMARY_MODEL`/`GEMINI_BACKUP_MODEL`, default `gemini-3.1-flash-lite`/`gemini-3.5-flash-lite`), con failover y techo de 20s. `gemini-generate` (fallback sin grounding) fue eliminado.
> - **Embeddings**: `EMBEDDING_MODE=legacy|v2` (env compartido por `chat-with-rag` y `gemini-embedding`), modelo `gemini-embedding-001`.
> - **Ingesta**: `npm run ingest-kb` (`scripts/ingest-knowledge-base.mjs`) — extrae el sitio construido (`dist/`), las FAQ (JSON-LD) y el contenido curado (`content/knowledge-base/*.md`), los trocea, hashea, y hace upsert/delete idempotente contra `documents`. Sustituye por completo a `train_rag.js` y a los antiguos `populate-knowledge-base.mjs`/`clean-knowledge-base.mjs`.
> - **Contenido curado**: solo hechos confirmados por el owner en `content/knowledge-base/*.md`; cualquier sección con el token `TODO(owner)` se excluye de la ingesta. Precios: siempre "depende del tipo de proyecto" + CTA de contacto, excepto las tarjetas NFC (de 15 € a 35 € por unidad).
> - **Evaluación**: `npm run eval-kb` (`scripts/eval-knowledge-base.mjs` + `scripts/kb/eval-set.json`, ≥15 preguntas ES + ≥5 EN) — ejecutar manualmente tras ingerir, nunca en CI.
> - **Rollout/rollback**: ver la sección "Rollout y rollback" en `docs/CHATBOT_RAG_ARCHITECTURE.md`.

## 📊 Costos Estimados (Tier Gratuito)

| Servicio | Plan Gratuito | Costo Real |
|----------|---------------|------------|
| **Gemini API** | 1,500 requests/día | **GRATIS** |
| **Supabase** | 500MB DB + 2GB storage | **GRATIS** |
| **Hosting Frontend** | Vercel/Netlify free tier | **GRATIS** |
| **TOTAL MENSUAL** | - | **0€** 🎉 |

Para escalar:
- Gemini Pro: $0.00025 por request (baratísimo)
- Supabase Pro: $25/mes (cuando superes 500MB)

---

## 🚀 Implementación Paso a Paso

### PASO 1: Configurar Supabase (10 minutos)

#### 1.1 Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto:
   - Nombre: "smartconnect-rag"
   - Password: (guarda esto)
   - Región: Europe (Frankfurt)

#### 1.2 Configurar Base de Datos

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase_setup.sql`
3. Click en **Run** (⚡)
4. Verifica que se ejecutó sin errores

#### 1.3 Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (⚠️ Mantener secreto)
   ```

---

### PASO 2: Configurar Gemini API (5 minutos)

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click en **Get API Key**
3. Crea una nueva API key
4. Copia y guarda la key

---

### PASO 3: Entrenar el RAG (15 minutos)

#### 3.1 Configurar el Script

1. Abre `train_rag.js`
2. Reemplaza las credenciales:
   ```javascript
   const GEMINI_API_KEY = 'tu_gemini_api_key_aqui';
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_SERVICE_KEY = 'tu_service_role_key_aqui';
   ```

#### 3.2 Instalar Dependencias

```bash
npm install @supabase/supabase-js node-fetch
```

#### 3.3 Ejecutar Entrenamiento

```bash
node train_rag.js
```

Verás algo como:
```
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

#### 3.4 Verificar Datos

En Supabase:
1. Ve a **Table Editor** → **documents**
2. Deberías ver 10 documentos con embeddings

---

### PASO 4: Integrar en tu App React (20 minutos)

#### 4.1 Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

#### 4.2 Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:


```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
# GEMINI_API_KEY solo en backend/Edge Functions (NO exponer en frontend)
```

⚠️ **IMPORTANTE:** NUNCA expongas la Gemini API Key (`GEMINI_API_KEY`) en el frontend ni en archivos accesibles al navegador. Solo debe estar en el entorno seguro del backend o configurada como secret en Supabase Edge Functions.

⚠️ **IMPORTANTE**: Añade `.env.local` a `.gitignore`

#### 4.3 Reemplazar el Componente

1. Renombra tu componente actual:
   ```bash
   mv src/ExpertAssistant.tsx src/ExpertAssistant.OLD.tsx
   ```

2. Copia `ExpertAssistantWithRAG.tsx` a `src/ExpertAssistant.tsx`

3. Verifica las importaciones en tu app principal

---

### PASO 5: Probar el Sistema (5 minutos)

#### 5.1 Ejecutar en Desarrollo

```bash
npm start
```

#### 5.2 Probar Preguntas

Abre el chatbot y prueba:

**Pregunta 1:** "¿Cuánto cuesta QRIBAR?"
**Respuesta esperada:** Debería mencionar los planes (29€, 79€, Enterprise)

**Pregunta 2:** "¿Cómo funciona n8n?"
**Respuesta esperada:** Explicación de automatización con ejemplos

**Pregunta 3:** "Quiero más reseñas en Google"
**Respuesta esperada:** Información sobre tarjetas NFC Tap-to-Review

---

## 🔧 Personalización y Entrenamiento

### Añadir Nuevos Documentos

#### Método 1: Usar el Script (Recomendado)

1. Edita `train_rag.js`
2. Añade más objetos al array `knowledgeBase`:

```javascript
{
  content: `Tu nuevo contenido aquí...
  
  Puede ser muy largo, detallado, con ejemplos, etc.
  Cuanto más específico, mejor.`,
  metadata: {
    category: 'producto', // o 'precio', 'proceso', etc.
    service: 'qribar', // o 'n8n', 'tap-to-review', 'general'
    tags: ['tag1', 'tag2'],
    priority: 'high' // o 'medium', 'low'
  }
}
```

3. Ejecuta de nuevo:
```bash
node train_rag.js
```

#### Método 2: Insertar Directamente (Para Testing)

Desde Supabase SQL Editor:

```sql
-- 1. Genera el embedding usando el script auxiliar
-- 2. Inserta directamente:
INSERT INTO documents (content, metadata, embedding) VALUES
(
  'Contenido de tu documento',
  '{"category": "producto", "service": "qribar"}',
  '[0.123, 0.456, ...]' -- embedding generado
);
```

---

### Actualizar Documentos Existentes

```sql
-- Ver documento
SELECT id, content FROM documents WHERE metadata->>'service' = 'qribar';

-- Actualizar contenido (necesitarás regenerar embedding)
UPDATE documents 
SET content = 'Nuevo contenido actualizado'
WHERE id = 1;
```

⚠️ **Importante**: Si actualizas el `content`, debes regenerar el `embedding`.

---

### Eliminar Documentos

```sql
-- Eliminar documento específico
DELETE FROM documents WHERE id = 5;

-- Eliminar todos los documentos de un servicio
DELETE FROM documents WHERE metadata->>'service' = 'qribar';

-- Eliminar TODO (usar con cuidado)
TRUNCATE documents;
```

---

## 🎯 Optimización del RAG

### Mejorar la Calidad de Respuestas

#### 1. Ajustar el Threshold de Similitud

En `ExpertAssistantWithRAG.tsx`:

```typescript
// Más estricto (solo resultados muy relevantes)
const relevantDocs = await this.searchSimilarDocs(userQuery, 0.7);

// Más permisivo (más resultados, puede incluir menos relevantes)
const relevantDocs = await this.searchSimilarDocs(userQuery, 0.3);
```

#### 2. Aumentar el Número de Documentos

```typescript
// Buscar más documentos para contexto más rico
const relevantDocs = await this.searchSimilarDocs(userQuery, 5); // antes 3
```

#### 3. Ajustar el Prompt del Sistema

Edita el `systemPrompt` en el método `generateWithRAG`:

```typescript
const systemPrompt = `Eres el Asistente Experto de SmartConnect AI.

REGLAS ESTRICTAS:
- Usa SOLO información de la BASE DE CONOCIMIENTO proporcionada
- Si no tienes información específica, dilo claramente
- Siempre menciona precios cuando estén disponibles
- Respuestas de máximo 100 palabras
- Tono profesional pero cercano

${context ? `BASE DE CONOCIMIENTO:\n${context}\n\n` : ''}

Pregunta del usuario: ${userQuery}`;
```

---

## 📊 Monitoreo y Analíticas

### Ver Conversaciones (Opcional)

Para guardar las conversaciones:

```sql
-- Crear tabla de conversaciones
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  user_message TEXT,
  assistant_response TEXT,
  context_docs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

En el código, después de generar respuesta:

```typescript
// Guardar conversación
await supabase.from('conversations').insert({
  user_message: userQuery,
  assistant_response: assistantContent,
  context_docs: relevantDocs.map(d => ({ id: d.id, similarity: d.similarity }))
});
```

### Analizar Efectividad

```sql
-- Preguntas más comunes
SELECT user_message, COUNT(*) as count 
FROM conversations 
GROUP BY user_message 
ORDER BY count DESC 
LIMIT 10;

-- Documentos más usados
SELECT 
  d.metadata->>'service' as service,
  COUNT(*) as usage_count
FROM conversations c
CROSS JOIN JSONB_ARRAY_ELEMENTS(c.context_docs) as doc
JOIN documents d ON d.id = (doc->>'id')::bigint
GROUP BY service
ORDER BY usage_count DESC;
```

---

## 🐛 Solución de Problemas

### Problema: "No encuentra respuestas relevantes"

**Síntomas:** El chatbot responde genéricamente sin usar el contexto

**Soluciones:**
1. Verifica que hay documentos en Supabase:
   ```sql
   SELECT COUNT(*) FROM documents;
   ```

2. Prueba la búsqueda directamente:
   ```sql
   SELECT * FROM match_documents(
     (SELECT embedding FROM documents LIMIT 1),
     0.3,
     5
   );
   ```

3. Reduce el `match_threshold` a 0.3 o 0.2

---

### Problema: "Embeddings no se generan"

**Síntomas:** Error en `train_rag.js`

**Soluciones:**
1. Verifica la API key de Gemini
2. Comprueba límites de rate:
   - Free tier: 1,500 requests/día
   - Añade más delay entre requests:
     ```javascript
     await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
     ```

---

### Problema: "Respuestas muy largas"

**Soluciones:**
1. Ajusta `maxOutputTokens` en Gemini:
   ```typescript
   generationConfig: {
     maxOutputTokens: 300 // Reduce esto
   }
   ```

2. Especifica en el prompt:
   ```typescript
   const systemPrompt = `...
   
   RESPONDE EN MÁXIMO 80 PALABRAS.`;
   ```

---

## 🚀 Despliegue a Producción

### Opción 1: Vercel (Recomendado)

1. Sube tu código a GitHub
2. Conecta con Vercel: [vercel.com/new](https://vercel.com/new)
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (GEMINI_API_KEY solo en backend/Edge Functions)
4. Deploy automático

### Opción 2: Netlify

Similar a Vercel:
1. Conecta GitHub
2. Build command: `npm run build`
3. Publish directory: `build`
4. Variables de entorno en Settings

---

## 💰 Estimación de Costos a Escala

**Escenario: 1,000 usuarios/mes, 3 mensajes promedio**

| Servicio | Uso | Costo |
|----------|-----|-------|
| Gemini embeddings | 3,000 requests | GRATIS (bajo límite) |
| Gemini generation | 3,000 requests | $0.75 |
| Supabase | <500MB | GRATIS |
| Hosting | Vercel free | GRATIS |
| **TOTAL** | - | **$0.75/mes** |

**Escenario: 10,000 usuarios/mes, 5 mensajes promedio**

| Servicio | Uso | Costo |
|----------|-----|-------|
| Gemini | 50,000 requests | $12.50 |
| Supabase Pro | Necesario | $25 |
| **TOTAL** | - | **$37.50/mes** |

---

## ✅ Checklist Final

Antes de dar por terminado:

- [ ] Supabase configurado con extensión vector
- [ ] 10 documentos insertados con embeddings
- [ ] Variables de entorno configuradas
- [ ] Componente React integrado
- [ ] Probado con al menos 5 preguntas diferentes
- [ ] Respuestas relevantes y precisas
- [ ] Tiempos de respuesta < 3 segundos
- [ ] Código en GitHub
- [ ] Deployed a Vercel/Netlify

---

## 🎓 Próximos Pasos (Mejoras Futuras)

1. **Añadir más documentos**: Casos de uso, FAQs, tutoriales
2. **Implementar feedback**: Botones 👍👎 para mejorar respuestas
3. **Analíticas**: Dashboard de preguntas más comunes
4. **Multiidioma**: Entrenar documentos en inglés
5. **Integración con CRM**: Guardar leads interesados
6. **A/B Testing**: Probar diferentes prompts

---

**¡Tu chatbot con RAG está listo! 🎉**

Ahora tienes un asistente inteligente que puede responder preguntas específicas sobre tus productos con información actualizada y precisa.
