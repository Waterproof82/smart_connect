# 🏗️ SmartConnect Standards: Arquitectura y Diseño

## 🌐 Official Domain

- **Production URL**: `https://digitalizatenerife.es/`
- ⚠️ **DO NOT use `smartconnectai.es`** — ese dominio no es oficial.
- Todas las URLs canónicas, OG tags, hreflang, sitemap y schema LocalBusiness deben apuntar a `https://digitalizatenerife.es/`.

## Arquitectura

- **Clean Architecture**: Separación clara entre capas (Presentación, Dominio, Datos).
- **Dependency Injection**: Uso de contenedores para inyección de dependencias.
- **Separación de Concerns**: Cada componente tiene una responsabilidad única.

## Componentes Clave

| Componente     | Tecnología                         | Función                                                  |
| -------------- | ---------------------------------- | -------------------------------------------------------- |
| Landing        | React 18 + Vite 8 + TypeScript 5.9 | Captación SEO y conversión de leads.                     |
| QRIBAR         | React 18 + Vite 8                  | Menú digital con pedidos en mesa.                        |
| Chatbot RAG    | React 18 + Gemini API 1.44         | Asistente IA con respuestas contextuales basadas en RAG. |
| n8n            | Workflows                          | Automatización de leads y notificaciones.                |
| Supabase       | PostgreSQL + pgvector              | Backend, autenticación y gestión de datos.               |
| **DB Project** | `smartconnect-rag`                 | Proyecto activo de Supabase para el frontend.            |
| Edge Functions | Deno                               | Procesamiento de embeddings y respuestas de Gemini.      |

## Stack Tecnológico Actual (2026-05)

- **Frontend**: React 18.3.1, React Router DOM 6.30.3, TypeScript 5.9.3
- **Bundler**: Vite 8.0.12
- **Styling**: Tailwind CSS 4.3.0, Lucide React 0.375.0
- **Backend**: Supabase 2.105.4 (PostgreSQL + pgvector)
- **AI**: Gemini API 1.44.0 (@google/genai)
- **Forms**: React Hook Form 7.75.0, Zod 3.25.76
- **Charts**: Recharts 3.8.1
- **Testing**: Jest 29.7.0, @testing-library/react 14.3.1
- **Linting**: ESLint 8.57.1, @typescript-eslint 8.59.2

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

| Función            | Propósito                                         | Modelo Gemini          |
| ------------------ | ------------------------------------------------- | ---------------------- |
| `gemini-embedding` | Generar embeddings para búsqueda y administración | `gemini-embedding-001` |
| `gemini-generate`  | Generar respuestas simples                        | `gemini-2.5-flash`     |
| `chat-with-rag`    | Pipeline RAG completo                             | `gemini-2.5-flash`     |

## Ejemplo de Prompt para RAG

```json
{
  "system_prompt": "Eres un asistente de SmartConnect. Contexto: {documents}. Responde en español.",
  "user_query": "¿Cómo funciona QRIBAR?",
  "context": [
    {
      "source": "qribar-docs",
      "content": "QRIBAR es un menú digital que permite a los clientes pedir desde sus mesas."
    }
  ]
}
```

---

# 🏗️ SmartConnect Standards: SSR & Hydration

## Critical: Hydration Safety

SmartConnect usa SSG custom con `react-dom/server` (renderToString). El servidor prerenderiza HTML y el cliente lo hidrata. Si el árbol de componentes difiere entre servidor y cliente, React lanza error #418 y se cae toda la hidratación.

### Regla de Oro

**El árbol de componentes de `entry-server.tsx` debe ser ESTRUCTURALMENTE IDÉNTICO al de `entry-client.tsx`.**

### Checklist de Componentes SSR

| Componente                           | entry-server.tsx      | entry-client.tsx     |
| ------------------------------------ | --------------------- | -------------------- |
| `<HelmetProvider>`                   | ✅                    | ✅                   |
| `<StaticRouter>` / `<BrowserRouter>` | ✅ (StaticRouter)     | ✅ (BrowserRouter)   |
| `<LanguageProvider>`                 | ✅                    | ✅                   |
| `<ScrollToTop />`                    | ✅ OBLIGATORIO        | ✅                   |
| `<Suspense>`                         | ✅ OBLIGATORIO        | ✅                   |
| `<Routes>`                           | ✅ (3 landing routes) | ✅ (7 routes + lazy) |

### Qué NO hacer en SSR

- ❌ NO uses `window`, `document`, `localStorage`, `matchMedia` durante el render (ni en `useState` initializer, ni en render functions, ni en módulo-level code)
- ❌ NO uses `lazy()` en componentes de landing que se renderizan en SSR (Hero, Features, Contact, SuccessStats, ExpertAssistant)
- ❌ NO dejes fuera del server componentes que retornan `null` (como `ScrollToTop`) — cuentan como elementos estructurales

### Seguridad de Tema (Theme SSR)

El `useState(getInitialTheme)` se ejecuta durante la hidratación. Debe retornar el MISMO valor que en SSR para evitar error #418.

**Regla de oro**: `getInitialTheme()` debe retornar SIEMPRE el mismo valor, sin importar el entorno (SSR o cliente).

```typescript
// ❌ MAL: matchMedia da distinto entre SSR y cliente
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

// ❌ MAL: leer del <html> class también da distinto (SSR no tiene document)
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return "dark";
};

// ✅ BIEN: valor fijo para SSR y 1er render del cliente
const getInitialTheme = (): Theme => "dark";
```

**Post-hydratación**: usar un `useEffect` con deps `[]` para sincronizar el estado de React con la preferencia real del usuario:

```typescript
useEffect(() => {
  const saved = localStorage.getItem("sc_theme");
  if (saved === "light" || saved === "dark") {
    setThemeState(saved);
    applyTheme(saved);
  } else {
    // Sin preferencia guardada → sincronizar con html class (seteado por inline script)
    const systemTheme = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    if (systemTheme !== theme) {
      setThemeState(systemTheme);
    }
    applyTheme(systemTheme);
  }
}, []); // ← deps vacío: corre UNA VEZ post-hydratación
```

### Lazy Supabase Proxy

```typescript
// ✅ Proxy correcto: bracket access + bind + then guard
export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient();
    if (prop === "then") return undefined;
    const value = (client as unknown as Record<string, unknown>)[
      prop as string
    ];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});
```

### SPA Hydration Safety

Las páginas SPA (carta-digital, tap-review, admin) se sirven con `_spa.html`, que NO tiene contenido SSR real — solo contiene `<!--ssr-outlet-->`.

**No se puede usar `hydrateRoot` en páginas sin contenido SSR.** React espera encontrar elementos DOM reales, encuentra un comentario → error #418/#423.

**Detección y decisión**:

```typescript
const hasSSRContent = rootElement.children.length > 0;
// children cuenta solo Element nodes, no Comment nodes
// Prerendered: tiene hijos <div>, <nav> → hasSSRContent = true → hydrateRoot
// SPA: solo tiene <!--ssr-outlet--> → hasSSRContent = false → createRoot

if (hasSSRContent) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
```

**ThemeProvider debe envolver TODAS las rutas**, no solo las de landing. Si solo está en `App.tsx`, las SPA pages se quedan sin contexto de tema:

```typescript
// ✅ entry-client.tsx: ThemeProvider wrapping ALL routes
<ThemeProvider>
  <LanguageProvider>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/carta-digital" element={<CartaDigitalPremium />} />
      <Route path="/tap-review" element={<TapReviewPageWithData />} />
    </Routes>
  </LanguageProvider>
</ThemeProvider>

// ❌ MAL: ThemeProvider solo en App.tsx — SPA routes no lo heredan
```

## 🌐 SmartConnect Standards: Best Practices

### Environment Compatibility

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
window.addEventListener("hashchange", handleHashChange);
const hash = window.location.hash;

// After (use globalThis)
globalThis.addEventListener("hashchange", handleHashChange);
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
if (typeof data === "string") {
  const parsedData = data as string;
}
```

## Security Best Practices

### Sanitize User Inputs

- Prevén ataques XSS sanitizando inputs de usuarios antes de renderizarlos.
- Usa librerías como `DOMPurify` para sanitizar contenido HTML.

**Example:**

```typescript
import DOMPurify from "dompurify";
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
window.addEventListener("hashchange", handleHashChange);

// After (use globalThis)
const hash = globalThis.location.hash;
globalThis.addEventListener("hashchange", handleHashChange);
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
