# Integration Tests README

## Security Tests (RLS Policies)

The file `documents-rls.test.ts` contains integration tests for Row Level Security policies on the `documents` table.

### ⚠️ Manual Setup Required

These tests require the **Supabase Service Role Key** which is not stored in version control for security reasons.

### Setup Instructions:

1. **Get the Service Role Key:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to: **Settings > API**
   - Copy the `service_role` key (secret)

2. **Set the Environment Variable:**
   
   Create a `.env.test` file in the project root:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-key-here
   ```

   Or add it to your existing `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-key-here
   ```

3. **Run the Tests:**
   ```bash
   npm test tests/integration/admin/documents-rls.test.ts
   ```

### Test Coverage:

- ✅ **Anon Access (Chatbot):** 4 tests
  - Allow SELECT
  - Deny INSERT/UPDATE/DELETE

- ✅ **Non-Admin User:** 2 tests
  - Deny all operations

- ✅ **Admin User:** 4 tests
  - Allow full CRUD access

- ✅ **Service Role:** 1 test
  - Bypass RLS for Edge Functions

**Total:** 11 tests

### Security Note:

🔒 **NEVER commit the Service Role Key to git!**

The `.env.test` and `.env.local` files are gitignored by default. If you accidentally commit a key, revoke it immediately in the Supabase Dashboard and generate a new one.

---

## Running All Tests

To run all tests including unit and integration:

```bash
npm test
```

To skip integration tests (when SERVICE_ROLE_KEY is not set):

```bash
npm test -- --testPathIgnorePatterns=integration
```
