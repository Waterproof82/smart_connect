# Audit Log: Chatbot RAG Architecture Documentation

**Date:** 2026-01-27  
**Author:** AI Agent  
**Type:** Technical Documentation Creation  

---

## Operation Summary

Created comprehensive technical documentation for the RAG (Retrieval-Augmented Generation) chatbot architecture using Supabase, pgvector, and Gemini API.

---

## Files Created

### Primary Documentation
- **File:** `docs/CHATBOT_RAG_ARCHITECTURE.md`
- **Purpose:** Complete technical reference for the RAG chatbot system, covering architecture, database schema, Edge Functions, vector similarity search, and deployment
- **Size:** ~1,000 lines
- **Language:** Spanish

---

## Documentation Sections

### 1. Architecture Overview
- Complete system diagram showing:
  - Frontend (React + TypeScript)
  - Supabase Platform (Edge Functions + PostgreSQL + pgvector)
  - Gemini API integration
- Data flow visualization for RAG pipeline

### 2. RAG Processing Flow (6 Steps)
1. **User Query**: Input from chatbot UI
2. **Generate Query Embedding**: Convert text to 768-dim vector via Gemini API
3. **Vector Similarity Search**: PostgreSQL + pgvector cosine similarity search
4. **Build Context Prompt**: Combine system prompt with relevant documents
5. **Generate AI Response**: Gemini API with context-aware generation
6. **Display Response**: Render in chat UI

### 3. Database Architecture (PostgreSQL + pgvector)
- **Extension**: `pgvector` for vector operations
- **Table Schema**: `documents` with columns:
  - `id` (uuid, primary key)
  - `content` (text, full document)
  - `metadata` (jsonb, category, service, tags, priority)
  - `embedding` (vector(768), Gemini embedding)
  - `created_at` (timestamp)
- **Indexes**:
  - `ivfflat` index for fast vector similarity search
  - GIN index for JSONB metadata queries
- **Function**: `match_documents(query_embedding, match_threshold, match_count)`
  - Uses cosine distance operator `<=>`
  - Returns documents with similarity scores

### 4. Edge Functions (Supabase Deno Runtime)

#### `gemini-embedding/index.ts`
- **Purpose**: Generate 768-dimension embeddings server-side
- **Input**: `{ text: string }`
- **Output**: `{ embedding: { values: number[] } }`
- **API**: `text-embedding-004:embedContent` (v1 endpoint)
- **Security**: API key protected in Deno environment

#### `gemini-generate/index.ts`
- **Purpose**: Generate AI responses with context
- **Input**: `{ contents: [], generationConfig: {} }`
- **Output**: `{ candidates: [{ content: { parts: [{ text }] } }] }`
- **API**: `gemini-2.0-flash-exp:generateContent` (v1beta endpoint)
- **Features**: Error handling, debug logging, CORS support

### 5. Training Pipeline (`train_rag.js`)
- **Knowledge Base**: 10 documents covering:
  - QRIBAR product details and pricing
  - n8n automation services and pricing
  - Tap-to-Review NFC cards
  - General SmartConnect AI information
- **Process**:
  1. Read document from knowledge base
  2. Generate embedding via Gemini API
  3. Insert into Supabase with metadata
- **Execution**: `node src/features/chatbot/data/train_rag.js`
- **Output**: Success/error count with detailed logging

### 6. Security Best Practices
- **API Key Protection**: Never expose in frontend code
- **Environment Variables**: 
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Supabase: `GEMINI_API_KEY` secret
- **Row Level Security (RLS)**:
  - Public read access for chatbot queries
  - Admin-only insert access for training
- **Rate Limiting**: IP-based throttling implementation
- **CORS**: Proper headers for cross-origin requests

### 7. Testing & Debugging
- **curl commands** for testing Edge Functions
- **SQL queries** for verifying vector search
- **Troubleshooting guide** for common issues:
  - "API key not valid"
  - "No similar documents found"
  - "CORS error"
  - "Embedding dimension mismatch"

### 8. Deployment Checklist
- Backend setup (Supabase project, pgvector, tables, functions)
- Training pipeline execution
- Frontend integration
- Production configuration
- Monitoring and logging

### 9. Cost Analysis
- **Development (Free Tier)**: 0€/month
  - Gemini API: 1,500 requests/day free
  - Supabase: 500MB DB + 2GB storage free
- **Production (1,000 users)**: ~26€/month
- **Production (10,000 users)**: ~33€/month
- **Optimization strategies**: Caching, batching, throttling, compression

### 10. Advanced Topics
- Hybrid search (vector + full-text)
- Reranking strategies
- Streaming responses
- Conversation memory
- Multi-modal RAG (images, PDFs)
- A/B testing for prompts

---

## Technical Specifications

### Vector Search Algorithm
- **Similarity Metric**: Cosine similarity (1 - cosine distance)
- **Index Type**: IVFFlat (Inverted File Flat)
- **Embedding Model**: text-embedding-004 (768 dimensions)
- **Default Threshold**: 0.3 (30% similarity minimum)
- **Default Result Count**: 3 top documents

### API Endpoints

#### Gemini Embedding
```
POST https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent
Header: x-goog-api-key: ${GEMINI_API_KEY}
Body: { model, content: { parts: [{ text }] } }
Response: { embedding: { values: number[] } }
```

#### Gemini Generate
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
Header: x-goog-api-key: ${GEMINI_API_KEY}
Body: { contents: [], generationConfig: {} }
Response: { candidates: [{ content: { parts: [{ text }] } }] }
```

#### Supabase RPC
```
POST https://{project}.supabase.co/rest/v1/rpc/match_documents
Header: Authorization: Bearer ${SUPABASE_ANON_KEY}
Body: { query_embedding: number[], match_threshold: float, match_count: int }
Response: Array<{ id, content, metadata, similarity }>
```

---

## Code References

### Frontend Components
- `src/features/chatbot/presentation/ExpertAssistantWithRAG.tsx`
  - RAGService class with 3 methods:
    - `generateEmbedding(text)`
    - `searchSimilarDocs(query, limit)`
    - `generateWithRAG(userQuery)`

### Backend Functions
- `supabase/functions/gemini-embedding/index.ts`
- `supabase/functions/gemini-generate/index.ts`

### Training Scripts
- `src/features/chatbot/data/train_rag.js`
  - 10 knowledge base documents
  - Metadata structure: category, service, tags, priority

### Database Schema
- PostgreSQL with pgvector extension
- Table: `documents`
- Function: `match_documents()`
- Indexes: `ivfflat` (vector), `gin` (jsonb)

---

## Alignment with Project Goals

### Agencia-Escuela Model
- **Expert Chatbot**: Provides instant answers about services
- **Lead Qualification**: Identifies potential clients based on questions
- **Scalability**: Tier gratuito supports development phase

### Technical Standards
- **Clean Architecture**: Domain layer (RAGService), Data layer (Supabase), Presentation (React)
- **Security by Design**: API keys protected, RLS enabled, rate limiting planned
- **TDD Ready**: Edge Functions and RAGService are testable units

### Business Value
- **24/7 Availability**: Chatbot answers questions outside business hours
- **Consistent Messaging**: All responses use approved knowledge base
- **Metrics**: Track most common questions to improve services
- **Cost Efficient**: Free tier for initial deployment

---

## Integration Points

### With Contact Form Webhook
- User asks question → Chatbot provides info → User fills contact form
- Chatbot logs can feed into lead temperature analysis

### With n8n Automation
- High-intent questions → Trigger webhook to n8n
- n8n sends follow-up email based on question category
- Analytics on question types inform marketing strategy

### With QRIBAR Product
- Knowledge base includes detailed QRIBAR information
- Chatbot can guide restaurant owners through features
- Pricing questions answered instantly

---

## Maintenance Procedures

### Adding New Documents
1. Edit `train_rag.js` knowledgeBase array
2. Add document with content and metadata
3. Run: `node src/features/chatbot/data/train_rag.js`
4. Verify in Supabase Table Editor

### Updating Existing Documents
1. Find document ID in Supabase
2. Update content in SQL Editor
3. Regenerate embedding via API
4. Update embedding field in database

### Monitoring Performance
1. Check Supabase Dashboard > Edge Functions > Logs
2. Review query latency and error rates
3. Analyze similarity scores in responses
4. Collect user feedback (thumbs up/down)

### Scaling Strategy
1. Monitor Gemini API usage (approach 1,500 req/day limit)
2. Implement caching for common queries
3. Upgrade to Supabase Pro when DB exceeds 500MB
4. Consider Redis for rate limiting at scale

---

## Known Limitations

1. **768-Dimension Vectors**: Fixed by Gemini model (cannot change)
2. **Context Window**: Limited to 3 documents by default (adjustable)
3. **No Conversation Memory**: Each query is stateless (future enhancement)
4. **Spanish Only**: Knowledge base and prompts in Spanish (multiligual planned)
5. **No Streaming**: Responses appear all at once (streaming possible with SDK)

---

## Future Enhancements

1. **Conversation History**: Store and reference previous messages
2. **Multi-lingual Support**: Translate knowledge base, detect user language
3. **Image Understanding**: Add product images to RAG context
4. **PDF Ingestion**: Extract and index PDF documentation
5. **A/B Testing**: Experiment with different prompts and thresholds
6. **Analytics Dashboard**: Real-time metrics on questions and satisfaction
7. **Feedback Loop**: User ratings to improve document relevance

---

## References

- Architecture inspired by: LangChain, LlamaIndex RAG patterns
- Vector database: pgvector (PostgreSQL extension)
- Embedding model: Gemini text-embedding-004
- Generation model: Gemini 2.0 Flash Experimental
- Deployment platform: Supabase Edge Functions (Deno runtime)

---

## Changelog

### 2026-01-27
- Initial documentation created
- Covers complete RAG architecture from training to deployment
- Includes security best practices and cost analysis
- Provides troubleshooting guide and testing procedures
