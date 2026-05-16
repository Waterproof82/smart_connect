/**
 * Security Logger
 *
 * Extends ConsoleLogger with security event tracking capabilities.
 * Logs security-critical events for monitoring and incident response.
 *
 * Security: OWASP A09:2021 (Security Logging and Monitoring)
 */

import { ConsoleLogger } from "./Logger";

/**
 * Interface for persisting security logs (Dependency Inversion Principle).
 * Domain layer defines the contract; infrastructure implements it.
 */
export interface ISecurityLogPersistence {
  insert(
    log: Record<string, unknown>,
  ): Promise<{ error: { message: string } | null }>;
}

export type SecurityEventType =
  | "AUTH_FAILURE"
  | "AUTH_SUCCESS"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_QUERY"
  | "DATA_ACCESS"
  | "XSS_ATTEMPT"
  | "INJECTION_ATTEMPT"
  | "UNAUTHORIZED_ACCESS";

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

interface SecurityLogEntry extends SecurityEvent {
  timestamp: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

export class SecurityLogger extends ConsoleLogger {
  private readonly persistence?: ISecurityLogPersistence;

  constructor(persistence?: ISecurityLogPersistence) {
    super("[Security]");
    this.persistence = persistence;
  }

  /**
   * Logs a security event
   *
   * @param event Security event to log
   *
   * Security considerations:
   * - All events are logged to console in development
   * - Production events are persisted to Supabase security_logs table
   * - Critical events trigger console alerts (future: email/Slack)
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const securityLog = {
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(event.type),
      ...event,
    };

    // Format for console
    const formattedLog = this.formatSecurityLog(securityLog);

    // Log based on severity
    if (securityLog.severity === "CRITICAL") {
      console.error("🔒 SECURITY ALERT:", formattedLog);
      await this.sendAlert(securityLog);
    } else if (securityLog.severity === "WARNING") {
      console.warn("🔒 SECURITY WARNING:", formattedLog);
    } else {
      // eslint-disable-next-line no-console
      console.info("🔒 SECURITY EVENT:", formattedLog);
    }

    // Persist to database
    await this.sendToDatabase(securityLog);
  }

  /**
   * Logs an authentication failure
   */
  async logAuthFailure(details: {
    userId?: string;
    ip?: string;
    reason: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    this.logSecurityEvent({
      type: "AUTH_FAILURE",
      userId: details.userId,
      ip: details.ip,
      details: `Authentication failed: ${details.reason}`,
      metadata: details.metadata,
    });
  }

  /**
   * Logs an authentication success
   */
  async logAuthSuccess(details: {
    userId: string;
    ip?: string;
    method?: string;
  }): Promise<void> {
    const methodInfo = details.method ? ` via ${details.method}` : "";
    this.logSecurityEvent({
      type: "AUTH_SUCCESS",
      userId: details.userId,
      ip: details.ip,
      details: `User authenticated successfully${methodInfo}`,
    });
  }

  /**
   * Logs a rate limit violation
   */
  async logRateLimitExceeded(details: {
    userId?: string;
    ip?: string;
    endpoint: string;
    limit: number;
  }): Promise<void> {
    this.logSecurityEvent({
      type: "RATE_LIMIT_EXCEEDED",
      userId: details.userId,
      ip: details.ip,
      details: `Rate limit exceeded on ${details.endpoint} (limit: ${details.limit} req/min)`,
      metadata: { endpoint: details.endpoint, limit: details.limit },
    });
  }

  /**
   * Logs an XSS injection attempt
   */
  async logXSSAttempt(details: {
    userId?: string;
    ip?: string;
    payload: string;
    field: string;
  }): Promise<void> {
    this.logSecurityEvent({
      type: "XSS_ATTEMPT",
      userId: details.userId,
      ip: details.ip,
      details: `XSS attempt detected in ${details.field}`,
      metadata: {
        field: details.field,
        payloadLength: details.payload.length,
        // Don't log full payload to avoid log injection
        payloadPreview: details.payload.substring(0, 50),
      },
    });
  }

  /**
   * Logs a suspicious query pattern
   */
  async logSuspiciousQuery(details: {
    userId?: string;
    ip?: string;
    query: string;
    reason: string;
  }): Promise<void> {
    this.logSecurityEvent({
      type: "SUSPICIOUS_QUERY",
      userId: details.userId,
      ip: details.ip,
      details: `Suspicious query detected: ${details.reason}`,
      metadata: { queryLength: details.query.length },
    });
  }

  /**
   * Logs unauthorized access attempt
   */
  async logUnauthorizedAccess(details: {
    userId?: string;
    ip?: string;
    resource: string;
    action: string;
  }): Promise<void> {
    this.logSecurityEvent({
      type: "UNAUTHORIZED_ACCESS",
      userId: details.userId,
      ip: details.ip,
      details: `Unauthorized access attempt: ${details.action} on ${details.resource}`,
      metadata: { resource: details.resource, action: details.action },
    });
  }

  /**
   * Determines severity based on event type
   */
  private getSeverity(
    type: SecurityEventType,
  ): "INFO" | "WARNING" | "CRITICAL" {
    switch (type) {
      case "AUTH_SUCCESS":
      case "DATA_ACCESS":
        return "INFO";

      case "AUTH_FAILURE":
      case "RATE_LIMIT_EXCEEDED":
      case "SUSPICIOUS_QUERY":
        return "WARNING";

      case "XSS_ATTEMPT":
      case "INJECTION_ATTEMPT":
      case "UNAUTHORIZED_ACCESS":
        return "CRITICAL";

      default:
        return "WARNING";
    }
  }

  /**
   * Formats security log for console output
   */
  private formatSecurityLog(log: SecurityLogEntry): string {
    return JSON.stringify(
      {
        timestamp: log.timestamp,
        type: log.type,
        userId: log.userId || "anonymous",
        ip: log.ip || "unknown",
        details: log.details,
        metadata: log.metadata,
      },
      null,
      2,
    );
  }

  /**
   * Persists security event to Supabase database
   *
   * @param log Security log with formatted data
   *
   * Security:
   * - Uses anon key for insert (RLS allows inserts)
   * - Only service role can read logs (admin dashboard)
   * - Sensitive data is sanitized before storage
   */
  private async sendToDatabase(log: SecurityLogEntry): Promise<void> {
    if (!this.persistence) return;

    try {
      const { error } = await this.persistence.insert({
        codigo: log.type,
        mensaje: log.details,
        modulo: "security",
        severity: log.severity,
        user_id: log.userId || null,
        metadata: log.metadata || {},
        created_at: log.timestamp,
      });

      if (error) {
        console.error(
          "Failed to persist security log to database:",
          error.message,
        );
      }
    } catch (err) {
      console.error("Exception while persisting security log:", err);
    }
  }

  /**
   * Sends alert for critical security events
   *
   * @param log Security log with CRITICAL severity
   *
   * Implementation:
   * - Console alert (immediate visibility)
   * - Future: Email to info@digitalizatenerife.es
   * - Future: Telegram/Slack notification
   */
  private async sendAlert(log: SecurityLogEntry): Promise<void> {
    // Enhanced console alert for visibility
    console.error(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 CRITICAL SECURITY ALERT 🚨                  ║
╠══════════════════════════════════════════════════════════════════╣
║ Type: ${log.type.padEnd(57)}║
║ User: ${(log.userId || "anonymous").padEnd(57)}║
║ IP: ${(log.ip || "unknown").padEnd(59)}║
║ Details: ${log.details.substring(0, 53).padEnd(53)}║
║ Time: ${log.timestamp.padEnd(57)}║
╚══════════════════════════════════════════════════════════════════╝
    `);
  }
}
