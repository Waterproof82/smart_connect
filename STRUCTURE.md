# 📁 Estructura del Proyecto - Visual Overview

```
smart-connect/
│
├── 📂 src/                           # Source code principal
│   ├── 📂 core/                      # ⚙️ SHARED SCOPE - Lógica Global
│   │   ├── 📂 domain/               
│   │   │   ├── entities/            # Entidades globales (User, Business, etc.)
│   │   │   ├── usecases/            # Casos de uso compartidos
│   │   │   └── repositories/        # Interfaces de repositorios
│   │   └── 📂 data/
│   │       ├── repositories/        # Implementaciones de repositorios
│   │       └── datasources/         # APIs, LocalStorage, etc.
│   │
│   ├── 📂 features/                  # 🎯 LOCAL SCOPE - Features Independientes
│   │   │
│   │   ├── 📂 landing/              # Landing Page (SEO)
│   │   │   └── presentation/
│   │   │       └── components/      # Navbar, Hero, Features, Stats, Contact
│   │   │
│   │   ├── 📂 qribar/               # 🍔 QRIBAR - Producto Estrella
│   │   │   ├── presentation/        # UI Components
│   │   │   ├── domain/              # Business Logic (Menu, Orders)
│   │   │   └── data/                # API Calls, Cache
│   │   │
│   │   ├── 📂 chatbot/              # 🤖 Asistente Experto RAG
│   │   │   ├── presentation/        # ExpertAssistant Component
│   │   │   ├── domain/              # Conversation Logic, RAG
│   │   │   └── data/                # Gemini API Integration
│   │   │
│   │   └── 📂 lead-scoring/         # 🌡️ Análisis de Temperatura del Lead
│   │       ├── presentation/        # Lead Dashboard
│   │       ├── domain/              # Scoring Algorithm
│   │       └── data/                # n8n Integration, Google Sheets
│   │
│   ├── 📂 shared/                    # 🔄 SHARED SCOPE - Utilidades Comunes
│   │   ├── components/              # DashboardPreview, etc.
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # env.config.ts (Security)
│   │   ├── types/                   # TypeScript types compartidos
│   │   └── constants/               # Constantes globales
│   │
│   ├── App.tsx                      # Root Component
│   └── main.tsx                     # Entry Point
│
├── 📂 tests/                         # 🧪 Testing - TDD
│   ├── unit/                        # Unit Tests
│   ├── integration/                 # Integration Tests
│   ├── e2e/                         # End-to-End Tests
│   ├── setup.ts                     # Jest Configuration
│   └── README.md                    # TDD Guide
│
├── 📂 docs/                          # 📚 Documentación Técnica
│   ├── adr/                         # Architecture Decision Records
│   ├── audit/                       # Audit Logs
│   └── context/                     # Context for AI Agents
│
├── 📂 public/                        # Static Assets
│   └── assets/                      # Images, Icons, etc.
│
├── 📄 index.html                    # HTML Template
├── 📄 vite.config.ts                # Vite Configuration
├── 📄 tsconfig.json                 # TypeScript Configuration
├── 📄 jest.config.ts                # Jest Configuration
├── 📄 package.json                  # Dependencies & Scripts
├── 📄 .env.example                  # Environment Variables Template
├── 📄 .gitignore                    # Git Ignore Rules
├── 📄 AGENTS.md                     # AI Context & Rules
└── 📄 README.md                     # Project Documentation
```

## 🎯 Flujo de Dependencias (Scope Rule)

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION LAYER (UI)                        │
│  - Components, Pages, Hooks                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  DOMAIN LAYER (Business Logic)                  │
│  - Use Cases, Entities, Repository Interfaces   │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  DATA LAYER (Infrastructure)                    │
│  - API Calls, Local Storage, External Services  │
└─────────────────────────────────────────────────┘
```

**⚠️ REGLA:** La dependencia SIEMPRE fluye hacia adentro. Domain NO conoce Presentation. Data implementa interfaces de Domain.

## 📚 Import Paths Examples

```typescript
// ✅ Shared Scope (Global)
import { ENV } from '@shared/config/env.config';
import { DashboardPreview } from '@shared/components';
import { formatCurrency } from '@shared/utils';

// ✅ Local Scope (Feature)
import { Hero } from '@features/landing/presentation/components';
import { QRIBARSection } from '@features/qribar/presentation';
import { ExpertAssistant } from '@features/chatbot/presentation';

// ✅ Core (Business Logic Global)
import { User } from '@core/domain/entities';
import { UserRepository } from '@core/data/repositories';
```
