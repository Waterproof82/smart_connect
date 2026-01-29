# Audit Log: RAG Embedding Format Fix

**Date:** 2026-01-29
**Operation:** Fixed RAG vector search by converting embeddings to correct pgvector format

## Problem Statement

The RAG chatbot was returning `documentsUsed: 0` despite having 25 documents in the database with embeddings. Root cause analysis revealed that embeddings were stored as JSON arrays `[0.004,0.0005,...]` instead of PostgreSQL pgvector type.

## Actions Taken

### 1. Database Cleanup
- Created `clear-documents.mjs` script to delete all 25 existing documents with incorrect format
- Verified table was cleared successfully (count: 0)

### 2. Insert Function Fix
- Created migration `20260129130000_fix_insert_document_return.sql`
- Changed `insert_document` function return type from `UUID` to `void`
- Reason: Supabase JS client had issues parsing UUID response
- Status: ✅ Applied successfully

### 3. Knowledge Base Repopulation
- Updated `populate-knowledge-base.mjs` to use `insert_document` RPC
- Converted embedding arrays to pgvector string format: `[${embedding.join(',')}]`
- Used `doc_embedding::vector(768)` cast in database function
- Result: ✅ 5 documents inserted successfully
  - qribar_product
  - nfc_reviews_product
  - automation_product
  - company_philosophy
  - contact_info

### 4. Match Documents Signature Fix
- Created migration `20260129131000_fix_match_documents_signature.sql`
- Changed `match_documents` parameter from `vector(768)` to `text`
- Reason: Supabase JS sends embeddings as JSON arrays, PostgreSQL needs explicit cast
- Function now accepts text and casts to vector: `query_embedding::vector(768)`
- Status: ✅ Applied successfully

### 5. Edge Function Update
- Modified `gemini-chat/index.ts` to convert embedding array to string before RPC call
- Added: `const embeddingString = \`[${queryEmbedding.join(',')}]\`;`
- Changed RPC call to pass `query_embedding: embeddingString`
- Added debug logging to trace vector search execution
- Status: ✅ Deployed (130.7kB)

## Technical Details

### Root Cause
PostgreSQL pgvector extension requires proper `vector(768)` type for cosine similarity operator `<=>`. JSON arrays don't work with vector operators. The cast `::vector(768)` is required when inserting or querying.

### Solution Architecture
1. **Insert Flow:** Array → String `"[1,2,3]"` → Cast to `vector(768)` → Database
2. **Search Flow:** Array → String `"[1,2,3]"` → Function casts to `vector(768)` → Cosine search
3. **Match Documents:** Accepts `text`, casts internally, returns similar documents

### Files Modified
- `scripts/clear-documents.mjs` (created)
- `scripts/populate-knowledge-base.mjs` (updated to use RPC)
- `supabase/migrations/20260129130000_fix_insert_document_return.sql` (created)
- `supabase/migrations/20260129131000_fix_match_documents_signature.sql` (created)
- `supabase/functions/gemini-chat/index.ts` (updated embedding format)

## Verification Steps

### Database Verification
```sql
SELECT COUNT(*) FROM documents; -- Should return 5
SELECT source, pg_typeof(embedding)::text FROM documents; -- Should show vector type
```

### API Testing
```powershell
# Test match_documents directly
$body = @{query_embedding="[0.001,...]"; match_threshold=0.3; match_count=5} | ConvertTo-Json
Invoke-RestMethod -Uri 'https://tysjedvujvsmrzzrmesr.supabase.co/rest/v1/rpc/match_documents' ...
```

### RAG Testing
```powershell
# Test chatbot with pricing query
$body = @{userQuery='¿Cuánto cuesta QRiBar?'; conversationHistory=@()} | ConvertTo-Json
Invoke-RestMethod -Uri '.../functions/v1/gemini-chat' ...
# Expected: documentsUsed > 0, response contains "29€/mes"
```

## Current Status

- ✅ 5 documents inserted with correct vector format
- ✅ insert_document function working (returns void)
- ✅ match_documents function updated (accepts text parameter)
- ✅ Edge Function deployed with string conversion
- ✅ **RAG WORKING:** Chatbot successfully retrieves documents and uses context in responses
- ✅ Browser testing confirmed: documentsUsed > 0, responses include specific pricing (29€/mes)

## Final Resolution

The RAG system is now fully operational. PowerShell testing showed false negatives due to encoding issues, but browser testing confirmed successful vector search and document retrieval.

**Key Success Metrics:**
- Query: "¿Cuánto cuesta QRiBar?"
- Expected: Response includes "29€/mes" from qribar_product document
- Result: ✅ SUCCESS - Chatbot retrieves context and provides accurate pricing

## Cleanup Actions

1. ✅ Removed debug logging from gemini-chat Edge Function
2. ✅ Verified 5 documents in knowledge base
3. ✅ Confirmed vector search works with text parameter cast

## Lessons Learned

1. **Type Casting is Critical:** PostgreSQL pgvector requires explicit casts from text/JSON to vector type
2. **Supabase JS Limitations:** RPC functions returning complex types (UUID) may cause parsing issues
3. **Debug Strategy:** Start with direct SQL tests, then REST API, then Edge Function, then client
4. **Migration Management:** Use timestamped migrations and repair command when conflicts occur
5. **Vector Search Requirements:** Both insert and query operations need proper vector format

## References

- PostgreSQL pgvector docs: https://github.com/pgvector/pgvector
- Supabase RPC docs: https://supabase.com/docs/guides/database/functions
- Gemini text-embedding-004: 768 dimensions
- Cosine distance operator: `<=>` in pgvector
