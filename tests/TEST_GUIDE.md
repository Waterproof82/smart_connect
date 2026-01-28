# 🧪 SmartConnect AI - Test Suite

## Estructura de Tests

```
tests/
├── unit/              # Tests unitarios (mocks, sin red)
│   └── chatbot/
│       └── RAGService.test.ts
├── integration/       # Tests de integración (Edge Functions reales)
│   └── edgeFunctions.test.ts
└── e2e/              # Tests end-to-end (flujo completo)
    └── chatbotFlow.test.ts
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Mode watch para desarrollo
npm run test:watch

# Cobertura de código
npm run test:coverage
```

## Requisitos

### Para tests unitarios
- No requiere configuración adicional (usan mocks)

### Para tests de integración y E2E
- Archivo `.env.local` configurado con:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Edge Functions desplegadas en Supabase
- Base de datos RAG entrenada con documentos

## Tests Implementados

### ✅ Unit Tests (`tests/unit/chatbot/RAGService.test.ts`)
- `generateEmbedding()` - Generación de embeddings
- `searchSimilarDocs()` - Búsqueda por similitud
- `generateWithRAG()` - Generación con contexto RAG

### ✅ Integration Tests (`tests/integration/edgeFunctions.test.ts`)
- Edge Function `gemini-embedding` - Embeddings reales
- Edge Function `gemini-generate` - Generación de respuestas
- Supabase RPC `match_documents` - Búsqueda vectorial

### ✅ E2E Tests (`tests/e2e/chatbotFlow.test.ts`)
- Flujo completo RAG: Query → Embedding → Search → Generate
- Manejo de queries sin matches en KB
- Validación de respuestas en español

## Buenas Prácticas

1. **Tests unitarios** deben ejecutarse en <1s (usan mocks)
2. **Tests de integración** pueden tomar 5-15s (llamadas API reales)
3. **Tests E2E** pueden tomar 20-30s (flujo completo)
4. Usar `beforeEach` para limpiar mocks/estado
5. Usar timeouts generosos para llamadas a Gemini API
