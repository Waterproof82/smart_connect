/**
 * RAG Logger
 * 
 * Logging system for RAG process debugging and monitoring.
 * Provides detailed visibility into document search, embedding operations,
 * and response generation.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface RAGLogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  phase: 'INDEXING' | 'SEARCH' | 'CACHE' | 'FALLBACK' | 'GENERATION';
  action: string;
  metadata?: Record<string, any>;
  duration?: number;
}

export interface RAGLoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  includeMetadata: boolean;
  logToConsole: boolean;
  logToMemory: boolean;
  maxMemoryLogs: number;
}

export class RAGLogger {
  public config: RAGLoggerConfig;
  private memoryLogs: RAGLogEntry[] = [];
  private startTime = 0;

  constructor(config: Partial<RAGLoggerConfig> = {}) {
    this.config = {
      enabled: true,
      minLevel: LogLevel.DEBUG,
      includeMetadata: true,
      logToConsole: true,
      logToMemory: true,
      maxMemoryLogs: 1000,
      ...config
    };
  }

  /**
   * Start timing a new RAG operation
   */
  startOperation(): void {
    this.startTime = performance.now();
    this.log(LogLevel.DEBUG, 'RAG_ORCHESTRATOR', 'GENERATION', 'Starting RAG operation');
  }

  /**
   * Log a message with context
   */
  log(
    level: LogLevel, 
    component: string, 
    phase: RAGLogEntry['phase'], 
    action: string, 
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled || !this._shouldLog(level)) {
      return;
    }

    const entry: RAGLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      phase,
      action,
      metadata: this.config.includeMetadata ? metadata : undefined,
      duration: this.startTime > 0 ? performance.now() - this.startTime : undefined
    };

    // Console logging
    if (this.config.logToConsole) {
      this._logToConsole(entry);
    }

    // Memory storage
    if (this.config.logToMemory) {
      this._addToMemory(entry);
    }
  }

  /**
   * Log document search operation
   */
  logDocumentSearch(query: string, options: any, results?: any): void {
    this.log(LogLevel.INFO, 'DOCUMENT_REPOSITORY', 'SEARCH', 'Document search initiated', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      options,
      resultCount: results?.length || 0,
      topResults: results?.slice(0, 3).map((r: any) => ({
        id: r.id,
        similarity: r.similarity,
        source: r.metadata?.source
      }))
    });
  }

  /**
   * Log embedding generation/retrieval
   */
  logEmbeddingOperation(text: string, operation: 'generate' | 'cache_hit' | 'cache_miss', embedding?: number[]): void {
    this.log(LogLevel.DEBUG, 'EMBEDDING_REPOSITORY', 'CACHE', `Embedding ${operation}`, {
      textLength: text.length,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      operation,
      embeddingDimensions: embedding?.length
    });
  }

  /**
   * log vector similarity search
   */
  logVectorSearch(embedding: number[], threshold: number, candidates: number, matches: number): void {
    this.log(LogLevel.INFO, 'SUPERBASE_DATASOURCE', 'SEARCH', 'Vector similarity search', {
      embeddingDimensions: embedding.length,
      threshold,
      candidates,
      matches,
      matchRate: candidates > 0 ? (matches / candidates) : 0
    });
  }

  /**
   * Log RAG phase transitions
   */
  logPhaseTransition(fromPhase: string, toPhase: string, context?: any): void {
    this.log(LogLevel.DEBUG, 'RAG_ORCHESTRATOR', 'SEARCH', `Phase transition: ${fromPhase} → ${toPhase}`, context);
  }

  /**
   * Log fallback activation
   */
  logFallback(reason: string, query: string, fallbackResponse?: any): void {
    this.log(LogLevel.WARN, 'FALLBACK_HANDLER', 'FALLBACK', 'Fallback activated', {
      reason,
      query: query.substring(0, 100),
      fallbackType: fallbackResponse?.category,
      shouldEscalate: fallbackResponse?.shouldEscalate
    });
  }

  /**
   * Log final response generation
   */
  logResponseGeneration(query: string, contextUsed: string[], documentsFound: number, response: string): void {
    this.log(LogLevel.INFO, 'GENERATE_RESPONSE_USECASE', 'GENERATION', 'Final response generated', {
      queryLength: query.length,
      contextDocumentsUsed: contextUsed.length,
      documentsFound,
      responseLength: response.length,
      responsePreview: response.substring(0, 200) + (response.length > 200 ? '...' : '')
    });
  }

  /**
   * Get all logs from memory
   */
  getMemoryLogs(): RAGLogEntry[] {
    return [...this.memoryLogs];
  }

  /**
   * Get logs by phase
   */
  getLogsByPhase(phase: RAGLogEntry['phase']): RAGLogEntry[] {
    return this.memoryLogs.filter(log => log.phase === phase);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): RAGLogEntry[] {
    return this.memoryLogs.filter(log => log.component === component);
  }

  /**
   * Clear memory logs
   */
  clearMemoryLogs(): void {
    this.memoryLogs = [];
  }

  /**
   * Export logs as formatted string
   */
  exportLogs(): string {
    return this.memoryLogs
      .map(log => `[${log.timestamp}] ${log.level} [${log.phase}] ${log.component}: ${log.action} ${log.metadata ? JSON.stringify(log.metadata, null, 2) : ''}`)
      .join('\n');
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): any {
    const phases = ['INDEXING', 'SEARCH', 'CACHE', 'FALLBACK', 'GENERATION'] as const;
    const stats: any = {};

    phases.forEach(phase => {
      const phaseLogs = this.getLogsByPhase(phase);
      const durations = phaseLogs.filter(log => log.duration).map(log => log.duration!);
      
      stats[phase] = {
        count: phaseLogs.length,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        minDuration: durations.length > 0 ? Math.min(...durations) : 0,
        maxDuration: durations.length > 0 ? Math.max(...durations) : 0
      };
    });

    return stats;
  }

  private _shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private _logToConsole(entry: RAGLogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level} [${entry.phase}] ${entry.component}`;
    const metadataStr = entry.metadata ? `\n${JSON.stringify(entry.metadata, null, 2)}` : '';
    const durationStr = entry.duration ? ` (${entry.duration.toFixed(2)}ms)` : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix}: ${entry.action}${durationStr}${metadataStr}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix}: ${entry.action}${durationStr}${metadataStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix}: ${entry.action}${durationStr}${metadataStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix}: ${entry.action}${durationStr}${metadataStr}`);
        break;
    }
  }

  private _addToMemory(entry: RAGLogEntry): void {
    this.memoryLogs.push(entry);
    
    // Keep only the last N logs
    if (this.memoryLogs.length > this.config.maxMemoryLogs) {
      this.memoryLogs = this.memoryLogs.slice(-this.config.maxMemoryLogs);
    }
  }
}

// Singleton instance for easy access
export const ragLogger = new RAGLogger({
  enabled: process.env.NODE_ENV !== 'production',
  minLevel: LogLevel.DEBUG,
  includeMetadata: true,
  logToConsole: true,
  logToMemory: true,
  maxMemoryLogs: 500
});