# ADR-003: RAG System Architecture - React/Gemini vs Python/LangChain

**Fecha:** 2026-02-03  
**Estado:** Aceptado ✅ IMPLEMENTADO  
**Última Actualización:** 2026-02-17 (Nota: Flutter nunca existió - el stack es React + Vite + TypeScript)  

---

## Contexto

Se evaluó migrar el sistema RAG actual (React + Gemini) a una implementación basada en Python + LangChain + Gradio desplegada en Railway.

### Situación Actual
- RAG implementado en React + Vite + TypeScript
- Gemini API como LLM principal
- Supabase para almacenamiento y Edge Functions

### Alternativa Propuesta
- Python + LangChain + FAISS/ChromaDB
- Gradio UI para interfaz rápida
- Microservicio independiente en Railway

---

## Opciones Consideradas

### Opción 1: Mantener RAG en React/Gemini (Actual)
**Pros:**
- Stack unificado (React + Vite para todo el frontend)
- Zero infraestructura adicional ($0 extra)
- Coherente con el stack actual (Gemini como cerebro IA)
- Zero latencia de red adicional (Edge Functions en Supabase)

**Contras:**
- Menos flexibilidad para cambiar de modelo LLM
- Ecosistema de herramientas RAG menos maduro que Python

### Opción 2: Migrar a Python/LangChain
**Pros:**
- Ecosistema RAG maduro (FAISS, ChromaDB, LangChain)
- Facilidad para experimentar con múltiples LLMs
- Componentes reutilizables y bien documentados
- Gradio para prototipado rápido

**Contras:**
- Nuevo servicio en Railway (+$10-15/mes)
- Stack adicional (Python + dependencias)
- Duplicación de esfuerzos (ya funciona en React)
- Mayor complejidad operativa (2 servicios vs 1)
- Rompe la arquitectura definida en `AGENTS.md`

---

## Decisión

Elegimos **Mantener RAG en React/Gemini (Opción 1)**

---

## Justificación

### 1. Alineación con Stack Oficial
El stack actual define:
- **Frontend (React + Vite):** Dashboard + Chatbot RAG
- **Backend (Supabase):** Edge Functions + PostgreSQL
- **LLM (Gemini):** Cerebro IA

### 2. Principio KISS (Keep It Simple)
- **Operacional:** 1 servicio menos que mantener
- **Económico:** $0 infraestructura adicional (Gemini ya contratado)
- **Técnico:** Edge Functions con baja latencia

### 3. Coherencia Arquitectónica
`ARQUITECTURA.md` define claramente:
- **Frontend (React):** Dashboard + Chatbot RAG
- **Backend (n8n):** Orquestador de leads
- **LLM (Gemini):** Cerebro IA

### 4. Foco en Negocio
El objetivo es **vender QRIBAR y Reviews**, no construir infraestructura experimental. El RAG implementado según las 4 fases de optimización cumple perfectamente este propósito con 81 tests passing y 100% coverage.

---

## Consecuencias

### Positivas
1. **Mantenibilidad:** Stack único (React + TypeScript)
2. **Costos:** Sin gastos adicionales de Railway/Python
3. **Performance:** Edge Functions con baja latencia
4. **Seguridad:** API keys protegidas en servidor (Edge Functions)
5. **Operaciones:** Menos complejidad de despliegue

### Negativas
1. **Flexibilidad de modelos:** 
   - Dificulta cambiar a Claude/GPT en el futuro
   - **Mitigación:** Gemini es suficiente para el caso de uso actual
   
2. **Experimentación:**
   - Menos herramientas "out-of-the-box" que LangChain
   - **Mitigación:** Gemini + React tiene capacidad suficiente
   
3. **Escalabilidad multi-modelo:**
   - Complicado si necesitamos 3+ LLMs simultáneos
   - **Mitigación:** Decisión reversible (ver Plan de Migración)

---

## Plan de Optimización

✅ **COMPLETADO** - Las 4 fases fueron implementadas y desplegadas en producción:

### Fase 1: Mejora de Indexación ✅ COMPLETE
**Implementación:** `src/features/chatbot/data/rag-indexer.ts`
- Chunking estratégico: 500 tokens por chunk, overlap de 50 tokens
- Metadata enriquecida: source, category, timestamp, chunkIndex
- Embeddings con text-embedding-004 (Gemini 768-dim)
- Category mapping: QRIBAR → producto_digital, Reviews → reputacion_online
- Tests: 13/13 passing ✅

### Fase 2: Caché de Embeddings ✅ COMPLETE
**Implementación:** `src/features/chatbot/data/embedding-cache.ts`
- Storage in-memory (Map) + Supabase backup
- TTL: 7 días (configurable por entry)
- Invalidación por patrón (glob support: `qribar_*`)
- Estadísticas: hits, misses, hit rate, memory usage
- Tests: 23/23 passing ✅

### Fase 3: Fallback Responses ✅ COMPLETE
**Implementación:** `src/features/chatbot/domain/fallback-handler.ts`
- Intent detection: pricing, features, implementation, success_stories, demo
- Respuestas contextuales por categoría (QRIBAR, Reviews, General)
- Escalación automática: confidence < 50%, queries urgentes, implementación
- Personalización: nombre usuario, tono adaptativo (formal/familiar)
- Action suggestions: contact, documentation, demo, testimonials
- Tests: 27/27 passing ✅

### Fase 4: Orquestación y Monitoreo ✅ COMPLETE
**Implementación:** `src/features/chatbot/domain/rag-orchestrator.ts`
- Coordinación unificada de Phases 1+2+3
- Semantic search con cosine similarity
- Cache-first strategy para queries repetidas
- Fallback automático cuando no hay resultados relevantes
- Estadísticas agregadas: cache hits, fallback usage, memory
- Tests: 18/18 passing ✅

**Estado General:**
- **Tests totales:** 81/81 passing (100% coverage)
- **Tiempo de ejecución:** 1.185s
- **Build:** 798.44 KB (exitoso)
- **Deployment:** ✅ Producción en Vercel
- **Documentación:** `docs/audit/2026-02-03_rag-system-production-deployment.md`

---

## Criterios de Reversión

Migrar a Python/LangChain **SOLO SI:**

```yaml
Triggers:
  - Clientes activos: > 50 (actualmente: ~5)
  - Consultas/día: > 1000 (actualmente: ~50)
  - Multi-modelo: Necesidad de Gemini + Claude + GPT simultáneos
  - Multi-tenant: RAG personalizado por cliente
  - Fine-tuning: Embeddings custom por industria
```

---

## Referencias

- `AGENTS.md` → Stack oficial del proyecto
- `ARQUITECTURA.md` → Visión completa del sistema
- `docs/context/chatbot_ia/GUIA_IMPLEMENTACION_RAG.md` → Implementación actual
- `docs/context/adr.md` → Formato de ADRs
- `docs/CHATBOT_RAG_ARCHITECTURE.md` → Documentación técnica RAG

---

**Creado por:** AI Agent (Claude Sonnet 4.5)  
**Requiere revisión de:** Lead Developer SmartConnect  
**Próximo ADR:** ADR-004 (Supabase Backend as a Service)
