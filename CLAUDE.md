# 🤖 AGENT.md: SmartConnect AI - Business Accelerator

Este documento establece el contexto, reglas y arquitectura para el desarrollo de SmartConnect AI, un ecosistema diseñado para potenciar negocios locales mediante software, automatización e IA.

---

## 🚀 INICIALIZACIÓN DEL AGENTE (LEER PRIMERO)

Antes de cualquier tarea, el agente debe cargar contexto en este orden:

### 1️⃣ **CONTEXTO OBLIGATORIO** (Siempre leer)
- 📂 **`docs/context/`** → Guías de contexto específico:
  - `adr.md` → Cómo crear Architecture Decision Records
  - `readme_testing.md` → Estrategia de testing y TDD
  - `security_agent.md` → Protocolos de seguridad OWASP
- 📄 **`docs/GUIA_IMPLEMENTACION_RAG.md`** → RAG chatbot implementation

### 2️⃣ **ARQUITECTURA GENERAL** (Si es necesario)
- 📄 **`ARQUITECTURA.md`** → Visión completa del sistema
- 📂 **`docs/slides/`** → Presentaciones visuales de flujos:
  - `01-sistema-completo.md` → Vista general del ecosistema
  - `02-flujo-usuario.md` → Journey del usuario
  - `03-flujo-chatbot-rag.md` → Cómo el chatbot responde
  - `04-flujo-autenticacion.md` → Login y roles
  - `05-flujo-seguridad-rls.md` → Políticas de acceso
  - `06-arquitectura-tecnica.md` → Stack tecnológico

### 3️⃣ **DOCUMENTACIÓN TÉCNICA** (Según tarea)
- 📂 **`docs/`** → Guías específicas:
  - `CHATBOT_RAG_ARCHITECTURE.md` → RAG técnico completo
  - `CONTACT_FORM_WEBHOOK.md` → Integración n8n webhook
  - `EDGE_FUNCTIONS_DEPLOYMENT.md` → Supabase Edge Functions

### 4️⃣ **HISTORIAL** (Para debugging)
- 📂 **`docs/audit/`** → Logs de operaciones anteriores
- 📂 **`docs/adr/`** → Decisiones arquitectónicas tomadas
- 📄 **`CHANGELOG.md`** → Historial de versiones

---

## 🎯 PROPÓSITO DE NEGOCIO (Agencia-Escuela)
El objetivo es transformar negocios mediante soluciones técnicas que aporten valor inmediato. 
- **Reputación:** Tarjetas NFC/QR para potenciar Google Reviews e Instagram (estilo Tapstar).
- **Digitalización:** Producto estrella "QRIBAR" (Carta digital con pedidos en mesa).
- **Crecimiento:** Automatizaciones de captación y fidelización basadas en la temperatura del lead.

---

## 🏗️ ARQUITECTURA HÍBRIDA & STACK
El proyecto sigue un modelo de alto rendimiento y escalabilidad:

1. **Landing Page (SEO Frontend):** - **Stack:** React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS 3.4 + Zod 3.25 + React Hook Form 7.71.
   - **Misión:** Indexación SEO máxima y landing de conversión para campañas de Facebook/Google.
2. **Dashboard & Chatbot (App Frontend):** - **Stack:** React 19 + Vite 8 + TypeScript 5.9 + Zod 3.25 + React Hook Form 7.71.
   - **Misión:** Panel de administración y Chatbot experto con arquitectura RAG.
3. **Orquestador (Automation Backend):** - **Stack:** n8n en Railway/VPS propio.
   - **Misión:** Gestión de leads, análisis de sentimiento y notificaciones.
4. **Cerebro IA:** - **API:** Gemini 1.44 (@google/genai) - Pago por uso.
   - **Infraestructura:** Supabase 2.99 (PostgreSQL + pgvector + Edge Functions).

---

## 🛠️ METODOLOGÍA Y REGLAS TÉCNICAS
Se aplican los estándares de calidad del Máster de Desarrollo con IA:

1. **TDD (Test-Driven Development):** - Escribir test PRIMERO -> Rojo -> Verde -> Refactorizar.
2. **Clean Architecture & Scope Rule:**
   - **Capas:** Data (Infra), Domain (Business Logic), Presentation (UI).
   - **Shared Scope:** Código global reutilizable.
   - **Local Scope:** Lógica específica de la feature (ej: /qribar, /chatbot).
3. **Seguridad (Security by Design):**
   - Implementación estricta de mitigaciones OWASP Top 10.
   - Validación de datos sensibles y variables de entorno.

---

## 🔄 FLUJO DEL LEAD (Pipeline)
1. **Captación:** Botones con asuntos predefinidos en la Landing (React + Vite).
2. **Chatbot RAG:** El bot en React responde dudas usando embeddings vectoriales (pgvector + Gemini) sobre QRIBAR, NFC y servicios.
3. **Análisis n8n:** Recepción de email -> Agente IA analiza "Temperatura" y sentimiento.
4. **Registro:** Guardado automático en Google Sheets con actualización de estados.
5. **Cierre:** Lead Caliente -> Notificación Telegram + Email HTML con botón de llamada (Webhook tracking).

---

## 📋 INSTRUCCIONES PARA LA IA (TU ROL)

### Métricas del Proyecto (2026-03-16)
- **Architecture Score:** 10/10 ✅
- **SOLID Compliance:** 10/10 ✅
- **OWASP Compliance:** 10/10 ✅
- **Security Score:** 10/10 ✅
- **Accessibility Score:** 10/10 ✅
- **Performance Score:** 10/10 ✅
- **Responsive Score:** 10/10 ✅
- **Code Quality Score:** 10/10 ✅

### Flujo de trabajo obligatorio:
1. **INICIALIZACIÓN:** Lee `docs/context/` relevante ANTES de empezar cualquier tarea
2. **CONTEXTO:** Si necesitas entender el sistema completo → `ARQUITECTURA.md`
3. **PRECISIÓN:** NO generes código no solicitado
4. **TDD:** Si pido un TEST, genera SOLO el test. Si pido IMPLEMENTACIÓN, genera SOLO la implementación
5. **RAG:** Usa siempre el conocimiento sobre QRIBAR y servicios de software para las respuestas del bot
6. **NEGOCIO:** Cada línea de código debe estar orientada a facilitar la venta o la conversión del cliente final

### Consulta documentación según el tipo de tarea:
- **Testing/TDD** → `docs/context/readme_testing.md`
- **Seguridad** → `docs/context/security_agent.md`
- **ADR** → `docs/context/adr.md`
- **Chatbot RAG** → `docs/GUIA_IMPLEMENTACION_RAG.md`
- **Webhook/n8n** → `docs/CONTACT_FORM_WEBHOOK.md`
- **Edge Functions** → `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`

---

## 4. PROTOCOLOS DE MANTENIMIENTO AUTOMÁTICO

Tras aplicar cambios en el código (features, fixes, refactors), el agente debe ejecutar los siguientes protocolos:

### 4.1. Protocolo de Versionado

El agente debe actualizar los archivos de versión del proyecto basándose en la naturaleza del cambio (Major, Minor, Patch).

* **`pubspec.yaml`:**
    * Actualizar `version:` (Formato: major.minor.patch+build).
* **`android/app/build.gradle`:**
    * `versionCode` (debe coincidir con el build number).
    * `versionName` (debe coincidir con major.minor.patch).
* **`ios/Runner/Info.plist`:**
    * `CFBundleShortVersionString` (debe coincidir con major.minor.patch).
    * `CFBundleVersion` (debe coincidir con el build number).

### 4.2. Protocolo de `CHANGELOG.md`

El agente debe documentar el cambio realizado en el archivo `CHANGELOG.md`, adhiriéndose estrictamente al formato **Keep a Changelog 1.1.0**.

* **Principio:** Los *changelogs* son para humanos, no para máquinas.
* **Idioma:** Inglés.
* **Estructura:**
    * El orden debe ser cronológico inverso (la versión más reciente primero).
    * Debe existir una sección `[Unreleased]` en la parte superior para agrupar los cambios pendientes de lanzamiento.
    * Cada versión debe tener un encabezado `## [Version] - YYYY-MM-DD`.
* **Tipos de Cambio (Etiquetas Requeridas):** Todo cambio debe agruparse bajo una de las siguientes seis etiquetas:
    * `Added`: Para nuevas funcionalidades (*features*).
    * `Changed`: Para cambios en funcionalidades existentes.
    * `Deprecated`: Para funcionalidades que serán eliminadas próximamente.
    * `Removed`: Para funcionalidades eliminadas.
    * `Fixed`: Para cualquier corrección de *bugs*.
    * `Security`: En caso de vulnerabilidades.

### 4.3. Protocolo de Documentación (Audit Log)

El agente debe registrar cada operación que realice (generación, refactorización, validación).

* **Ubicación:** `docs/audit`
* **Formato:** Archivo Markdown (`.md`).
* **Idioma:** Inglés.
* **Contenido:** El registro debe incluir la fecha y hora (timestamp) y una descripción de la acción (ej. *Refactored class 'X' to apply SRP.*).

### 4.4. Protocolo de Supabase Database Lint

Al ejecutar el linter de Supabase, pueden aparecer warnings que requieren acciones manuales:

**Configuración manual (Dashboard de Supabase):**
- **Leaked Password Protection:** Ir a Authentication > Providers > Email y habilitar "Enable leaked password protection"

**Warnings conocidos (no críticos):**
- **Extension in public:** La extensión `vector` en schema `public` es aceptable en Supabase
- **Auth allow anonymous sign_ins:** Son intencionales para permitir el chatbot RAG y landing page:
  - `documents`: SELECT público para chatbot
  - `app_settings`: SELECT público para landing page
  - `security_logs`: Solo admins y service_role

**¿Entendido? Confirma para comenzar con el primer paso del desarrollo.**

---

## SDD - Perfil FREE

### Modelo activo
Leer `.opencode/active-profile.json` → usar `profiles/free.json`

### Fases y modelos
| Fase | Modelo primario |
|---|---|
| sdd-init | qwen3.6-plusfree |
| sdd-explore | mistral/mixtral-8x22b |
| sdd-propose | mistral-large-3 |
| sdd-spec | mistral/devstral-medium |
| sdd-design | pixtral-large-latest |
| sdd-tasks | mistral/mistral-nemo |
| sdd-apply | mistral/codestral-latest |
| sdd-verify | mistral/codestral-latest |
| sdd-archive | mimo-v2-omni-free |

### Reglas
- NO saltear fases
- Reportar al terminar cada fase antes de continuar
- Fallbacks en `.opencode/profiles/free.json`
- sdd-apply requiere confirmación explícita del usuario
- Si health.json tiene alertas CRITICAL → detener y notificar

### SEO Implementation for Landing Page (i18n)

**Fases ejecutadas exitosamente:**

| Phase | Model Used | Status |
|-------|-------------|--------|
| sdd-init | mistral/mistral-large-latest | ✅ |
| sdd-explore | mistral/open-mixtral-8x22b | ✅ |
| sdd-propose | mistral/mistral-large-latest | ✅ |
| sdd-apply | mistral/codestral-latest | ✅ |
| sdd-verify | mistral/codestral-latest | ✅ |
| sdd-archive | opencode/big-pickle | ✅ |

**Archivos modificados:**
- `src/shared/context/LanguageContext.tsx` - SEO keys (seoTitle, seoDescription, seoProductDescription) agregadas en `es` y `en`
- `src/features/landing/presentation/LandingContainer.tsx` - Meta tags usando `t.seoTitle`, `t.seoDescription`, structured data con `t.seoProductDescription`
- `src/features/landing/presentation/components/Contact.tsx` - Headings usando `t.contactTitle`, `t.contactSubtitle`
- `tsconfig.json` - Agregado `esModuleInterop: true` para fix de react-router types

**Validaciones pasadas:**
- ✅ Linting: `npm run lint` passed
- ✅ Type checking: `npm run type-check` passed
- ✅ Zero hardcoded strings - full i18n compliance
- ✅ Structured data: JSON-LD format correct
- ✅ Security: No API keys leaked

**Documentación creada:**
- `docs/SEO_IMPLEMENTATION.md` - Guía completa de implementación SEO

**Engram Memory:** SEO implementation saved (ID: 1, Topic: `seo/landing-page-i18n`)

## Design Context

### Users
Local restaurants, bars, and cafes - hospitality businesses that need digital tools (QR menus, NFC cards, AI chatbots) to grow their business. Users are typically business owners without deep technical knowledge who want simple, effective solutions.

### Brand Personality
- **Tech-forward**: Emphasize innovation, AI-powered capabilities, modern technology
- **Trustworthy**: Reliable, professional, established authority in the space
- **Professional**: Clean, polished, business-appropriate aesthetics

### Aesthetic Direction
- Modern & Professional feel with a blue primary color (slight purple tint)
- Dark/light mode support (both equally important)
- Clean, uncluttered interfaces that don't overwhelm non-technical users
- Clear visual hierarchy - ONE primary action per screen

### Design Principles
1. **Clarity over complexity** - Every element must justify its existence
2. **Tech-forward visual identity** - Use the existing design tokens (blue primary, Space Grotesk display font) to convey innovation
3. **Respect user intelligence** - Don't over-explain, but provide clear paths to success
4. **Progressive disclosure** - Hide advanced options until needed
5. **Accessible by default** - WCAG compliant, support reduced motion, touch-friendly targets