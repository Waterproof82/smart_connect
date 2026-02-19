# 🚀 SmartConnect AI - Business Accelerator

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

## 📋 Estructura del Proyecto

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

- **Frontend:** Next.js + TypeScript + Tailwind CSS
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

## 🎓 Filosofía del Proyecto

Este proyecto sigue las mejores prácticas:
- Clean Architecture
- Test-Driven Development (TDD)
- Security by Design
- Código orientado a conversión y venta

---

**¿Preguntas? Consulta AGENTS.md para el contexto completo del proyecto.**
