# Audit Log: Source Architecture Simplification

**Date:** 2026-01-29  
**Timestamp:** 14:30 UTC  
**Operation:** Major refactoring of source classification system

---

## Changes Applied

### 1. Removed Category Field from System
- **File:** `src/features/chatbot/data/rag-indexer.ts`
- **Action:** Removed `category` field from chunk metadata
- **Reason:** Redundant with source field, simplified architecture

### 2. Simplified Source Naming Convention
- **File:** `scripts/populate-knowledge-base.mjs`
- **Action:** Changed from 5 complex sources to 3 simple sources
  - `qribar_product` → `qribar`
  - `nfc_reviews_product` → `reviews`
  - `automation_product` → `general`
  - `company_philosophy` → `general`
  - `contact_info` → `general`
- **Reason:** User clarification that sources should be direct admin-created labels, not mapped values

### 3. Removed Source Mapping Logic
- **Files:** 
  - `src/features/chatbot/data/supabase-knowledge-loader.ts`
  - `src/features/chatbot/data/rag-indexer.ts`
- **Actions:**
  - Removed `_mapSourceToCategory()` method (18 lines)
  - Removed `_inferCategory()` method (15 lines)
  - Changed to direct lowercase comparison: `if (source === 'qribar')`
- **Reason:** No intermediate mapping needed with simplified sources

### 4. Updated RAG Orchestrator Interface
- **File:** `src/features/chatbot/domain/rag-orchestrator.ts`
- **Actions:**
  - Changed `RAGSearchOptions.category?: string` → `RAGSearchOptions.source?: string`
  - Updated filtering: `chunk.metadata.category` → `chunk.metadata.source`
  - Removed category from cache metadata
  - Fallback handler uses source as category (backward compatibility)
- **Reason:** Consistent filtering by source across entire RAG pipeline

### 5. Updated Test Suites
- **Files:**
  - `tests/unit/features/chatbot/data/rag-indexer.test.ts`
  - `tests/unit/features/chatbot/domain/rag-orchestrator.test.ts`
  - `tests/unit/features/chatbot/data/supabase-knowledge-loader.test.ts`
- **Actions:**
  - Changed "Category Inference" tests to "preserve source in metadata"
  - Updated filter tests from `category: 'reputacion_online'` to `source: 'reviews_service'`
  - Updated mock data from complex sources to simplified sources
- **Result:** 174 unit tests passing

---

## Architectural Impact

### Before (Complex Mapping):
```typescript
// Document in DB
{ content: '...', source: 'qribar_product' }

// Mapping layer
_mapSourceToCategory('qribar_product') → 'qribar'

// Chunk metadata
{ source: 'qribar_product', category: 'producto_digital' }

// RAG filtering
filter(chunk => chunk.metadata.category === 'producto_digital')
```

### After (Direct Labels):
```typescript
// Document in DB
{ content: '...', source: 'qribar' }

// No mapping needed
source.toLowerCase() === 'qribar'

// Chunk metadata
{ source: 'qribar' }

// RAG filtering
filter(chunk => chunk.metadata.source === 'qribar')
```

---

## Business Impact

- **Admins** can now create documents with simple source labels: `qribar`, `reviews`, `general`
- **Chatbot** filters knowledge by source directly without intermediate mapping
- **Maintainability** improved by removing ~33 lines of mapping logic
- **Extensibility** simplified: Add new sources without updating mapping functions

---

## Testing Results

```
Test Suites: 1 skipped, 15 passed, 15 of 16 total
Tests:       11 skipped, 174 passed, 185 total
Time:        3.578 s
```

All unit tests passing, no regressions detected.

---

## Files Modified

1. `scripts/populate-knowledge-base.mjs` (5 document sources updated)
2. `src/features/chatbot/data/supabase-knowledge-loader.ts` (removed mapping, 18 lines)
3. `src/features/chatbot/data/rag-indexer.ts` (removed category, 15 lines)
4. `src/features/chatbot/domain/rag-orchestrator.ts` (interface change)
5. `tests/unit/features/chatbot/data/rag-indexer.test.ts` (expectations updated)
6. `tests/unit/features/chatbot/domain/rag-orchestrator.test.ts` (filter tests)
7. `tests/unit/features/chatbot/data/supabase-knowledge-loader.test.ts` (mock data)

**Total lines removed:** ~33 (mapping functions)  
**Total files modified:** 7

---

**Agent:** GitHub Copilot  
**Context:** User explained sources should be admin-created labels for RAG filtering, not complex mapped values
