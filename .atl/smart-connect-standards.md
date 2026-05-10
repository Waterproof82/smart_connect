# 🏗️ SmartConnect Standards: Arquitectura y Diseño

## Arquitectura
- **Clean Architecture**: Separación clara entre capas (Presentación, Dominio, Datos).
- **Dependency Injection**: Uso de contenedores para inyección de dependencias.
- **Separación de Concerns**: Cada componente tiene una responsabilidad única.

## Componentes Clave
| Componente       | Tecnología               | Función                                                                 |
|------------------|--------------------------|-------------------------------------------------------------------------|
| Landing          | React 19 + Vite 8 + TypeScript 5.9 | Captación SEO y conversión de leads.                                      |
| QRIBAR           | React 19 + Vite 8         | Menú digital con pedidos en mesa.                                        |
| Chatbot RAG      | React 19 + Gemini API 1.44   | Asistente IA con respuestas contextuales basadas en RAG.                |
| n8n              | Workflows                | Automatización de leads y notificaciones.                                 |
| Supabase         | PostgreSQL + pgvector     | Backend, autenticación y gestión de datos.                               |
| Edge Functions   | Deno                     | Procesamiento de embeddings y respuestas de Gemini.                      |

## Stack Tecnológico Actual (2026)
- **Frontend**: React 19.2.4, React Router DOM 7.13.1, TypeScript 5.9.3
- **Bundler**: Vite 8.0.11
- **Styling**: Tailwind CSS 3.4.17, Lucide React 0.577.0
- **Backend**: Supabase 2.99.0 (PostgreSQL + pgvector)
- **AI**: Gemini API 1.44.0 (@google/genai)
- **Forms**: React Hook Form 7.71.2, Zod 3.25.0
- **Charts**: Recharts 3.8.0
- **Testing**: Jest 30.2.0, @testing-library/react 16.3.2
- **Linting**: ESLint 9.39.4, @typescript-eslint 8.56.1                      |

## Flujo de Datos
- **Landing → QRIBAR/Chatbot → n8n → Supabase**: Flujo de datos desde la captación hasta el backend.
- **Cacheo de Respuestas**: Cacheo de embeddings y respuestas del chatbot con TTL de 7 días.

---

# 🧪 SmartConnect Standards: Testing

## Pirámide de Testing
- **Unit Tests**: 60-70% (Jest, @testing-library/react).
- **Integration Tests**: 20-30% (Pruebas de componentes y casos de uso).
- **E2E Tests**: 5-10% (Playwright o Cypress).

## Principios
- **Selectores Semánticos**: Usar `getByRole`, `getByLabelText`, `getByText`.
- **Patrón AAA**: Arrange, Act, Assert.
- **Mocks**: Usar `jest.mock` o `vi.fn` para mocks de APIs y servicios.
- **Coverage Objetivo**: 80% en líneas, ramas y sentencias.

## Ejemplo de Estructura de Tests
```
src/
├── features/
│   ├── qribar/
│   │   ├── __tests__/
│   │   │   ├── QRIBARSection.test.tsx
│   │   │   ├── MenuPhone.test.tsx
│   │   │   └── useQRIBAR.test.ts
│   └── chatbot/
│       ├── __tests__/
│       │   ├── ChatbotContainer.test.tsx
│       │   └── GenerateResponseUseCase.test.ts
```

---

# 🔒 SmartConnect Standards: Seguridad

## Principios OWASP
- **Broken Access Control**: Validación estricta de roles y permisos en todos los endpoints.
- **Insecure Direct Object References (IDOR)**: Evitar accesos directos a objetos de base de datos sin validación.
- **Cross-Site Scripting (XSS)**: Sanitización de inputs y uso de CSP (Content Security Policy).

## Autenticación y Autorización
- **JWT + Row-Level Security (RLS)**: Uso de Supabase Auth y RLS para proteger datos.
- **Edge Functions**: Validación de tokens en funciones de edge para evitar bypasses.

## Ejemplo de Validación de Roles
```javascript
// Middleware de autenticación y autorización
const validateRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
```

---

# 🤖 SmartConnect Standards: Chatbot RAG

## Flujo de Respuesta
1. **Generación de Embeddings**: Usar `gemini-embedding-001` para convertir consultas en vectores.
2. **Búsqueda Vectorial**: Usar `pgvector` en Supabase para buscar documentos similares.
3. **Contexto y Respuesta**: Usar `gemini-2.5-flash` para generar respuestas contextuales.
4. **Cacheo**: Cachear respuestas con TTL de 7 días para mejorar rendimiento.

## Edge Functions
| Función               | Propósito                                      | Modelo Gemini                     |
|-----------------------|------------------------------------------------|----------------------------------|
| `gemini-embedding`   | Generar embeddings para búsqueda y administración | `gemini-embedding-001`          |
| `gemini-generate`    | Generar respuestas simples                    | `gemini-2.5-flash`               |
| `chat-with-rag`      | Pipeline RAG completo                          | `gemini-2.5-flash`               |

## Ejemplo de Prompt para RAG
```json
{
  "system_prompt": "Eres un asistente de SmartConnect. Contexto: {documents}. Responde en español.",
  "user_query": "¿Cómo funciona QRIBAR?",
  "context": [
    { "source": "qribar-docs", "content": "QRIBAR es un menú digital que permite a los clientes pedir desde sus mesas." }
  ]
}
```

---

# 🌐 SmartConnect Standards: Best Practices

## Environment Compatibility

### Prefer `globalThis` over `window`

**Why?**
- `globalThis` es el estándar moderno y multiplataforma para acceder a objetos globales.
- Funciona en todos los entornos (browser, Node.js, Deno, etc.) y es más robusto.
- `window` es específico del navegador y puede causar problemas en entornos no-navegador.

**When to use:**
- Cualquier lugar donde usarías `window` en código para navegador.
- Al acceder a APIs del navegador como `location`, `addEventListener`, `removeEventListener`, etc.

**Examples:**

```typescript
// Before (use window)
window.addEventListener('hashchange', handleHashChange);
const hash = window.location.hash;

// After (use globalThis)
globalThis.addEventListener('hashchange', handleHashChange);
const hash = globalThis.location.hash;
```

**Exceptions:**
- Si estás trabajando en un contexto solo-navegador y estás seguro de que nunca se ejecutará en un entorno no-navegador, puedes usar `window` por legibilidad.
- Si necesitas acceder a APIs específicas del navegador que no están disponibles a través de `globalThis`.

## TypeScript Best Practices

### Type Safety
- Siempre usa interfaces y tipos de TypeScript para objetos complejos.
- Prefiere `as const` para tipos literales cuando sea posible.
- Usa `unknown` en lugar de `any` para seguridad de tipos.

**Example:**
```typescript
// Prefer unknown over any
const data: unknown = fetchData();
if (typeof data === 'string') {
  const parsedData = data as string;
}
```

## Security Best Practices

### Sanitize User Inputs
- Prevén ataques XSS sanitizando inputs de usuarios antes de renderizarlos.
- Usa librerías como `DOMPurify` para sanitizar contenido HTML.

**Example:**
```typescript
import DOMPurify from 'dompurify';
const cleanHtml = DOMPurify.sanitize(userInput);
```

---

## 📌 Skill: SmartConnect Standards

### 📚 Purpose

This skill provides AI agents with comprehensive guidelines for SmartConnect project development, including:
- Architecture and design principles
- Testing and quality standards
- Security best practices
- RAG chatbot implementation
- Environment compatibility and best practices

### 🌐 Environment Compatibility

**Prefer `globalThis` over `window`**

**Why?**
- `globalThis` is the modern, cross-environment standard for accessing global objects.
- Works in all environments (browser, Node.js, Deno, etc.) and is more future-proof.
- `window` is browser-specific and can cause issues in non-browser environments.

**When to use:**
- Anywhere you would use `window` in browser code.
- When accessing browser APIs like `location`, `addEventListener`, `removeEventListener`.

**Examples:**
```typescript
// Before (use window)
const hash = window.location.hash;
window.addEventListener('hashchange', handleHashChange);

// After (use globalThis)
const hash = globalThis.location.hash;
globalThis.addEventListener('hashchange', handleHashChange);
```

**Exceptions:**
- If you're working in a browser-only context and are certain it will never run in a non-browser environment.
- If you need to access browser-specific APIs not available through `globalThis`.

### 📝 Usage Instructions

**When to use this skill:**
- When writing new code for SmartConnect
- When reviewing or auditing existing code
- When implementing new features or fixing bugs
- When setting up testing, security, or architecture decisions

**How to use this skill:**
- Reference this skill when using the `skill` tool
- Use the guidelines provided to ensure consistency
- Follow the best practices to maintain code quality and security

---

# 🔗 References

## Skill Registry Reference
- **Global Skills**: [Skill Registry](.atl/skill-registry.md)
  - **smart-connect-standards**: Estándares globales para arquitectura, testing, seguridad, RAG y best practices.