/**
 * Input Sanitization Utility
 * 
 * Provides XSS protection and input validation for user-generated content.
 * 
 * Security: OWASP A03:2021 (Injection)
 * Implementation: DOMPurify + Pattern Detection
 */

import DOMPurify from 'dompurify';
import { SecurityLogger } from '@core/domain/usecases/SecurityLogger';

const securityLogger = new SecurityLogger();

/**
 * XSS attack patterns to detect suspicious input
 */
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onload\s*=/gi,
  /<iframe[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
];

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * @param input Raw user input
 * @param context Where the input came from (for logging)
 * @param maxLength Maximum allowed length (default: 4000)
 * @returns Sanitized string safe for display
 * 
 * Security:
 * - Removes all HTML tags by default
 * - Detects suspicious patterns and logs to security system
 * - Enforces maximum length to prevent DoS
 */
export function sanitizeInput(
  input: string,
  context: string = 'unknown',
  maxLength: number = 4000
): string {
  // Validate input type
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  // Check length before processing
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Detect potential XSS patterns BEFORE sanitization
  const detectedPatterns = XSS_PATTERNS.filter(pattern => pattern.test(input));
  
  if (detectedPatterns.length > 0) {
    // Log security event (non-blocking)
    void securityLogger.logXSSAttempt({
      payload: input,
      field: context,
    });
  }

  // Sanitize using DOMPurify (removes all HTML tags)
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  return sanitized.trim();
}

/**
 * Sanitizes HTML content (allows safe HTML tags)
 * 
 * @param html HTML content to sanitize
 * @param context Where the content came from (for logging)
 * @returns Sanitized HTML safe for rendering
 * 
 * Use cases:
 * - Rich text editor content
 * - Markdown-rendered HTML
 * - User-generated HTML (with restrictions)
 */
export function sanitizeHTML(
  html: string,
  context: string = 'unknown'
): string {
  // Validate input type
  if (typeof html !== 'string') {
    throw new TypeError('Input must be a string');
  }

  // Detect dangerous patterns
  const detectedPatterns = XSS_PATTERNS.filter(pattern => pattern.test(html));
  
  if (detectedPatterns.length > 0) {
    void securityLogger.logXSSAttempt({
      payload: html,
      field: context,
    });
  }

  // Sanitize allowing safe HTML tags
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });

  return sanitized;
}

/**
 * Validates email format
 * 
 * @param email Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (international)
 * 
 * @param phone Phone number to validate
 * @returns true if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  // Accepts: +1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^\+?\(?\d{1,4}\)?[-\s.]?\(?\d{1,4}\)?[-\s.]?\d{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitizes URL to prevent javascript: and data: schemes
 * 
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '';

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();

  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    void securityLogger.logXSSAttempt({
      payload: url,
      field: 'url',
    });
    return '';
  }

  // Only allow http, https, mailto, tel
  const validProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  if (!validProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    // Assume https if no protocol
    return `https://${url}`;
  }

  return url;
}
