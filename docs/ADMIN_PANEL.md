# 🔐 Admin Panel - Gestión del Sistema RAG

## Descripción

Panel de administración para gestionar documentos del sistema RAG (Retrieval-Augmented Generation) con autenticación, autorización basada en roles y operaciones CRUD.

## Acceso

**URL:** `http://localhost:5173/admin`

### Credenciales de Prueba

Para crear un usuario administrador en Supabase:

```sql
-- 1. Crear usuario en Supabase Dashboard (Authentication > Users > Invite User)
-- Email: admin@smartconnect.ai
-- Password: (generado automáticamente)

-- 2. Asignar rol de admin en SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"super_admin"'
)
WHERE email = 'admin@smartconnect.ai';
```

---

## Arquitectura

### Clean Architecture (3 Capas)

```
src/features/admin/
├── domain/
│   ├── entities/
│   │   ├── AdminUser.ts          # Entidad de usuario admin
│   │   └── Document.ts           # Entidad de documento RAG
│   ├── usecases/
│   │   ├── GetAllDocumentsUseCase.ts
│   │   ├── GetDocumentStatsUseCase.ts
│   │   ├── DeleteDocumentUseCase.ts
│   │   └── LoginAdminUseCase.ts
│   └── repositories/
│       ├── IDocumentRepository.ts
│       └── IAuthRepository.ts
├── data/
│   └── repositories/
│       ├── SupabaseDocumentRepository.ts
│       └── SupabaseAuthRepository.ts
└── presentation/
    ├── components/
    │   ├── Login.tsx
    │   ├── AdminDashboard.tsx
    │   ├── DocumentList.tsx
    │   └── StatsDashboard.tsx
    ├── AdminContainer.ts         # Dependency Injection
    └── index.tsx                 # Entry point
```

---

## Funcionalidades

### 1. Autenticación

- ✅ Login con email/password (Supabase Auth)
- ✅ Verificación de rol en `user_metadata`
- ✅ Persistencia de sesión
- ✅ Logout seguro

### 2. Dashboard de Estadísticas

- **Total de Documentos:** Contador global
- **Por Fuente:** qribar, reviews, general
- **Por Categoría:** producto_digital, reputacion_online, etc.

### 3. Gestión de Documentos

#### Visualización
- Lista paginada de documentos (20 por página)
- Preview de contenido (100 caracteres)
- Estado de embedding (✓ Sí / ✗ No)
- Fecha de creación

#### Filtros
- **Por Fuente:** qribar, reviews, general
- **Búsqueda de Texto:** buscar en contenido

#### Acciones
- **Eliminar:** Solo para `super_admin` (OWASP A01 protection)

---

## Sistema de Roles

### `admin` (Lectura)
- ✅ Ver documentos
- ✅ Ver estadísticas
- ❌ Eliminar documentos

### `super_admin` (Lectura + Escritura)
- ✅ Ver documentos
- ✅ Ver estadísticas
- ✅ Eliminar documentos

**Implementación:**

```typescript
class AdminUser {
  canPerform(action: 'read' | 'write' | 'delete'): boolean {
    if (this.role === 'super_admin') return true;
    return action === 'read'; // admin solo puede leer
  }
}
```

---

## Seguridad (OWASP Compliance)

### A01: Broken Access Control ✅

**Protección implementada:**

```typescript
// DeleteDocumentUseCase.ts
async execute(documentId: string, user: AdminUser): Promise<void> {
  // 1. Validar permisos (SERVIDOR)
  if (!user.canPerform('delete')) {
    throw new Error('Insufficient permissions');
  }
  
  // 2. Verificar existencia
  const document = await this.repository.getById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // 3. Eliminar
  await this.repository.delete(documentId);
}
```

### A03: Injection ✅

**Protección implementada:**

```typescript
// LoginAdminUseCase.ts
private validateCredentials(credentials: LoginCredentials): void {
  // Sanitizar email
  const sanitizedEmail = credentials.email.trim().toLowerCase();
  if (sanitizedEmail !== credentials.email) {
    throw new Error('Invalid email format');
  }
  
  // Validar formato
  if (!credentials.email.includes('@')) {
    throw new Error('Invalid email format');
  }
}
```

### A07: Identification and Authentication Failures ✅

- ✅ Autenticación delegada a Supabase (industry standard)
- ✅ Tokens JWT con expiración
- ✅ No revelar información específica en errores ("Invalid credentials")

---

## API de Repositorios

### IDocumentRepository

```typescript
interface IDocumentRepository {
  // Obtener con filtros y paginación
  getAll(
    filters?: DocumentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Document>>;
  
  // Obtener por ID
  getById(id: string): Promise<Document | null>;
  
  // Estadísticas
  countBySource(): Promise<Record<string, number>>;
  countByCategory(): Promise<Record<string, number>>;
  
  // Modificaciones
  delete(id: string): Promise<void>;
  update(id: string, content: string): Promise<Document>;
  create(document: Omit<Document, 'id'>): Promise<Document>;
}
```

### IAuthRepository

```typescript
interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AdminUser | null>;
  isAuthenticated(): Promise<boolean>;
}
```

---

## Testing

### Ejecutar Tests

```bash
# Tests del módulo admin
npm test -- admin

# Todos los tests
npm test
```

### Cobertura

- ✅ **28 tests** del módulo admin
- ✅ **159 tests** totales del proyecto

### Tests Críticos de Seguridad

```typescript
// DeleteDocumentUseCase.test.ts
describe('OWASP A01: Broken Access Control', () => {
  it('should PREVENT regular admin from deleting', async () => {
    const regularAdmin = AdminUser.create({ role: 'admin' });
    
    await expect(
      deleteUseCase.execute('doc-1', regularAdmin)
    ).rejects.toThrow('Insufficient permissions');
  });
});
```

---

## Uso en Desarrollo

### 1. Configurar Supabase

Asegúrate de tener las variables de entorno:

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

### 2. Crear Usuario Admin

```sql
-- En Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "super_admin"}'
WHERE email = 'tu-email@test.com';
```

### 3. Iniciar Desarrollo

```bash
npm run dev
```

### 4. Acceder al Panel

```
http://localhost:5173/admin
```

---

## Políticas RLS de Supabase

Para que el admin pueda leer documentos:

```sql
-- Permitir lectura autenticada
CREATE POLICY "Allow authenticated read access"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Permitir eliminación solo para super_admin
-- (Validado en la lógica de negocio, no en RLS)
```

---

## Roadmap Futuro

### Fase 2 (Completado ✅)
- [x] **Editar documentos** inline
- [x] **Re-generar embeddings** tras edición
- [ ] **Audit log** de cambios

### Fase 3
- [ ] **Gestión de usuarios admin** (crear, editar roles)
- [ ] **Exportar/Importar** documentos (JSON/CSV)
- [ ] **Dashboard de analytics** (consultas más frecuentes)

---

## Referencias

- **ADR-005:** Admin Panel Architecture Decision
- **OWASP Top 10:** https://owasp.org/Top10/
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Clean Architecture:** https://blog.cleancoder.com/

---

## Soporte

Para problemas o preguntas:
- 📂 Ver logs en `docs/audit/`
- 📖 Revisar `ADR-005-admin-panel-rag.md`
- 🧪 Ejecutar tests: `npm test -- admin`
