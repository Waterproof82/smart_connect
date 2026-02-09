# RAG Logging System - Documentation

## Overview
The RAG logging system provides detailed visibility into the complete RAG (Retrieval-Augmented Generation) process, enabling debugging and optimization of the chatbot's document search and response generation.

## Key Features

### 1. Comprehensive Logging Coverage
- **SupabaseDataSource**: Vector similarity searches, tenant filtering, document retrieval
- **DocumentRepositoryImpl**: Metadata filtering, result mapping, search statistics
- **GeminiDataSource**: Embedding operations, Edge Function calls, AI responses
- **RAGOrchestrator**: Phase transitions, cache operations, similarity calculations
- **GenerateResponseUseCase**: Complete flow with timing and context usage

### 2. Log Levels
- `DEBUG`: Detailed operations, transitions, cache hits/misses
- `INFO`: Search results, document counts, response generation
- `WARN`: Fallback activations, performance issues
- `ERROR`: API failures, embedding errors, invalid responses

### 3. Performance Metrics
- Phase timing (INDEXING, SEARCH, CACHE, FALLBACK, GENERATION)
- Cache hit/miss rates
- Document similarity scores
- Response generation times

## Usage Examples

### Enable Detailed Logging
```typescript
import { ragLogger, LogLevel } from './features/chatbot/shared/rag-logger';

// Configure for maximum detail
ragLogger.config = {
  enabled: true,
  minLevel: LogLevel.DEBUG,
  includeMetadata: true,
  logToConsole: true,
  logToMemory: true,
  maxMemoryLogs: 1000,
};
```

### Real-time Monitoring
```typescript
const monitor = createRAGMonitor();

// Before query
monitor.onQueryStart("¿Cómo funciona QRIBAR?");

// After query
monitor.onQueryComplete({
  documentsFound: 3,
  cacheHit: false,
  response: "QRIBAR es una carta digital..."
});
```

### Performance Analysis
```typescript
// Get performance stats
const stats = ragLogger.getPerformanceStats();
console.log('Average search time:', stats.SEARCH.avgDuration);

// Analyze search patterns
const patterns = analyzeSearchPatterns();
console.log('Fallback rate:', patterns.fallbackRate);

// Export logs for debugging
const logs = ragLogger.exportLogs();
console.log(logs);
```

## Log Structure

Each log entry contains:
- `timestamp`: ISO timestamp
- `level`: Log level (DEBUG, INFO, WARN, ERROR)
- `component`: System component generating the log
- `phase`: RAG phase (INDEXING, SEARCH, CACHE, FALLBACK, GENERATION)
- `action`: Specific action performed
- `metadata`: Additional context (optional)
- `duration`: Operation time in milliseconds (optional)

## Key Insights You Can Gain

### 1. Document Search Effectiveness
- How many documents are typically found per query
- Average similarity scores and threshold effectiveness
- Which sources provide the most relevant results

### 2. Cache Performance
- Hit/miss rates for query embeddings
- Time savings from cache hits
- Most frequent cached queries

### 3. Response Generation Quality
- Context usage patterns
- Response time analysis
- Fallback activation reasons

### 4. System Bottlenecks
- Slowest phases in the RAG pipeline
- API call latencies
- Memory usage patterns

## Troubleshooting Guide

### Low Document Relevance
```typescript
// Check similarity thresholds and scores
const searchLogs = ragLogger.getLogsByPhase('SEARCH');
const lowScores = searchLogs.filter(log => 
  log.metadata?.avgRelevance < 0.5
);
```

### High Fallback Rate
```typescript
// Analyze fallback reasons
const fallbackLogs = ragLogger.getLogsByPhase('FALLBACK');
const reasons = fallbackLogs.map(log => log.metadata?.reason);
```

### Cache Inefficiency
```typescript
// Check cache hit rate
const cacheStats = ragLogger.getCacheStats();
console.log('Hit rate:', cacheStats.hitRate);
```

## Production Considerations

1. **Log Levels**: Use INFO or WARN in production to reduce noise
2. **Memory Management**: Set appropriate `maxMemoryLogs` limits
3. **Performance**: Disable detailed metadata in high-traffic scenarios
4. **Privacy**: Ensure sensitive data is not logged (system handles this automatically)

## Files Modified
- `src/features/chatbot/shared/rag-logger.ts` - Core logging system
- `src/features/chatbot/data/datasources/SupabaseDataSource.ts` - Vector search logs
- `src/features/chatbot/data/repositories/DocumentRepositoryImpl.ts` - Document retrieval logs
- `src/features/chatbot/data/datasources/GeminiDataSource.ts` - AI/Embedding logs
- `src/features/chatbot/domain/rag-orchestrator.ts` - Phase transition logs
- `src/features/chatbot/domain/usecases/GenerateResponseUseCase.ts` - Complete flow logs

This system provides comprehensive visibility into the RAG process for optimization and debugging purposes.