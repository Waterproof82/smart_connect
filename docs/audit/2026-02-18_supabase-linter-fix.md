# 2026-02-18: Supabase Database Linter Fixes

## Date
2026-02-18

## Task
Fix Supabase database linter warnings and deploy chat-with-rag function

## Changes Made

### 1. Database Functions Search Path Fix
- Created migration `20260219000000_fix_all_functions_search_path.sql`
- Created migration `20260219100000_fix_function_types.sql`
- Created migration `20260219110000_force_fix_functions.sql`
- Created migration `20260219120000_final_function_fix.sql`
- Fixed all RAG functions (`match_documents`, `match_documents_by_source`, `insert_document_with_embedding`, `batch_insert_document`) to include `SET search_path = public` in function definitions
- Fixed return types to match `documents` table schema (UUID, TEXT, VARCHAR(255), float)

### 2. Edge Function Configuration Fix
- Fixed `config.toml` entrypoint for `chat-with-rag` function (was pointing to `gemini-generate/index.ts`)
- Set `verify_jwt = false` to allow anonymous access for chatbot RAG

### 3. AGENTS.md Update
- Added Section 4.4: Protocolo de Supabase Database Lint
- Documented known warnings and manual configuration requirements

### 4. Linter Status
All schema errors resolved. Remaining warnings are intentional:
- `extension_in_public`: vector extension must be in public schema
- `auth_allow_anonymous_sign_ins`: Required for chatbot RAG and landing page
- `auth_leaked_password_protection`: Requires Supabase Pro Plan

## Verification
- Ran `supabase db lint --linked` - No schema errors found
- Deployed and tested `chat-with-rag` function - Working correctly
