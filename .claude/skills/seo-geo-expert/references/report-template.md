# Plantillas de informe y audit log

## Informe final (en el chat; en español)

### Resumen ejecutivo
Estado general (1–3 frases con evidencia), 3–5 principales problemas, 3–5 principales oportunidades. Declara explícitamente qué quedó `NO VERIFICADO` y por qué.

### Hallazgos críticos
| Prioridad | Estado | Severidad | Categoría | Problema | URL/Archivo:línea | Evidencia (E0–E5) | Impacto | Esfuerzo | Solución |
|---|---|---|---|---|---|---|---|---|---|

Estado de la comprobación: `PASS` · `FAIL` · `WARNING` · `NOT VERIFIED` · `NOT APPLICABLE`. Progreso del hallazgo: `Pendiente` · `Implementado` · `Validado` · `Requiere acción manual`.

Por cada cambio implementado: **BEFORE / CHANGE / AFTER / REGRESSION CHECK** (ver `SKILL.md`). Si no hace falta cambiar nada: `PASS` + evidencia (NO CHANGE REQUIRED).

### Secciones (omite las que no apliquen al alcance)
SEO técnico · SEO on-page · GEO/AEO · Schema · Search Console · Performance · Accesibilidad · SEO local · SEO internacional. En cada una: hallazgos con severidad, categoría, impacto, esfuerzo y nivel (`REQUISITO`/`RECOMENDACIÓN OFICIAL`/`BUENA PRÁCTICA`/`OPTIMIZACIÓN`/`HIPÓTESIS`/`EXPERIMENTO`).

### QUALITY GATE (sin puntuación numérica)
```
SEO Technical ........ PASS/FAIL/WARNING
Indexability ......... PASS/FAIL/WARNING
Content .............. PASS/FAIL/WARNING
Entities ............. PASS/FAIL/WARNING
Structured Data ...... PASS/FAIL/WARNING
GEO/AEO .............. PASS/FAIL/WARNING
Performance .......... PASS/FAIL/WARNING
Accessibility ........ PASS/FAIL/WARNING
Security ............. PASS/FAIL/WARNING
Spam policies ........ PASS/FAIL
Local SEO ............ PASS/FAIL/NA
International SEO .... PASS/FAIL/NA
Search Console ....... VERIFIED/NOT VERIFIED
```
Un `FAIL` en Indexability, Security o Spam policies bloquea el cierre. Justifica cada línea con una referencia a un hallazgo.

### Validaciones ejecutadas
Lista exacta de comandos y resultados (lint, type-check, tests, build, curl, validadores) y de las pendientes de ejecución manual con pasos.

### Plan de acción
Ordenado P0 → P4, con esfuerzo estimado y dependencias. Nada de promesas de ranking/tráfico.

### Datos necesarios (si procede)
Tabla según `data-requests.md`: `Fuente · Informe/dato exacto y ruta · Rango · Desbloquea (hallazgo) · Prioridad (Imprescindible/Recomendado/Opcional) · Formato`. Solo lo que cierre un `NOT VERIFIED`, desbloquee una decisión o mida un cambio. Si no se necesita nada: *"No se necesitan datos externos adicionales"*. Sin datos personales.

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
