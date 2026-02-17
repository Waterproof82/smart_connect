# Architecture Decision Records (ADR)

Este directorio contiene los registros de decisiones arquitectónicas del proyecto **SmartConnect AI**.

## ¿Qué es un ADR?

Un ADR (Architecture Decision Record) documenta una decisión arquitectónica importante junto con su contexto y consecuencias. El objetivo es capturar el **"por qué"** detrás de cada decisión técnica.

## Índice de ADRs

| ID | Título | Estado | Fecha |
|----|--------|--------|-------|
| [ADR-001](ADR-001-clean-architecture.md) | Adopción de Clean Architecture con Scope Rule | Aceptado | 2026-01-26 |
| [ADR-002](ADR-002-n8n-webhook-contact-form.md) | n8n Webhook para Formulario de Contacto | Aceptado | 2026-02-04 |
| [ADR-003](ADR-003-rag-architecture-decision.md) | RAG System Architecture - Flutter/Gemini vs Python/LangChain | Aceptado | 2026-02-03 |
| [ADR-004](ADR-004-supabase-backend-as-a-service.md) | Supabase como Backend as a Service | Aceptado | 2026-02-04 |


## Estados posibles

- **Propuesto**: Decisión en discusión, aún no implementada.
- **Aceptado**: Decisión aprobada y en uso.
- **Deprecado**: Decisión que ya no se recomienda pero sigue en uso.
- **Reemplazado**: Decisión sustituida por otra (ver ADR que la reemplaza).

## Plantilla

Para crear un nuevo ADR, usa la plantilla en [_template.md](_template.md).
