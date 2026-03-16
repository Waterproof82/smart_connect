# Agentes y Skills para Calidad, Arquitectura y Seguridad

Referencia rápida de los agentes y skills disponibles en Claude Code para revisión de calidad.

---

## Agentes de Revisión de Código

| Agente | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **Code Reviewer** | Feedback constructivo sobre correctitud, mantenibilidad, seguridad y rendimiento | Revisión general de PRs o cambios |
| **Software Architect** | Diseño de sistemas, DDD, patrones arquitectónicos, decisiones técnicas | Evaluar arquitectura y escalabilidad |
| **Backend Architect** | Diseño de APIs, bases de datos, microservicios, infraestructura cloud | Revisar diseño backend y APIs |
| **Security Engineer** | Threat modeling, vulnerabilidades, código seguro, OWASP | Auditoría de seguridad de aplicación |
| **Frontend Developer** | React/Vue/Angular, UI, rendimiento frontend | Revisar implementación frontend |
| **Database Optimizer** | Schema, queries, indexación, PostgreSQL/Supabase | Optimizar consultas y esquemas DB |

---

## Agentes de Testing y QA

| Agente | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **API Tester** | Validación de APIs, tests de rendimiento, QA de integraciones | Testear endpoints y Edge Functions |
| **Test Results Analyzer** | Evaluación de resultados de tests, métricas de calidad | Analizar fallos y cobertura |
| **Performance Benchmarker** | Medir y optimizar rendimiento de sistemas | Detectar cuellos de botella |
| **Evidence Collector** | QA con screenshots, encuentra 3-5 issues por defecto | Verificación visual de UI |
| **Reality Checker** | Certificación basada en evidencia, estricto | Validar que algo está production-ready |

---

## Agentes de Seguridad y Compliance

| Agente | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **Security Engineer** | Seguridad de aplicación, OWASP Top 10, código seguro | Revisión de seguridad general |
| **Compliance Auditor** | SOC 2, ISO 27001, HIPAA, PCI-DSS | Auditoría de cumplimiento normativo |
| **Threat Detection Engineer** | SIEM, MITRE ATT&CK, threat hunting | Detección de amenazas |
| **Incident Response Commander** | Gestión de incidentes, post-mortems, SLOs | Respuesta a incidentes producción |
| **Blockchain Security Auditor** | Smart contracts, DeFi, vulnerabilidades | Si se integran smart contracts |

---

## Agentes de Infraestructura y DevOps

| Agente | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **DevOps Automator** | CI/CD, automatización de infraestructura | Pipelines y despliegues |
| **SRE** | SLOs, error budgets, observabilidad, chaos engineering | Fiabilidad de producción |
| **Infrastructure Maintainer** | Fiabilidad de sistemas, rendimiento, operaciones | Mantenimiento de infra |

---

## Agentes de Documentación y Proceso

| Agente | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **Technical Writer** | Docs de desarrollador, APIs, READMEs, tutoriales | Documentar código y APIs |
| **Git Workflow Master** | Git workflows, branching, conventional commits | Estrategia de branches y commits |
| **Jira Workflow Steward** | Jira + Git, commits trazables, PRs estructurados | Trazabilidad de cambios |

---

## Agentes Especializados (Proyecto SmartConnect)

| Agente | Descripción | Relevancia |
|--------|-------------|------------|
| **Accessibility Auditor** | WCAG, tecnologías asistivas, diseño inclusivo | Landing page accesible |
| **SEO Specialist** | SEO técnico, contenido, autoridad de enlaces | Optimizar landing para Google |
| **UX Researcher** | Comportamiento de usuario, usabilidad, insights | Mejorar conversión de leads |
| **Analytics Reporter** | Dashboards, KPIs, análisis estadístico | Medir rendimiento de campañas |
| **MCP Builder** | Servidores MCP para extender capacidades de IA | Integraciones con Supabase MCP |

---

## Skills (Slash Commands)

### Calidad y Revisión

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **Audit** | `/audit` | Auditoría completa: accesibilidad, rendimiento, theming, responsive |
| **Critique** | `/critique` | Evaluación de diseño UX: jerarquía visual, arquitectura de info |
| **Simplify** | `/simplify` | Revisar código por reuso, calidad y eficiencia |
| **Polish** | `/polish` | Pase final de calidad: alineación, spacing, consistencia |

### Seguridad y Robustez

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **Harden** | `/harden` | Mejorar resiliencia: error handling, i18n, edge cases |
| **Optimize** | `/optimize` | Rendimiento: carga, rendering, animaciones, bundle size |

### Diseño y UX

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **Adapt** | `/adapt` | Adaptar diseños a diferentes pantallas y dispositivos |
| **Clarify** | `/clarify` | Mejorar UX copy, mensajes de error, etiquetas |
| **Distill** | `/distill` | Eliminar complejidad innecesaria, simplificar diseño |
| **Normalize** | `/normalize` | Normalizar diseño al design system existente |

### Mejora Visual

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **Animate** | `/animate` | Micro-interacciones y animaciones con propósito |
| **Bolder** | `/bolder` | Amplificar diseños conservadores |
| **Colorize** | `/colorize` | Agregar color estratégico |
| **Delight** | `/delight` | Momentos de alegría y personalidad en la UI |
| **Quieter** | `/quieter` | Reducir intensidad visual manteniendo calidad |

### Onboarding y Frontend

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **Onboard** | `/onboard` | Diseñar flujos de onboarding y empty states |
| **Frontend Design** | `/frontend-design` | Crear interfaces production-grade con alta calidad |
| **Extract** | `/extract` | Extraer componentes reutilizables al design system |

---

## Flujo Recomendado de Revisión

```
1. /audit          → Detectar problemas generales
2. /simplify       → Limpiar código redundante
3. Security Agent  → Revisar vulnerabilidades OWASP
4. /harden         → Fortalecer error handling
5. /optimize       → Mejorar rendimiento
6. /polish         → Pase final de calidad
7. Code Reviewer   → Revisión final de PR
```

---

## Cómo Invocar

**Agentes** (tareas complejas multi-paso):
```
"Usa el agente Security Engineer para auditar las Edge Functions"
"Lanza el Code Reviewer para revisar los cambios del PR"
```

**Skills** (comandos rápidos):
```
/audit
/simplify
/harden
/optimize
```
