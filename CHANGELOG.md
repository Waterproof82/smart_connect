# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
