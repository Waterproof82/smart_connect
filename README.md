# 🚀 SmartConnect AI - Business Accelerator

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


## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Testing:** Jest + React Testing Library
- **Build:** Vite
- **AI:** Gemini (Google AI Studio)
- **Automation:** n8n (Docker)


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
- ✅ Sanitización de inputs
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
