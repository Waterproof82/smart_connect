/**
 * Security Logger
 * 
 * Extends ConsoleLogger with security event tracking capabilities.
 * Logs security-critical events for monitoring and incident response.
 * 
 * Security: OWASP A09:2021 (Security Logging and Monitoring)
 */

import { ConsoleLogger } from './Logger';

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_QUERY'
  | 'DATA_ACCESS'
  | 'XSS_ATTEMPT'
  | 'INJECTION_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export class SecurityLogger extends ConsoleLogger {
  /**
   * Logs a security event
   * 
   * @param event Security event to log
   * 
   * Security considerations:
   * - All events are logged to console in development
   * - Production should integrate with Supabase security_logs table
   * - Critical events should trigger alerts (email, Slack, etc.)
   */
  logSecurityEvent(event: SecurityEvent): void {
    const securityLog = {
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(event.type),
      ...event,
    };

    // Format for console
    const formattedLog = this.formatSecurityLog(securityLog);

    // Log based on severity
    if (securityLog.severity === 'CRITICAL') {
      console.error('🔒 SECURITY ALERT:', formattedLog);
    } else if (securityLog.severity === 'WARNING') {
      console.warn('🔒 SECURITY WARNING:', formattedLog);
    } else {
      console.info('🔒 SECURITY EVENT:', formattedLog);
    }

    // TODO: In production, send to Supabase security_logs table
    // await this.sendToDatabase(securityLog);

    // TODO: For CRITICAL events, send alert
    // if (securityLog.severity === 'CRITICAL') {
    //   await this.sendAlert(securityLog);
    // }
  }

  /**
   * Logs an authentication failure
   */
  logAuthFailure(details: {
    userId?: string;
    ip?: string;
    reason: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.logSecurityEvent({
      type: 'AUTH_FAILURE',
      userId: details.userId,
      ip: details.ip,
      details: `Authentication failed: ${details.reason}`,
      metadata: details.metadata,
    });
  }

  /**
   * Logs an authentication success
   */
  logAuthSuccess(details: {
    userId: string;
    ip?: string;
    method?: string;
  }): void {
    const methodInfo = details.method ? ` via ${details.method}` : '';
    this.logSecurityEvent({
      type: 'AUTH_SUCCESS',
      userId: details.userId,
      ip: details.ip,
      details: `User authenticated successfully${methodInfo}`,
    });
  }

  /**
   * Logs a rate limit violation
   */
  logRateLimitExceeded(details: {
    userId?: string;
    ip?: string;
    endpoint: string;
    limit: number;
  }): void {
    this.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      userId: details.userId,
      ip: details.ip,
      details: `Rate limit exceeded on ${details.endpoint} (limit: ${details.limit} req/min)`,
      metadata: { endpoint: details.endpoint, limit: details.limit },
    });
  }

  /**
   * Logs an XSS injection attempt
   */
  logXSSAttempt(details: {
    userId?: string;
    ip?: string;
    payload: string;
    field: string;
  }): void {
    this.logSecurityEvent({
      type: 'XSS_ATTEMPT',
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
  logSuspiciousQuery(details: {
    userId?: string;
    ip?: string;
    query: string;
    reason: string;
  }): void {
    this.logSecurityEvent({
      type: 'SUSPICIOUS_QUERY',
      userId: details.userId,
      ip: details.ip,
      details: `Suspicious query detected: ${details.reason}`,
      metadata: { queryLength: details.query.length },
    });
  }

  /**
   * Logs unauthorized access attempt
   */
  logUnauthorizedAccess(details: {
    userId?: string;
    ip?: string;
    resource: string;
    action: string;
  }): void {
    this.logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS',
      userId: details.userId,
      ip: details.ip,
      details: `Unauthorized access attempt: ${details.action} on ${details.resource}`,
      metadata: { resource: details.resource, action: details.action },
    });
  }

  /**
   * Determines severity based on event type
   */
  private getSeverity(type: SecurityEventType): 'INFO' | 'WARNING' | 'CRITICAL' {
    switch (type) {
      case 'AUTH_SUCCESS':
      case 'DATA_ACCESS':
        return 'INFO';
      
      case 'AUTH_FAILURE':
      case 'RATE_LIMIT_EXCEEDED':
      case 'SUSPICIOUS_QUERY':
        return 'WARNING';
      
      case 'XSS_ATTEMPT':
      case 'INJECTION_ATTEMPT':
      case 'UNAUTHORIZED_ACCESS':
        return 'CRITICAL';
      
      default:
        return 'WARNING';
    }
  }

  /**
   * Formats security log for console output
   */
  private formatSecurityLog(log: any): string {
    return JSON.stringify(
      {
        timestamp: log.timestamp,
        type: log.type,
        userId: log.userId || 'anonymous',
        ip: log.ip || 'unknown',
        details: log.details,
        metadata: log.metadata,
      },
      null,
      2
    );
  }

  /**
   * TODO: Send security event to Supabase database
   * 
   * Implementation:
   * ```typescript
   * private async sendToDatabase(event: SecurityEvent): Promise<void> {
   *   const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
   *   await supabase.from('security_logs').insert({
   *     event_type: event.type,
   *     user_id: event.userId,
   *     ip_address: event.ip,
   *     details: event.details,
   *     metadata: event.metadata,
   *     severity: this.getSeverity(event.type),
   *   });
   * }
   * ```
   */

  /**
   * TODO: Send alert for critical events
   * 
   * Implementation:
   * ```typescript
   * private async sendAlert(event: SecurityEvent): Promise<void> {
   *   // Email alert
   *   await sendEmail({
   *     to: 'security@smartconnect.ai',
   *     subject: `SECURITY ALERT: ${event.type}`,
   *     body: this.formatSecurityLog(event),
   *   });
   *   
   *   // Slack/Teams notification
   *   await sendSlackNotification({
   *     channel: '#security-alerts',
   *     message: `🚨 CRITICAL: ${event.details}`,
   *   });
   * }
   * ```
   */
}
