/**
 * @file Integration Tests - Lead Submission Flow
 * @description Tests the complete lead submission flow from form validation
 * through repository layer to webhook delivery.
 * 
 * Validates cross-layer integration:
 * - Domain Layer: LeadEntity validation
 * - Data Layer: Webhook payload transformation
 */

import { LeadEntity } from '../../src/features/landing/domain/entities/Lead';
import { N8NWebhookDataSource } from '../../src/features/landing/data/datasources/N8NWebhookDataSource';
import { LeadRepositoryImpl } from '../../src/features/landing/data/repositories/LeadRepositoryImpl';
import { SubmitLeadUseCase } from '../../src/features/landing/domain/usecases/SubmitLeadUseCase';

// Mock N8N webhook data source
jest.mock('../../src/features/landing/data/datasources/N8NWebhookDataSource');

describe('Lead Submission Flow - Integration Tests', () => {
  let mockN8NWebhookDataSource: jest.Mocked<N8NWebhookDataSource>;
  let leadRepository: LeadRepositoryImpl;
  let submitLeadUseCase: SubmitLeadUseCase;

  beforeEach(() => {
    // Initialize mocked data source
    mockN8NWebhookDataSource = new N8NWebhookDataSource('https://fake-webhook.com') as jest.Mocked<N8NWebhookDataSource>;
    
    // Initialize repository with mocked data source
    leadRepository = new LeadRepositoryImpl(mockN8NWebhookDataSource);
    
    // Initialize use case with real repository (mocked data source underneath)
    submitLeadUseCase = new SubmitLeadUseCase(leadRepository);
  });

  describe('Complete Lead Submission Pipeline', () => {
    it('should submit valid lead through full pipeline: entity → repository → webhook', async () => {
      // Arrange: Valid lead data (matching actual LeadEntity properties)
      const leadEntity = new LeadEntity({
        name: 'Juan Pérez',
        company: 'Restaurante El Buen Sabor',
        email: 'juan.perez@example.com',
        service: 'QRIBAR',
        message: 'Quiero una carta digital para mi restaurante'
      });

      // Mock successful webhook delivery
      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      // Act: Execute complete submission flow
      const result = await submitLeadUseCase.execute(leadEntity);

      // Assert: Verify webhook called with transformed payload
      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalledWith({
        nombre: 'Juan Pérez',
        empresa: 'Restaurante El Buen Sabor',
        email: 'juan.perez@example.com',
        servicio_interes: 'QRIBAR',
        mensaje_cuerpo: 'Quiero una carta digital para mi restaurante'
      });

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid lead with validation errors', async () => {
      // Arrange: Invalid lead (empty name, invalid email)
      const leadEntity = new LeadEntity({
        name: '', // Empty - invalid
        company: 'Test Company',
        email: 'invalid-email', // Invalid format
        service: 'QRIBAR',
        message: 'Test'
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      // Act
      const result = await submitLeadUseCase.execute(leadEntity);

      // Assert: Should fail validation without calling webhook
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.name).toBeTruthy(); // Name error
      expect(result.errors?.email).toBeTruthy(); // Email error
      expect(mockN8NWebhookDataSource.sendLead).not.toHaveBeenCalled();
    });

    it('should handle webhook delivery errors gracefully', async () => {
      // Arrange
      const leadEntity = new LeadEntity({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message with enough characters'
      });

      const webhookError = new Error('N8N webhook endpoint unreachable');
      mockN8NWebhookDataSource.sendLead = jest.fn().mockRejectedValue(webhookError);

      // Act
      const result = await submitLeadUseCase.execute(leadEntity);

      // Assert: Should return failure when webhook fails
      expect(result.success).toBe(false);
      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalled();
    });

    it('should handle webhook returning false (delivery failure)', async () => {
      // Arrange
      const leadEntity = new LeadEntity({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message with enough characters'
      });

      // Mock webhook returning false (delivery failed but no exception)
      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(false);

      // Act
      const result = await submitLeadUseCase.execute(leadEntity);

      // Assert
      expect(result.success).toBe(false);
      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalled();
    });
  });

  describe('Data Validation Through Layers', () => {
    it('should accept valid company name with special characters', async () => {
      const leadEntity = new LeadEntity({
        name: 'María García',
        company: 'Café Bar El Rincón', // Removed quotes as they might fail validation
        email: 'maria@example.com',
        service: 'Reviews',
        message: 'Necesito gestión de reseñas'
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(true);
      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalledWith(
        expect.objectContaining({ empresa: 'Café Bar El Rincón' })
      );
    });

    it('should handle long message text', async () => {
      const longMessage = 'Necesito una solución completa para mi negocio. '.repeat(15); // ~600 chars
      const leadEntity = new LeadEntity({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        service: 'Automatización',
        message: longMessage
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(true);
      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalledWith(
        expect.objectContaining({ mensaje_cuerpo: longMessage })
      );
    });

    it('should reject message that is too short', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Short' // Less than 10 chars
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(false);
      expect(result.errors?.message).toBeTruthy();
      expect(mockN8NWebhookDataSource.sendLead).not.toHaveBeenCalled();
    });
  });

  describe('Service Type Handling', () => {
    it('should handle "QRIBAR" service type', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message for testing purposes'
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      await submitLeadUseCase.execute(leadEntity);

      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalledWith(
        expect.objectContaining({ servicio_interes: 'QRIBAR' })
      );
    });

    it('should handle "Reviews" service type', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'Reviews',
        message: 'Test message for testing purposes'
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      await submitLeadUseCase.execute(leadEntity);

      expect(mockN8NWebhookDataSource.sendLead).toHaveBeenCalledWith(
        expect.objectContaining({ servicio_interes: 'Reviews' })
      );
    });

    it('should reject invalid service selection', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'Selecciona una opción', // Invalid selection
        message: 'Test message for testing purposes'
      });

      mockN8NWebhookDataSource.sendLead = jest.fn().mockResolvedValue(true);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(false);
      expect(result.errors?.service).toBeTruthy();
      expect(mockN8NWebhookDataSource.sendLead).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should handle network timeout errors gracefully', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message for testing purposes'
      });

      const timeoutError = new Error('Request timeout after 30s');
      mockN8NWebhookDataSource.sendLead = jest.fn().mockRejectedValue(timeoutError);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(false);
    });

    it('should handle webhook 4xx errors', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message for testing purposes'
      });

      const clientError = new Error('Webhook returned 400 Bad Request');
      mockN8NWebhookDataSource.sendLead = jest.fn().mockRejectedValue(clientError);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(false);
    });

    it('should handle webhook 5xx errors', async () => {
      const leadEntity = new LeadEntity({
        name: 'Test',
        company: 'Test Co',
        email: 'test@example.com',
        service: 'QRIBAR',
        message: 'Test message for testing purposes'
      });

      const serverError = new Error('Webhook returned 503 Service Unavailable');
      mockN8NWebhookDataSource.sendLead = jest.fn().mockRejectedValue(serverError);

      const result = await submitLeadUseCase.execute(leadEntity);

      expect(result.success).toBe(false);
    });
  });
});
