# Plantillas de informe y audit log

## Informe final (en el chat; en español)

### Resumen ejecutivo
Estado general (1–3 frases con evidencia), 3–5 principales problemas, 3–5 principales oportunidades. Declara explícitamente qué quedó `NO VERIFICADO` y por qué.

### Hallazgos críticos
| Prioridad | Problema | URL/Archivo:línea | Evidencia | Impacto | Solución | Estado |
|---|---|---|---|---|---|---|

Estado: `Pendiente` · `Implementado` · `Validado` · `Requiere acción manual` · `NO VERIFICADO`.

### Secciones (omite las que no apliquen al alcance)
SEO técnico · SEO on-page · GEO/AEO · Schema · Search Console · Performance · Accesibilidad · SEO local · SEO internacional. En cada una: hallazgos con severidad, categoría, impacto, esfuerzo y nivel (`REQUISITO`/`RECOMENDACIÓN OFICIAL`/`BUENA PRÁCTICA`/`OPTIMIZACIÓN`/`HIPÓTESIS`/`EXPERIMENTO`).

### Validaciones ejecutadas
Lista exacta de comandos y resultados (lint, type-check, tests, build, curl, validadores) y de las pendientes de ejecución manual con pasos.

### Plan de acción
Ordenado P0 → P4, con esfuerzo estimado y dependencias. Nada de promesas de ranking/tráfico.

### Acciones manuales para el usuario
Lo que no se puede hacer desde código: solicitar indexación, enviar sitemap en GSC, rellenar GBP, activar protección de contraseñas filtradas, etc.

---

## Audit log — `docs/audit/YYYY-MM-DD_<tema>.md` (inglés)
```markdown
# <Title>

**Timestamp:** 2026-MM-DD HH:MM UTC
**Scope:** <pages / files>
**Type:** audit | implementation | validation

## Actions
- <What was done, e.g. "Added canonical to ...">

## Findings
| Priority | Finding | Evidence | Status |

## Validation
- `npm run lint`: pass/fail
- `npm run type-check`: pass/fail
- `npm run build`: pass/fail
- External tools: <done / pending manual>

## Follow-ups
- <Pending manual steps>
```

## CHANGELOG (inglés, `[Unreleased]`)
Una viñeta por cambio bajo `Added` / `Changed` / `Fixed` / `Security` / `Removed` / `Deprecated`, explicando qué y por qué (sin promesas de ranking).
