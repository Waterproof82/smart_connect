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
  const searchResults = documentLogs.filter(log => log.metadata?.totalResults);
  if (searchResults.length > 0) {
    documentStats.avgResultsPerSearch = 
      searchResults.reduce((sum, log) => sum + log.metadata.totalResults, 0) / searchResults.length;
  }
  
  // Analyze top performing sources
  vectorLogs.forEach(log => {
    if (log.metadata?.topResults) {
      log.metadata.topResults.forEach((result: { source: string }) => {
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
function identifyCommonIssues(searchLogs: unknown[], fallbackLogs: unknown[]) {
  const issues = {
    emptyQueries: 0,
    lowConfidenceSearches: 0,
    cacheMisses: 0,
    embeddingErrors: 0
  };
  
  searchLogs.forEach(log => {
    if (log.action.includes('Empty query')) issues.emptyQueries++;
    if (log.metadata?.totalFound === 0) issues.lowConfidenceSearches++;
  });
  
  const embeddingLogs = ragLogger.getLogsByComponent('EMBEDDING_REPOSITORY');
  embeddingLogs.forEach(log => {
    if (log.metadata?.operation === 'cache_miss') issues.cacheMisses++;
  });
  
  return issues;
}

/**
 * Example: Real-time monitoring hook
 */
export function createRAGMonitor() {
  return {
    onQueryStart: (query: string) => {
      ragLogger.startOperation();
    },
    
    onQueryComplete: (result: any) => {
    },
    
    onFallback: (reason: string) => {
      console.log(`⚠️  RAG Fallback: ${reason}`);
    },
    
    getSummary: () => {
      return {
        performance: ragLogger.getPerformanceStats(),
        patterns: analyzeSearchPatterns(),
        effectiveness: monitorDocumentEffectiveness()
      };
    }
  };
}
