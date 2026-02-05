# ADR-005: Admin Panel para Gestión de Sistema RAG

**Fecha:** 2026-02-04  
**Estado:** Accepted  
**Contexto:** Necesidad de administración del sistema RAG  
**Decisiones:** Clean Architecture + OWASP Security

---

## Contexto y Problema

El sistema RAG contiene documentos en Supabase que alimentan el chatbot experto. Se requiere un panel de administración para:

1. **Visualizar** todos los documentos del sistema
2. **Gestionar** el contenido (eliminar, actualizar)
3. **Monitorear** estadísticas (por fuente, categoría, embeddings)
4. **Controlar acceso** con autenticación y autorización

### Requisitos de Seguridad (OWASP Top 10)

- **A01: Broken Access Control** - Prevenir acceso no autorizado
- **A02: Cryptographic Failures** - Proteger credenciales
- **A03: Injection** - Sanitizar inputs
- **A04: Insecure Design** - Separar roles (admin/super_admin)

---

## Decisión

### Arquitectura: Clean Architecture (3 Capas)

```
┌────────────────────────────────────────────────┐
│           PRESENTATION LAYER                    │
│  • AdminPanel (Entry Point)                    │
│  • Login (Auth Component)                      │
│  • AdminDashboard (Main View)                  │
│  • DocumentList (CRUD UI)                      │
│  • StatsDashboard (Metrics)                    │
│  • AdminContainer (DI)                         │
└────────────────┬───────────────────────────────┘
                 │ depends on
                 ▼
┌────────────────────────────────────────────────┐
│            DOMAIN LAYER                         │
│  Entities:                                     │
│  • AdminUser (role-based permissions)          │
│  • Document (RAG doc with validations)         │
│                                                 │
│  Use Cases:                                    │
│  • GetAllDocumentsUseCase                      │
│  • GetDocumentStatsUseCase                     │
│  • DeleteDocumentUseCase (con auth)            │
│  • UpdateDocumentUseCase (con re-embedding)    │
│  • CreateDocumentUseCase (auto-embedding)      │
│  • LoginAdminUseCase                           │
│                                                 │
│  Repositories (Interfaces):                    │
│  • IDocumentRepository                         │
│  • IAuthRepository                             │
└────────────────┬───────────────────────────────┘
                 │ implemented by
                 ▼
┌────────────────────────────────────────────────┐
│             DATA LAYER                          │
│  • SupabaseDocumentRepository                  │
│  • SupabaseAuthRepository                      │
└────────────────────────────────────────────────┘
```

### Sistema de Roles y Permisos

```typescript
enum Role {
  admin = 'admin',          // Solo lectura
  super_admin = 'super_admin' // Lectura + Escritura + Eliminación
}

// Implementado en AdminUser.canPerform()
```

### Flujo de Autenticación

```
1. Usuario accede a /admin
   ↓
2. AdminPanel verifica sesión actual
   ↓
3. Si NO autenticado → Mostrar Login
   ↓
4. Login → Supabase Auth (email/password)
   ↓
5. Verificar user_metadata.role === 'admin' | 'super_admin'
   ↓
6. Si válido → AdminDashboard
   ↓
7. Si inválido → Cerrar sesión + Error
```

### Protección OWASP A01: Broken Access Control

#### ❌ Código INSEGURO (NO hacer):

```typescript
// MAL: Confiar en el cliente
if (req.body.isAdmin) {
  deleteDocument(id); // ❌ VULNERABLE
}

// MAL: No validar permisos
async function deleteDoc(id: string) {
  await db.delete(id); // ❌ Cualquiera puede eliminar
}
```

#### ✅ Código SEGURO (Implementado):

```typescript
// BIEN: Validar en servidor con entidad de dominio
async function deleteDoc(id: string, user: AdminUser) {
  if (!user.canPerform('delete')) {
    throw new Error('Insufficient permissions'); // ✅ SEGURO
  }
  
  // Verificar que el documento existe
  const doc = await repo.getById(id);
  if (!doc) throw new Error('Not found');
  
  await repo.delete(id);
}
```

---

## Consecuencias

### ✅ Positivas

1. **Separación de Responsabilidades**
   - Domain: Lógica de negocio pura
   - Data: Implementación técnica
   - Presentation: UI desacoplada

2. **Testeable al 100%**
   - Entities testeados con validaciones
   - Use Cases mockeados
   - Repositorios con interfaces

3. **Seguridad OWASP Compliant**
   - Autorización en capa de dominio
   - Validaciones input en Use Cases
   - No confianza en cliente

4. **Escalabilidad**
   - Fácil agregar roles (ej: `editor`, `viewer`)
   - Fácil agregar features (crear, editar docs)

### ⚠️ Desafíos

1. **Configuración Inicial de Usuarios Admin**
   - Solución: Crear usuarios admin manualmente en Supabase con:
     ```sql
     UPDATE auth.users 
     SET raw_user_meta_data = '{"role": "super_admin"}'
     WHERE email = 'admin@smartconnect.ai';
     ```

2. **Migración de Supabase RLS**
   - Solución: Políticas RLS deben permitir lectura autenticada:
     ```sql
     CREATE POLICY "Allow authenticated read" 
     ON documents FOR SELECT 
     TO authenticated USING (true);
     ```

---

## Decisiones Técnicas Clave

### 1. React Router para Routing

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/admin" element={<AdminPanel />} />
  </Routes>
</BrowserRouter>
```

**Por qué:** Separación clara entre landing pública y admin privado.

### 2. Dependency Injection con AdminContainer

```typescript
export function getAdminContainer(): AdminContainer {
  if (!containerInstance) {
    containerInstance = new AdminContainer(
      VITE_SUPABASE_URL, 
      VITE_SUPABASE_ANON_KEY
    );
  }
  return containerInstance;
}
```

**Por qué:** Singleton para evitar múltiples instancias de repositorios.

### 3. Paginación en GetAllDocumentsUseCase

```typescript
interface PaginationOptions {
  page: number;
  pageSize: number; // Max 100 (OWASP A04: Prevenir DoS)
}
```

**Por qué:** Evitar cargar todos los documentos en memoria (potencial DoS).

---

## Testing

### Cobertura de Tests

- ✅ **AdminUser Entity:** 8 tests (validaciones, permisos)
- ✅ **Document Entity:** 11 tests (validaciones, embedding)
- ✅ **GetAllDocumentsUseCase:** 5 tests (filtros, paginación)
- ✅ **DeleteDocumentUseCase:** 4 tests (seguridad OWASP A01)
- ✅ **UpdateDocumentUseCase:** 8 tests (edición inline, re-embedding)
- ✅ **CreateDocumentUseCase:** 10 tests (auto-embedding, validaciones)

### Tests de Seguridad Críticos

```typescript
it('should PREVENT regular admin from deleting documents', async () => {
  const regularAdmin = AdminUser.create({
    role: 'admin', // ❌ No tiene permisos de delete
  });

  await expect(
    deleteUseCase.execute('doc-1', regularAdmin)
  ).rejects.toThrow('Insufficient permissions');
});
```

---

## Decisiones Técnicas Adicionales

### 4. CreateDocumentUseCase con Auto-Embedding

**Problema:** Los documentos creados manualmente no tenían embeddings, rompiendo el flujo RAG.

**Solución:** CreateDocumentUseCase genera embedding **ANTES** de persistir:

```typescript
// ✅ CORRECTO: Atomicidad garantizada
const embedding = await repository.generateEmbedding(content);
if (!embedding) throw new Error('Embedding generation failed');
const doc = Document.create({ content, embedding });
await repository.create(doc);
```

**Beneficios:**
- **Consistencia:** Todos los documentos tienen embedding desde creación
- **Validación:** Content + Source validados antes de llamar Gemini API
- **Seguridad OWASP A01:** Solo `super_admin` puede crear documentos
- **Atomicidad:** Si falla el embedding, no se crea el documento

---

## Roadmap Futuro

### ~~Fase 2~~ → **COMPLETADO (2026-02-04)**

- [x] **Editar documentos inline** ✅ UpdateDocumentUseCase
- [x] **Re-generar embeddings** tras edición ✅ Auto-regeneración
- [x] **Crear nuevos documentos** ✅ CreateDocumentUseCase
- [ ] **Audit log** de cambios (quién, cuándo, qué)
- [ ] **Búsqueda avanzada** con filtros múltiples
- [ ] **Exportar/Importar** documentos (JSON/CSV)

---

## Referencias

- **Clean Architecture:** Uncle Bob - Hexagonal Architecture
- **OWASP Top 10 2021:** https://owasp.org/Top10/
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **React Router v6:** https://reactrouter.com/

---

## Autores

- **Implementación:** GitHub Copilot Agent
- **Review:** SmartConnect AI Team
- **Fecha:** 2026-02-04
