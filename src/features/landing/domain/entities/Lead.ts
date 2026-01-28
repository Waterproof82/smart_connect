/**
 * Lead Entity
 * 
 * Represents a business lead from the contact form.
 * Pure domain entity with validation rules.
 */

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
   */
  validateMessage(): string {
    if (!this.message.trim()) return 'El mensaje es requerido';
    if (this.message.length < 10) return 'Mínimo 10 caracteres';
    if (this.message.length > 1000) return 'Máximo 1000 caracteres';
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
   */
  toWebhookPayload(): Record<string, string> {
    return {
      nombre: this.name,
      empresa: this.company,
      email: this.email,
      servicio_interes: this.service,
      mensaje_cuerpo: this.message,
    };
  }
}
