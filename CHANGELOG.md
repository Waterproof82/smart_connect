# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-01-28

### Changed
- **MAJOR REFACTOR:** Complete Clean Architecture implementation for chatbot feature
  - Separated concerns into Domain, Data, and Presentation layers
  - Implemented Repository Pattern with interface abstractions
  - Implemented Use Case Pattern for business logic encapsulation
  - Applied SOLID principles (Single Responsibility, Dependency Inversion, Interface Segregation)
  
### Added
- **Domain Layer:**
  - `MessageEntity`: Immutable message entity with validation (max 4000 chars)
  - `DocumentEntity`: Document entity with similarity scoring and relevance checking
  - `ChatSessionEntity`: Chat session aggregate for message management
  - `IChatRepository`, `IEmbeddingRepository`, `IDocumentRepository`: Repository interfaces
  - `GenerateResponseUseCase`: RAG orchestration business logic
  - `SearchDocumentsUseCase`: Document search business logic
- **Data Layer:**
  - `GeminiDataSource`: HTTP communication with Gemini Edge Functions
  - `SupabaseDataSource`: PostgreSQL + pgvector operations
  - `ChatRepositoryImpl`, `EmbeddingRepositoryImpl`, `DocumentRepositoryImpl`: Repository implementations
- **Presentation Layer:**
  - `ChatbotContainer`: Dependency injection container with singleton pattern
  - Refactored `ExpertAssistantWithRAG` to use dependency injection

### Removed
- Monolithic `RAGService` class (replaced by use cases and repositories)
- Direct Supabase client instantiation in components (now injected via container)

## [0.2.1] - 2026-01-28

### Fixed
- **CRITICAL:** Migrated to stable Gemini API models after deprecation
  - Updated `gemini-embedding` to use `gemini-embedding-001` (was `text-embedding-004`)
  - Updated `gemini-generate` to use `gemini-2.5-flash` (was `gemini-2.0-flash-exp`)
  - Added explicit `outputDimensionality: 768` parameter for embeddings
- Fixed dimension mismatch between generated embeddings (3072) and database schema (768)
- Resolved 404 errors from deprecated/experimental Gemini models
- Updated training script `train_rag.js` to match Edge Function configuration

### Changed
- Enhanced error logging in both Edge Functions for better debugging
- Added request body validation in `gemini-generate` function
- Created diagnostic test script `test_gemini_generate.js` for isolated testing

### Added
- Comprehensive deployment checklist (`CHECKLIST_DESPLIEGUE.md`)
- Audit log for model migration (`docs/audit/2026-01-28_gemini-model-migration.md`)

## [0.2.0] - 2026-01-27

### Added
- Comprehensive webhook integration documentation (`docs/CONTACT_FORM_WEBHOOK.md`)
  - n8n workflow configuration for contact form processing
  - Lead temperature classification system (HOT/WARM/COLD)
  - Gemini sentiment analysis integration
  - Google Sheets CRM integration
  - Telegram and Email notification system
- Complete RAG chatbot architecture documentation (`docs/CHATBOT_RAG_ARCHITECTURE.md`)
  - 6-step RAG flow detailed explanation
  - pgvector database schema and setup
  - Edge Functions implementation guide
  - Training pipeline documentation
  - Cost analysis and optimization strategies
  - Troubleshooting and testing procedures
- Audit logs for documentation creation
  - `docs/audit/2026-01-27_contact-form-webhook-documentation.md`
  - `docs/audit/2026-01-27_chatbot-rag-architecture-documentation.md`

## [0.2.0] - 2026-01-26

### Added
- Supabase Edge Functions for secure API key management
  - `gemini-embedding` function for generating embeddings server-side
  - `gemini-generate` function for generating AI responses server-side
- Automated deployment script `deploy-edge-functions.ps1`
- Comprehensive Edge Functions deployment documentation (`docs/EDGE_FUNCTIONS_DEPLOYMENT.md`)
- Test script `test_edge_functions.js` for post-deployment validation
- Technical README for Edge Functions (`supabase/functions/README.md`)

### Changed
- Refactored `ExpertAssistantWithRAG.tsx` to use Supabase Edge Functions instead of direct Gemini API calls
- RAGService now calls `supabase.functions.invoke()` for embeddings and generation

### Security
- **CRITICAL:** Fixed API key exposure issue in browser
- GEMINI_API_KEY now stored server-side in Supabase secrets (not exposed to client)
- Removed `VITE_GEMINI_API_KEY` from environment variables
- All Gemini API calls now proxied through secure Edge Functions

## [0.1.0] - 2026-01-26

### Added
- Initial RAG (Retrieval-Augmented Generation) chatbot implementation
- Supabase integration with pgvector extension
- Vector similarity search with `match_documents` function
- Knowledge base with 10 documents about QRIBAR, n8n, and tap-to-review services
- RLS (Row Level Security) policies for secure data access
- Clean Architecture structure following ADR-001
- TDD setup with Jest and React Testing Library

### Fixed
- RLS policy violations during document insertion
- Embedding storage format (string to vector(768) type)
- Function permissions for anonymous users
- Vector casting issues with `insert_document_with_embedding` function
