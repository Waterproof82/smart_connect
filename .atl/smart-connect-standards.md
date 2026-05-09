# 🏗️ SmartConnect Standards: Arquitectura y Diseño

## Arquitectura
- **Clean Architecture**: Separación clara entre capas (Presentación, Dominio, Datos).
- **Dependency Injection**: Uso de contenedores para inyección de dependencias.
- **Separación de Concerns**: Cada componente tiene una responsabilidad única.

## Componentes Clave
| Componente       | Tecnología               | Función                                                                 |
|------------------|--------------------------|-------------------------------------------------------------------------|
| Landing          | React + Vite + TypeScript | Captación SEO y conversión de leads.                                      |
| QRIBAR           | React + Vite             | Menú digital con pedidos en mesa.                                        |
| Chatbot RAG      | React + Gemini API       | Asistente IA con respuestas contextuales basadas en RAG.                |
| n8n              | Workflows                | Automatización de leads y notificaciones.                                 |
| Supabase         | PostgreSQL + pgvector     | Backend, autenticación y gestión de datos.                               |
| Edge Functions   | Deno                     | Procesamiento de embeddings y respuestas de Gemini.                      |

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