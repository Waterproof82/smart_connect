/**
 * Lead Entity
 * 
 * Represents a business lead from the contact form.
 * Pure domain entity with validation rules.
 * 
 * Security: Implements OWASP A03:2021 (Injection) mitigations
 */

import DOMPurify from 'dompurify';

export interface Lead {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;
}

export class LeadEntity implements Lead {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;

  constructor(params: {
    name: string;
    company: string;
    email: string;
    service: string;
    message: string;
  }) {
    this.name = params.name;
    this.company = params.company;
    this.email = params.email;
    this.service = params.service;
    this.message = params.message;
  }

  /**
   * Validates the name field
   */
  validateName(): string {
    if (!this.name.trim()) return 'El nombre es requerido';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(this.name)) {
      return 'Solo letras y espacios (2-50 caracteres)';
    }
    return '';
  }

  /**
   * Validates the company field
   */
  validateCompany(): string {
    if (!this.company.trim()) return 'La empresa es requerida';
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s&'.,\u002D]{2,100}$/.test(this.company)) {
      return 'Nombre de empresa válido (2-100 caracteres)';
    }
    return '';
  }

  /**
   * Validates the email field
   */
  validateEmail(): string {
    if (!this.email.trim()) return 'El email es requerido';
    if (!/^[a-zA-Z0-9._%+\u002D]+@[a-zA-Z0-9.\u002D]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      return 'Formato de email inválido (ejemplo@dominio.com)';
    }
    return '';
  }

  /**
   * Validates the service field
   */
  validateService(): string {
    if (this.service === 'Selecciona una opción' || !this.service) {
      return 'Debes seleccionar un servicio';
    }
    return '';
  }

  /**
   * Validates the message field
   * 
   * Security: OWASP A03:2021 (Injection Prevention)
   * - Sanitizes HTML/JavaScript injection attempts
   * - Detects common XSS patterns
   * - Uses DOMPurify for robust sanitization
   */
  validateMessage(): string {
    if (!this.message.trim()) return 'El mensaje es requerido';
    
    // Check dangerous patterns BEFORE length validation
    const dangerousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onerror, etc.
      /<img[\s\S]*?onerror[\s\S]*?>/gi,
      /<svg[\s\S]*?onload[\s\S]*?>/gi,
      /data:text\/html/gi,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(this.message)) {
        // XSS attempt detected - return validation error
        // TODO: Add security logging when circular dependency is resolved
        return 'El mensaje contiene caracteres o código no permitido';
      }
    }
    
    // Sanitize HTML (removes all tags and scripts)
    const sanitized = DOMPurify.sanitize(this.message, { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true, // Keep text content
    });
    
    // Validate length on sanitized content
    if (sanitized.length < 10) return 'Mínimo 10 caracteres';
    if (sanitized.length > 1000) return 'Máximo 1000 caracteres';
    
    return '';
  }

  /**
   * Validates all fields and returns errors
   */
  validate(): Record<keyof Lead, string> {
    return {
      name: this.validateName(),
      company: this.validateCompany(),
      email: this.validateEmail(),
      service: this.validateService(),
      message: this.validateMessage(),
    };
  }

  /**
   * Checks if the lead is valid (no validation errors)
   */
  isValid(): boolean {
    const errors = this.validate();
    return Object.values(errors).every(error => error === '');
  }

  /**
   * Converts to webhook payload format
   * 
   * Security: All fields are already validated and sanitized
   */
  toWebhookPayload(): Record<string, string> {
    // Sanitize message one more time before sending
    const sanitizedMessage = DOMPurify.sanitize(this.message, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
    
    return {
      nombre: this.name,
      empresa: this.company,
      email: this.email,
      servicio_interes: this.service,
      mensaje_cuerpo: sanitizedMessage,
    };
  }
}
