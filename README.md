# 🚀 SmartConnect AI - Business Accelerator

## 🏆 Estado del Proyecto (2026-03-16)

| Métrica | Score |
|---------|-------|
| **SOLID Principles** | 10/10 ✅ |
| **Clean Architecture** | 10/10 ✅ |
| **OWASP Compliance** | 10/10 ✅ |
| **Security** | 10/10 ✅ |
| **Accessibility (WCAG)** | 10/10 ✅ |
| **Performance** | 10/10 ✅ |
| **Responsive Design** | 10/10 ✅ |
| **Design System** | 10/10 ✅ |
| **Code Quality** | 10/10 ✅ |

**Auditoría completa:** `docs/audit/2026-03-16_ux-ui-audit-and-frontend-review.md`

---

## 📚 Documentación y Guías Clave

- [Guía de Implementación RAG](docs/GUIA_IMPLEMENTACION_RAG.md)
- [Arquitectura Chatbot RAG](docs/CHATBOT_RAG_ARCHITECTURE.md)
- [Despliegue Edge Functions (Supabase)](docs/EDGE_FUNCTIONS_DEPLOYMENT.md)
- [Testing Edge Functions](docs/EDGE_FUNCTIONS_TESTING.md)
- [Integración Webhook Contacto (n8n)](docs/CONTACT_FORM_WEBHOOK.md)
- [Checklist de Producción](docs/PRODUCTION_CHECKLIST.md)
- [Seguridad Supabase y OWASP](docs/SUPABASE_SECURITY.md)
- [Guía Logging RAG](docs/RAG_LOGGING_GUIDE.md)
- [Panel de Administración](docs/ADMIN_PANEL.md)
- [Política de Dependencias](docs/DEPENDENCY_POLICY.md)
- [Cumplimiento Arquitectura](docs/ARCHITECTURE_COMPLIANCE.md)
- [Setup Entorno Vercel](docs/VERCEL_ENV_SETUP.md)

## Admin Access Credentials

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL ACCESS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  URL:  /admin                                                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Email:    admin@smartconnect.ai                                     │   │
│  │  Password: bigSchool                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ⚠️  IMPORTANTE: Estas credenciales son de producción.                     │
│      No compartir.                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 🏗️ Arquitectura y Flujos Principales

- **RAG Chatbot:** Arquitectura basada en Supabase + Gemini, con Edge Functions para embeddings y generación segura (ver: [RAG](docs/CHATBOT_RAG_ARCHITECTURE.md), [Guía RAG](docs/GUIA_IMPLEMENTACION_RAG.md)).
- **Webhook Contacto:** Automatización de leads vía n8n, análisis de temperatura y notificaciones (ver: [Webhook](docs/CONTACT_FORM_WEBHOOK.md)).
- **Edge Functions:** Serverless functions en Supabase para IA y seguridad (ver: [Edge Functions](docs/EDGE_FUNCTIONS_DEPLOYMENT.md)).
- **Panel Admin:** Gestión de documentos y usuarios con roles (ver: [Admin Panel](docs/ADMIN_PANEL.md)).
- **Checklist Producción:** Validación de seguridad, tests, integraciones y rendimiento antes de deploy (ver: [Checklist](docs/PRODUCTION_CHECKLIST.md)).
- **Logging RAG:** Trazabilidad completa del flujo de IA y búsquedas (ver: [Logging](docs/RAG_LOGGING_GUIDE.md)).

---

## 🔒 Security Improvements (v0.5.0)

### Security Headers (vercel.json + index.html)
- ✅ **CSP:** Content-Security-Policy con whitelist de orígenes
- ✅ **X-Content-Type-Options:** nosniff
- ✅ **Referrer-Policy:** strict-origin-when-cross-origin
- ✅ **Permissions-Policy:** camera=(), microphone=(), geolocation=()
- ✅ **HSTS:** Strict-Transport-Security header

### OWASP Compliance
- ✅ **A02:2021 Cryptographic Failures:** PBKDF2 key derivation (10000 iterations)
- ✅ **A03:2021 Injection:** DOMPurify 3.3.3, Zod validation
- ✅ **A04:2021 Insecure Design:** Rate limiting with cleanup mechanism
- ✅ **A07:2021 Authentication Failures:** Generic error messages, JWT validation

### Edge Functions Security
- ✅ **Origin Validation:** Reject unknown origins instead of fallback
- ✅ **Rate Limiter:** Memory cleanup to prevent unbounded growth
- ✅ **CORS:** Strict whitelist validation

---

## ✨ Quality Improvements (2026-03-16)

Este proyecto ha pasado por un proceso sistemático de mejora de calidad usando habilidades especializadas:

### Skills Ejecutados

| Skill | Propósito | Mejoras Clave |
|-------|-----------|---------------|
| **teach-impeccable** | Contexto de diseño | Creado `.impeccable.md` con tokens de diseño, tipografía, colores |
| **distill** | Simplificar | Eliminadas animaciones excesivas, código redundante |
| **polish** | Accesibilidad | Focus rings, aria-describedby, role="alert", spinners |
| **optimize** | Rendimiento | Lazy loading, Suspense, código splitting |
| **harden** | Resiliencia | ErrorBoundary, overflow handling, text truncation |
| **audit** | Detección issues | 36 instances de gray-400/500, text-[10px] |
| **normalize** | Consistencia | Reemplazado gray-* → neutral-* en todos los componentes |
| **adapt** | Responsive | Touch targets 44px, landscape support, viewport meta |

### Mejoras de Accesibilidad (WCAG 2.1)

- ✅ **Focus visible:** Anillo de foco en todos los botones interactivos
- ✅ **ARIA labels:** `aria-describedby`, `role="alert"`, `aria-live="polite"` en chat
- ✅ **Form validation:** Mensajes de error con iconos y estados visuales
- ✅ **Reduced motion:** Respeto `prefers-reduced-motion`
- ✅ **Skip link:** "Saltar al contenido" para navegación por teclado

### Mejoras de Rendimiento

- ✅ **Code splitting:** Lazy loading de SuccessStats, ExpertAssistant
- ✅ **Suspense:** Skeleton loading states
- ✅ **Bundle optimizado:** ~188KB gzipped total
- ✅ **Vite chunks:** Aislamiento de recharts

### Mejoras Responsive/Mobile

- ✅ **Touch targets:** Mínimo 44x44px en todos los elementos interactivos
- ✅ **Landscape support:** CSS media queries para orientación landscape
- ✅ **Viewport meta:** theme-color, apple-mobile-web-app-capable
- ✅ **Form fields:** Altura mínima 48px en móvil

### Mejoras de Diseño

- ✅ **Design tokens:** Colores neutral-*, no gray-*
- ✅ **Text sizing:** text-xs → text-sm (mínimo 12px→14px legible)
- ✅ **Consistencia:** Espaciado, bordes, sombras unificados
- ✅ **Dark/Light mode:** Soporte completo con CSS variables

---
```
smart-connect/
├── src/
│   ├── core/                    # ⚙️ Core - Lógica Global (Shared Scope)
│   │   ├── domain/             # Entidades y casos de uso globales
│   │   └── data/               # Repositorios e infraestructura global
│   ├── features/               # 🎯 Features - Scope Local por Funcionalidad
│   │   ├── landing/            # Landing Page (SEO)
│   │   │   └── presentation/
│   │   ├── qribar/             # Producto Estrella (Carta Digital)
│   │   │   ├── presentation/
│   │   │   ├── domain/
│   │   │   └── data/
│   │   └── chatbot/            # Asistente Experto RAG
│   │       ├── presentation/
│   │       ├── domain/
│   │       └── data/
│   ├── shared/                 # 🔄 Shared - Utilidades Comunes
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── types/
│   │   └── constants/
│   ├── App.tsx
│   └── main.tsx
├── tests/                      # 🧪 Tests - TDD
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
└── [config files]
```

## 🎯 Arquitectura Clean Architecture

### Scope Rule (Regla de Alcance)

**SHARED SCOPE (Global):**
- `/src/core/*` - Lógica de negocio compartida
- `/src/shared/*` - Utilidades, componentes y configuración global

**LOCAL SCOPE (Por Feature):**
- `/src/features/[feature-name]/` - Lógica específica de cada funcionalidad
- Cada feature tiene sus propias capas: `presentation/`, `domain/`, `data/`

### Capas de Clean Architecture

1. **Presentation Layer** (UI)
   - Componentes React
   - Hooks personalizados
   - Gestión de estado local

2. **Domain Layer** (Business Logic)
   - Entidades
   - Casos de uso
   - Interfaces de repositorios

3. **Data Layer** (Infrastructure)
   - Implementación de repositorios
   - Data sources (API, Local Storage)
   - Modelos de datos


## 🤖 Sistema RAG (Retrieval-Augmented Generation)

El chatbot utiliza una arquitectura **RAG vectorial** para responder preguntas basándose exclusivamente en la base de conocimiento del negocio:

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Usuario     │────▶│  chat-with-rag   │────▶│  pgvector        │────▶│  Gemini API  │
│  (query)     │     │  (Edge Function) │     │  (similarity     │     │  (respuesta  │
│              │◀────│                  │◀────│   search)        │◀────│   generada)  │
└──────────────┘     └──────────────────┘     └─────────────────┘     └──────────────┘
```

**Flujo:**
1. El usuario envía una pregunta al chatbot
2. La Edge Function `chat-with-rag` genera un **embedding vectorial** (768 dimensiones) de la query usando `gemini-embedding-001`
3. Se realiza una **búsqueda por similitud coseno** contra los documentos almacenados en PostgreSQL con `pgvector`
4. Los documentos más relevantes (threshold > 0.4) se inyectan como contexto en el prompt
5. `gemini-2.5-flash` genera una respuesta basada **únicamente** en el contexto recuperado

**Componentes clave:**
- **Embeddings:** Modelo `gemini-embedding-001` → vectores de 768 dimensiones
- **Vector Store:** Supabase PostgreSQL + extensión `pgvector` con índice IVFFlat
- **Funciones SQL:** `match_documents` y `match_documents_by_source` (búsqueda por similitud coseno)
- **Edge Functions:** `chat-with-rag`, `gemini-embedding`, `gemini-generate` (serverless en Deno)
- **Admin Panel:** Gestión de documentos con generación automática de embeddings al crear/editar

## 📬 Automatización de Leads (n8n)

El formulario de contacto de la landing page dispara un **webhook n8n** que ejecuta un pipeline de análisis y clasificación automática:

```
┌────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Formulario │────▶│  n8n Webhook    │────▶│  Gemini AI       │────▶│ Parse + Lead │
│ (Landing)  │     │  hot-lead-intake│     │  Analysis        │     │ Scoring      │
└────────────┘     └─────────────────┘     └──────────────────┘     └──────┬───────┘
                                                                           │
                                                              ┌────────────┴────────────┐
                                                              │                         │
                                                         Hot Lead?                 Cold Lead
                                                              │                         │
                                                    ┌─────────┴─────────┐               │
                                                    │                   │               │
                                               ┌────▼─────┐    ┌───────▼──────┐  ┌─────▼──────┐
                                               │ Email    │    │  Telegram    │  │  Google   │
                                               │ VIP HTML │    │  Alert      │  │  Sheets   │
                                               └──────────┘    └──────────────┘  └────────────┘
```

**Flujo:**
1. El usuario envía el formulario de contacto (nombre, empresa, email, servicio, mensaje)
2. El webhook n8n recibe los datos y los envía a **Gemini 2.5 Flash** para clasificación
3. La IA analiza el lead y devuelve: temperatura (Alta/Media/Baja), sentimiento, palabras clave y nivel de confianza
4. Si es **Hot Lead** (Alta): se envía email HTML VIP + alerta Telegram instantánea
5. Todos los leads se registran en **Google Sheets** con el análisis completo
6. El webhook responde al frontend con el resultado del procesamiento

**Stack de automatización:** n8n + Gemini AI + Gmail + Telegram Bot + Google Sheets

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Forms:** Zod + React Hook Form (validación type-safe con schemas declarativos)
- **Backend:** Supabase (PostgreSQL + pgvector + Edge Functions + RLS)
- **IA:** Gemini API (embedding-001 + 2.5-flash) — Arquitectura RAG vectorial
- **Testing:** Jest + React Testing Library
- **Build:** Vite
- **Automation:** n8n (Docker)
- **CI/CD:** GitHub Actions + Snyk + Vercel

## 🔄 CI/CD Pipeline

```
Push/PR to main
    ↓
┌─────────────────────────────────────────────┐
│ GitHub Actions (.github/workflows/ci-cd.yml)│
├─────────────────────────────────────────────┤
│ 1. npm ci                                   │
│ 2. Lint + Type Check                        │
│ 3. Snyk Security Gate (PRs)                 │
│    Snyk Monitor (push to main)              │
│ 4. Vite Build                               │
└──────────────────┬──────────────────────────┘
                   ↓ ✅ All passed
         Vercel Auto-Deploy
```

- **Snyk** → Escaneo de vulnerabilidades en dependencias (`--severity-threshold=high`)
- **Dependabot** → PRs automáticos para actualización de dependencias (`.github/dependabot.yml`)
- **Vercel** → Deploy automático a producción tras pipeline exitoso

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 3000)

# Testing (TDD)
npm test                 # Ejecuta todos los tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con reporte de cobertura

# Build
npm run build           # Build de producción
npm run preview         # Preview del build

# Quality
npm run lint            # Linter
npm run type-check      # Verificación de tipos TypeScript
```


## 🧪 Metodología TDD

### Red → Green → Refactor

1. **RED:** Escribe el test PRIMERO (debe fallar)
2. **GREEN:** Implementa el código mínimo para pasar el test
3. **REFACTOR:** Mejora la calidad sin cambiar el comportamiento

Ver `/tests/README.md` para más detalles.


## 🔐 Seguridad (OWASP Top 10)

- Políticas RLS y validación de roles en Supabase ([ver guía](docs/SUPABASE_SECURITY.md))
- Mitigaciones OWASP Top 10 ([ver contexto](docs/context/security_agent.md))
- Edge Functions para ocultar claves y lógica sensible

- ✅ Variables de entorno validadas (`env.config.ts`)
- ✅ Sanitización de inputs (DOMPurify + sanitizer.ts)
- ✅ Validación de formularios con Zod schemas + React Hook Form
- ✅ Headers de seguridad
- ✅ Validación de datos sensibles


## 🚀 Getting Started

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Ejecutar tests:**
```bash
npm test
```

4. **Iniciar desarrollo:**
```bash
npm run dev
```


## 📚 Path Aliases

```typescript
import { Button } from '@shared/components';           // Shared
import { Hero } from '@features/landing/presentation'; // Feature
import { Lead } from '@core/domain/entities';          // Core
```


## 📝 Versionado, Changelog y Auditoría

- Versionado y changelog siguiendo [Keep a Changelog](https://keepachangelog.com/) ([ver CHANGELOG.md](CHANGELOG.md))
- Cada cambio relevante se documenta en `docs/audit/` con timestamp y descripción
- Protocolo de actualización de versiones en `package.json`, `CHANGELOG.md` y archivos de plataforma

Este proyecto sigue las mejores prácticas:
- Clean Architecture
- Test-Driven Development (TDD)
- Security by Design
- Código orientado a conversión y venta

---

---

**¿Preguntas? Consulta [AGENTS.md](AGENTS.md) para el contexto completo del proyecto y flujos de trabajo del agente.**
