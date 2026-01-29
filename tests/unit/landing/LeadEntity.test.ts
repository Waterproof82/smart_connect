/**
 * Unit Tests for LeadEntity
 * Tests lead validation and business logic
 */

import { LeadEntity } from '@features/landing/domain/entities/Lead';

describe('LeadEntity', () => {
  const validLeadData = {
    name: 'Juan Pérez',
    company: 'Tech Solutions SA',
    email: 'juan@techsolutions.com',
    service: 'qribar',
    message: 'Necesito una carta digital para mi restaurante',
  };

  describe('constructor', () => {
    it('should create lead with all fields', () => {
      const lead = new LeadEntity(validLeadData);

      expect(lead.name).toBe(validLeadData.name);
      expect(lead.company).toBe(validLeadData.company);
      expect(lead.email).toBe(validLeadData.email);
      expect(lead.service).toBe(validLeadData.service);
      expect(lead.message).toBe(validLeadData.message);
    });
  });

  describe('validateName', () => {
    it('should return empty string for valid name', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.validateName()).toBe('');
    });

    it('should reject empty name', () => {
      const lead = new LeadEntity({ ...validLeadData, name: '' });
      expect(lead.validateName()).toBe('El nombre es requerido');
    });

    it('should reject whitespace-only name', () => {
      const lead = new LeadEntity({ ...validLeadData, name: '   ' });
      expect(lead.validateName()).toBe('El nombre es requerido');
    });

    it('should reject name with invalid characters', () => {
      const lead = new LeadEntity({ ...validLeadData, name: 'J123' });
      expect(lead.validateName()).toBe('Solo letras y espacios (2-50 caracteres)');
    });

    it('should accept name with accents', () => {
      const lead = new LeadEntity({ ...validLeadData, name: 'José García' });
      expect(lead.validateName()).toBe('');
    });
  });

  describe('validateCompany', () => {
    it('should return empty string for valid company', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.validateCompany()).toBe('');
    });

    it('should reject empty company', () => {
      const lead = new LeadEntity({ ...validLeadData, company: '' });
      expect(lead.validateCompany()).toBe('La empresa es requerida');
    });

    it('should accept company with numbers', () => {
      const lead = new LeadEntity({ ...validLeadData, company: 'Tech 2024 S.A.' });
      expect(lead.validateCompany()).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should return empty string for valid email', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.validateEmail()).toBe('');
    });

    it('should reject empty email', () => {
      const lead = new LeadEntity({ ...validLeadData, email: '' });
      expect(lead.validateEmail()).toBe('El email es requerido');
    });

    it('should reject invalid email format', () => {
      const lead = new LeadEntity({ ...validLeadData, email: 'invalid-email' });
      expect(lead.validateEmail()).toBe('Formato de email inválido (ejemplo@dominio.com)');
    });

    it('should accept email with subdomain', () => {
      const lead = new LeadEntity({ ...validLeadData, email: 'user@mail.example.com' });
      expect(lead.validateEmail()).toBe('');
    });
  });

  describe('validateService', () => {
    it('should return empty string for valid service', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.validateService()).toBe('');
    });

    it('should reject empty service', () => {
      const lead = new LeadEntity({ ...validLeadData, service: '' });
      expect(lead.validateService()).toBe('Debes seleccionar un servicio');
    });

    it('should reject placeholder service', () => {
      const lead = new LeadEntity({ ...validLeadData, service: 'Selecciona una opción' });
      expect(lead.validateService()).toBe('Debes seleccionar un servicio');
    });
  });

  describe('validateMessage', () => {
    it('should return empty string for valid message', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.validateMessage()).toBe('');
    });

    it('should reject empty message', () => {
      const lead = new LeadEntity({ ...validLeadData, message: '' });
      expect(lead.validateMessage()).toBe('El mensaje es requerido');
    });

    it('should reject message shorter than 10 characters', () => {
      const lead = new LeadEntity({ ...validLeadData, message: 'Hola' });
      expect(lead.validateMessage()).toBe('Mínimo 10 caracteres');
    });

    it('should accept message with exactly 10 characters', () => {
      const lead = new LeadEntity({ ...validLeadData, message: '1234567890' });
      expect(lead.validateMessage()).toBe('');
    });

    it('should reject message longer than 1000 characters', () => {
      const lead = new LeadEntity({ ...validLeadData, message: 'A'.repeat(1001) });
      expect(lead.validateMessage()).toBe('Máximo 1000 caracteres');
    });

    // ===================================
    // SECURITY TESTS: OWASP A03:2021 (Injection)
    // ===================================

    it('should reject script tag injection', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '<script>alert("XSS")</script>This is a malicious message' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject iframe injection', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '<iframe src="https://evil.com"></iframe>Legit message here' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject javascript: protocol', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: 'Click here: javascript:alert("XSS") for more info' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject onclick event handler', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '<div onclick="alert(\'XSS\')">Click me</div>' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject img onerror injection', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '<img src=x onerror="alert(\'XSS\')">' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject svg onload injection', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '<svg onload="alert(\'XSS\')"></svg>' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should reject data:text/html injection', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: 'Check this: data:text/html,<script>alert("XSS")</script>' 
      });
      expect(lead.validateMessage()).toBe('El mensaje contiene caracteres o código no permitido');
    });

    it('should accept message with safe HTML entities (sanitized)', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: 'I love <3 your service! It\'s >100% awesome!' 
      });
      // DOMPurify will sanitize but keep text content
      expect(lead.validateMessage()).toBe('');
    });

    it('should accept message with emojis and special characters', () => {
      const lead = new LeadEntity({ 
        ...validLeadData, 
        message: '¡Hola! Me interesa QRIBAR para mi restaurante 🍔🍕 (contacto urgente)' 
      });
      expect(lead.validateMessage()).toBe('');
    });
  });

  describe('validate', () => {
    it('should return object with all empty strings for valid lead', () => {
      const lead = new LeadEntity(validLeadData);
      const errors = lead.validate();

      expect(errors.name).toBe('');
      expect(errors.company).toBe('');
      expect(errors.email).toBe('');
      expect(errors.service).toBe('');
      expect(errors.message).toBe('');
    });

    it('should return object with validation errors', () => {
      const invalidLead = new LeadEntity({
        name: '',
        company: '',
        email: 'invalid',
        service: '',
        message: 'Short',
      });

      const errors = invalidLead.validate();

      expect(errors.name).not.toBe('');
      expect(errors.company).not.toBe('');
      expect(errors.email).not.toBe('');
      expect(errors.service).not.toBe('');
      expect(errors.message).not.toBe('');
    });
  });

  describe('isValid', () => {
    it('should return true for valid lead', () => {
      const lead = new LeadEntity(validLeadData);
      expect(lead.isValid()).toBe(true);
    });

    it('should return false for invalid lead', () => {
      const lead = new LeadEntity({ ...validLeadData, email: 'invalid' });
      expect(lead.isValid()).toBe(false);
    });
  });

  describe('toWebhookPayload', () => {
    it('should convert lead to webhook payload format', () => {
      const lead = new LeadEntity(validLeadData);
      const payload = lead.toWebhookPayload();

      expect(payload.nombre).toBe(validLeadData.name);
      expect(payload.empresa).toBe(validLeadData.company);
      expect(payload.email).toBe(validLeadData.email);
      expect(payload.servicio_interes).toBe(validLeadData.service);
      expect(payload.mensaje_cuerpo).toBe(validLeadData.message);
    });

    it('should sanitize message in webhook payload', () => {
      const lead = new LeadEntity({
        ...validLeadData,
        message: 'Normal text <b>bold</b> and <script>alert("XSS")</script> more text',
      });
      
      const payload = lead.toWebhookPayload();
      
      // DOMPurify should strip all HTML tags but keep text content
      expect(payload.mensaje_cuerpo).not.toContain('<script>');
      expect(payload.mensaje_cuerpo).not.toContain('<b>');
      expect(payload.mensaje_cuerpo).toContain('Normal text');
      expect(payload.mensaje_cuerpo).toContain('more text');
    });
  });
});
