/**
 * RAG Debug Logger Usage Example
 * 
 * This file demonstrates how to use the RAG logging system to monitor
 * and debug the complete RAG process in the chatbot.
 */

import { ragLogger, LogLevel } from '../shared/rag-logger';

/**
 * Example: Enable detailed logging for debugging RAG performance
 */
export function enableDetailedRAGLogging() {
  // Configure logger for maximum detail
  Object.assign(ragLogger.config, {
    enabled: true,
    minLevel: LogLevel.DEBUG,
    includeMetadata: true,
    logToConsole: true,
    logToMemory: true,
    maxMemoryLogs: 1000,
  });
}

/**
 * Example: Get performance insights from recent RAG operations
 */
export function getRAGPerformanceInsights() {
  const stats = ragLogger.getPerformanceStats();
  
  
  return stats;
}

/**
 * Example: Analyze search patterns and document usage
 */
export function analyzeSearchPatterns() {
  const searchLogs = ragLogger.getLogsByPhase('SEARCH');
  const fallbackLogs = ragLogger.getLogsByPhase('FALLBACK');
  
  const analysis = {
    totalSearches: searchLogs.length,
    totalFallbacks: fallbackLogs.length,
    fallbackRate: fallbackLogs.length / Math.max(searchLogs.length, 1),
    avgResponseTime: ragLogger.getPerformanceStats().SEARCH.avgDuration,
    commonIssues: identifyCommonIssues(searchLogs, fallbackLogs)
  };
  
  
  return analysis;
}

/**
 * Example: Export recent logs for debugging
 */
export function exportRecentLogs(hours = 1) {
  const allLogs = ragLogger.getMemoryLogs();
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  
  const recentLogs = allLogs.filter(log => 
    new Date(log.timestamp).getTime() > cutoffTime
  );
  
  
  
  return recentLogs;
}

/**
 * Example: Monitor document usage and effectiveness
 */
export function monitorDocumentEffectiveness() {
  const documentLogs = ragLogger.getLogsByComponent('DOCUMENT_REPOSITORY');
  const vectorLogs = ragLogger.getLogsByComponent('SUPERBASE_DATASOURCE');
  
  const documentStats = {
    totalSearches: documentLogs.length,
    avgResultsPerSearch: 0,
    avgSimilarityScore: 0,
    topPerformingSources: {}
  };
  
  // Calculate average results and similarity
  const searchResults = documentLogs.filter(
    (log): log is { metadata: { totalResults: number } } =>
      typeof log === 'object' && log !== null &&
      'metadata' in log &&
      typeof log.metadata?.totalResults === 'number'
  );
  if (searchResults.length > 0) {
    documentStats.avgResultsPerSearch = 
      searchResults.reduce((sum, log) => sum + (typeof log.metadata.totalResults === 'number' ? log.metadata.totalResults : 0), 0) / searchResults.length;
  }

  // Analyze top performing sources
  vectorLogs.forEach((log) => {
    if (
      typeof log === 'object' && log !== null &&
      'metadata' in log &&
      Array.isArray((log as { metadata?: { topResults?: { source: string }[] } }).metadata?.topResults)
    ) {
      (log as { metadata: { topResults: { source: string }[] } }).metadata.topResults.forEach((result) => {
        if (!documentStats.topPerformingSources[result.source]) {
          documentStats.topPerformingSources[result.source] = 0;
        }
        documentStats.topPerformingSources[result.source]++;
      });
    }
  });
  
  
  return documentStats;
}

/**
 * Helper: Identify common issues from logs
 */
function identifyCommonIssues(searchLogs: unknown[], _fallbackLogs: unknown[]) {
  const issues = {
    emptyQueries: 0,
    lowConfidenceSearches: 0,
    cacheMisses: 0,
    embeddingErrors: 0
  };
  
  searchLogs.forEach((log) => {
    if (
      typeof log === 'object' && log !== null &&
      'action' in log && typeof (log as { action?: string }).action === 'string' &&
      (log as { action: string }).action.includes('Empty query')
    ) {
      issues.emptyQueries++;
    }
    if (
      typeof log === 'object' && log !== null &&
      'metadata' in log && typeof (log as { metadata?: { totalFound?: number } }).metadata === 'object' &&
      (log as { metadata: { totalFound?: number } }).metadata?.totalFound === 0
    ) {
      issues.lowConfidenceSearches++;
    }
  });
  
  const embeddingLogs = ragLogger.getLogsByComponent('EMBEDDING_REPOSITORY');
  embeddingLogs.forEach((log: { metadata?: { operation?: string } }) => {
    if (log.metadata?.operation === 'cache_miss') issues.cacheMisses++;
  });
  
  return issues;
}

/**
 * Example: Real-time monitoring hook
 */
  return {
    onQueryStart: (_query: string) => {
      ragLogger.startOperation();
    },
    onQueryComplete: (_result: unknown) => {
      // No-op
    },
    onFallback: (reason: string) => {
      console.warn(`⚠️  RAG Fallback: ${reason}`);
    },
    getSummary: () => {
      return {
        performance: ragLogger.getPerformanceStats(),
        patterns: analyzeSearchPatterns(),
        effectiveness: monitorDocumentEffectiveness(),
      };
    },
  };
// ...existing code...
