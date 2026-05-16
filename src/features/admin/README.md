# Admin Module

Panel de administración para gestionar el sistema RAG de SmartConnect AI.

## 🎯 Propósito

Permite a los administradores:

- Ver todos los documentos del sistema RAG
- Filtrar y buscar documentos
- Ver estadísticas (por fuente, categoría)
- Eliminar documentos (solo super_admin)

## 🏗️ Arquitectura

```
admin/
├── domain/          # Lógica de negocio
│   ├── entities/    # AdminUser, Document
│   ├── usecases/    # GetAllDocuments, DeleteDocument, etc.
│   └── repositories/# Interfaces (IDocumentRepository, IAuthRepository)
├── data/            # Implementaciones
│   └── repositories/# SupabaseDocumentRepository, SupabaseAuthRepository
└── presentation/    # UI Components
    ├── components/  # Login, AdminDashboard, DocumentList
    └── AdminContainer.ts  # DI Container
```

## 🔐 Seguridad

### Roles

- **admin:** Solo lectura
- **super_admin:** Lectura + Eliminación

### OWASP Compliance

- ✅ A01: Broken Access Control (validación de permisos en servidor)
- ✅ A03: Injection (sanitización de inputs)
- ✅ A07: Auth Failures (Supabase Auth + JWT)

## 🧪 Tests

```bash
# Tests del módulo admin
npm test -- admin

# Cobertura: 28 tests (100% passing)
```

## 📚 Documentación

- **Guía de Usuario:** `docs/ADMIN_PANEL.md`
- **ADR:** `docs/adr/ADR-005-admin-panel-rag.md`
- **Audit Log:** `docs/audit/2026-02-04_admin-panel-implementation.md`

## 🚀 Uso

```typescript
// Obtener container
import { getAdminContainer } from "@features/admin/presentation";

const container = getAdminContainer();

// Usar casos de uso
const documents = await container.getAllDocumentsUseCase.execute();
```

## 📦 Dependencias

- `@supabase/supabase-js` - Cliente de Supabase
- `react-router-dom` - Routing

## 🔄 Flujo de Autenticación

```
1. Usuario accede /admin
2. AdminPanel verifica sesión
3. Si NO auth → Login
4. Login → Supabase Auth
5. Verificar email === 'info@digitalizatenerife.es' (único admin)
6. Si válido → AdminDashboard
```
