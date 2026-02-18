# Dynamic Settings System Implementation

**Date:** 2026-02-18
**Author:** AI Agent
**Status:** Completed

## Summary

Implemented a dynamic settings management system that moves configuration values from environment variables to Supabase database, allowing admins to update contact information and webhook URLs without deploying code changes.

## Changes

### 1. Database Schema

Created `app_settings` table with dynamic configuration fields:

```sql
-- supabase/migrations/20260218000000_create_app_settings.sql
CREATE TABLE public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    n8n_webhook_url TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    whatsapp_phone TEXT DEFAULT '',
    physical_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Fields:**
- `n8n_webhook_url`: URL for n8n webhook to receive leads
- `contact_email`: Contact email shown on landing page
- `whatsapp_phone`: WhatsApp phone number shown on landing
- `physical_address`: Physical address shown on landing page

### 2. Row Level Security (RLS)

Implemented secure access policies:

| Role | Access |
|------|--------|
| Admin (authenticated with admin/super_admin role) | Full CRUD |
| Service role | Full access |
| Anonymous (landing page) | Read-only |

### 3. Clean Architecture Implementation

**Domain Layer:**
- `Settings.ts` - Entity with validation
- `ISettingsRepository.ts` - Repository interface
- `GetSettingsUseCase.ts` - Use case for reading settings
- `UpdateSettingsUseCase.ts` - Use case for updating settings

**Data Layer:**
- `SupabaseSettingsRepository.ts` - Repository implementation

**Presentation Layer:**
- `SettingsPanel.tsx` - Admin UI component for managing settings
- Updated `AdminDashboard.tsx` to include SettingsPanel
- Updated `AdminContainer.ts` with dependency injection

### 4. Landing Page Integration

Updated `Contact.tsx` to fetch settings from Supabase:
- Contact email displayed dynamically
- WhatsApp phone number displayed dynamically
- Physical address displayed dynamically
- Webhook URL used for form submission

### 5. Chatbot WhatsApp Button

Updated `ExpertAssistantWithRAG.tsx`:
- WhatsApp button now uses phone number from database
- Falls back to disabled state if no number configured

### 6. Environment Variables Cleanup

Removed deprecated ENV variables:
- `VITE_CONTACT_EMAIL` (replaced by BBDD)
- `VITE_N8N_WEBHOOK_URL` (replaced by BBDD)
- `VITE_GOOGLE_SHEETS_ID` (not needed in app, configured in n8n)
- `VITE_N8N_NOTIFICATION_EMAIL` (not needed in app, configured in n8n)

**Kept:**
- `VITE_SUPABASE_URL` (required for database connection)
- `VITE_SUPABASE_ANON_KEY` (required for database connection)
- `GEMINI_API_KEY` (required for AI features)

### 7. Removed Unused Database Columns

Created migration to drop unused columns:
```sql
-- supabase/migrations/20260218100000_drop_unused_settings_columns.sql
ALTER TABLE public.app_settings 
DROP COLUMN IF EXISTS n8n_notification_email,
DROP COLUMN IF EXISTS google_sheets_id;
```

## Files Created/Modified

### Created
- `supabase/migrations/20260218000000_create_app_settings.sql`
- `supabase/migrations/20260218100000_drop_unused_settings_columns.sql`
- `src/features/admin/domain/entities/Settings.ts`
- `src/features/admin/domain/repositories/ISettingsRepository.ts`
- `src/features/admin/domain/usecases/GetSettingsUseCase.ts`
- `src/features/admin/domain/usecases/UpdateSettingsUseCase.ts`
- `src/features/admin/data/repositories/SupabaseSettingsRepository.ts`
- `src/features/admin/presentation/components/SettingsPanel.tsx`
- `src/shared/services/settingsService.ts`
- `docs/audit/2026-02-18_dynamic_settings_system.md`

### Modified
- `.env.local` - Removed deprecated variables
- `.env.example` - Updated documentation
- `src/shared/config/env.config.ts` - Removed deprecated ENV vars
- `src/vite-env.d.ts` - Removed deprecated type definitions
- `src/features/admin/presentation/AdminContainer.ts` - Added DI for settings
- `src/features/admin/presentation/index.tsx` - Added settings props
- `src/features/admin/presentation/components/AdminDashboard.tsx` - Added SettingsPanel
- `src/features/landing/presentation/components/Contact.tsx` - Dynamic settings
- `src/features/chatbot/presentation/ExpertAssistantWithRAG.tsx` - Dynamic WhatsApp
- `tests/setup.ts` - Removed mock ENV vars

## Benefits

1. **No redeploy needed**: Admins can update settings from the admin panel
2. **Centralized**: All contact info in one place
3. **Dynamic**: Landing page reflects changes immediately
4. **Security**: RLS ensures proper access control
5. **Maintainability**: Cleaner codebase without unused ENV vars

## Testing

- TypeScript compilation: ✅ Pass
- ESLint: ✅ Pass (1 warning)
- All settings properly saved to Supabase

## Notes

- WhatsApp number must include country code (e.g., +5491112345678)
- n8n webhook URL must be a valid HTTPS URL
- Email validation enforced on admin panel
- If no webhook URL is configured, form submission returns success (dev mode)
