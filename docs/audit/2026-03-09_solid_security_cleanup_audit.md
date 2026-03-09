# Audit Log: SOLID, Security & Dead Code Cleanup

**Date:** 2026-03-09
**Scope:** Full codebase audit for SOLID, Clean Architecture, OWASP, and dead code

## Actions Performed

### Dead Code Removal (13 files + 4 tests)
- Removed old RAG architecture from chatbot feature (replaced by Edge Function approach):
  - `EmbeddingRepositoryImpl.ts`, `DocumentRepositoryImpl.ts` (data/repositories)
  - `GeminiDataSource.ts`, `SupabaseDataSource.ts` (data/datasources)
  - `rag-indexer.ts`, `embedding-cache.ts` (data layer)
  - `rag-orchestrator.ts`, `fallback-handler.ts` (domain layer)
  - `SearchDocumentsUseCase.ts` (domain/usecases)
  - `IEmbeddingRepository.ts`, `IDocumentRepository.ts` (domain/repositories)
  - `IRAGIndexer.ts`, `IEmbeddingCache.ts` (domain/interfaces)
  - `rag-logger.ts` (shared)
- Removed `test-log` Edge Function (unused test stub)
- Removed `ab_test_dashboard.sql` (orphaned, referenced non-existent tables)
- Removed 4 test files for deleted code
- Cleaned barrel exports in 6 index.ts files

### SOLID Fixes
- **OCP:** Removed hardcoded Supabase credentials fallback from `SupabaseDocumentRepository.generateEmbedding()`
- **SRP:** Removed unused `_supabaseUrl`/`_supabaseKey` params from `AdminContainer` constructor
- **DIP:** Removed `GEMINI_API_KEY` from frontend `ENV` config (secret should only exist in Edge Functions)

### Security Fixes (OWASP)
- **A02 (Cryptographic Failures):** Removed hardcoded credentials from source code
- **A04 (Insecure Design):** Changed rate limiter from shared 'anonymous' to per-session identifier
- **A05 (Security Misconfiguration):** Added security headers to all 3 Edge Functions

### RAG Improvements
- Lowered similarity threshold from 0.7 to 0.4 (was filtering relevant documents)
- Fixed `match_documents_by_source` to use ILIKE for comma-separated source matching
- Deployed migration and all 3 Edge Functions

## Verification
- Unit tests: 83/85 passing (2 pre-existing failures in integration test)
- Vite build: Successful
- TypeScript: Clean
- Edge Functions: All 3 deployed successfully
