/**
 * Unit Tests for LeadRepositoryImpl
 * Tests lead repository with mocked N8NWebhookDataSource
 */

import { LeadRepositoryImpl } from '@features/landing/data/repositories';
import { LeadEntity } from '@features/landing/domain/entities/Lead';
import type { N8NWebhookDataSource } from '@features/landing/data/datasources';

describe('LeadRepositoryImpl', () => {
  let mockWebhookDataSource: jest.Mocked<N8NWebhookDataSource>;
  let repository: LeadRepositoryImpl;

  const validLeadData = {
    name: 'Juan Pérez',
    company: 'Tech Solutions',
    email: 'juan@techsolutions.com',
    service: 'qribar',
    message: 'Necesito información sobre el producto',
  };

  beforeEach(() => {
    mockWebhookDataSource = {
      sendLead: jest.fn(),
    } as any;

    repository = new LeadRepositoryImpl(mockWebhookDataSource);
  });

  describe('submitLead', () => {
    it('should call data source with lead payload', async () => {
      const lead = new LeadEntity(validLeadData);
      const expectedPayload = lead.toWebhookPayload();

      mockWebhookDataSource.sendLead.mockResolvedValue(true);

      await repository.submitLead(lead);

      expect(mockWebhookDataSource.sendLead).toHaveBeenCalledWith(expectedPayload);
    });

    it('should return true when submission succeeds', async () => {
      const lead = new LeadEntity(validLeadData);

      mockWebhookDataSource.sendLead.mockResolvedValue(true);

      const result = await repository.submitLead(lead);

      expect(result).toBe(true);
    });

    it('should return false when submission fails', async () => {
      const lead = new LeadEntity(validLeadData);

      mockWebhookDataSource.sendLead.mockResolvedValue(false);

      const result = await repository.submitLead(lead);

      expect(result).toBe(false);
    });

    it('should convert LeadEntity to webhook format', async () => {
      const lead = new LeadEntity(validLeadData);

      mockWebhookDataSource.sendLead.mockResolvedValue(true);

      await repository.submitLead(lead);

      const callArgs = mockWebhookDataSource.sendLead.mock.calls[0][0];

      expect(callArgs).toHaveProperty('nombre', validLeadData.name);
      expect(callArgs).toHaveProperty('empresa', validLeadData.company);
      expect(callArgs).toHaveProperty('email', validLeadData.email);
      expect(callArgs).toHaveProperty('servicio_interes', validLeadData.service);
      expect(callArgs).toHaveProperty('mensaje_cuerpo', validLeadData.message);
    });

    it('should propagate errors from data source', async () => {
      const lead = new LeadEntity(validLeadData);

      mockWebhookDataSource.sendLead.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(repository.submitLead(lead)).rejects.toThrow('Network timeout');
    });

    it('should handle all service types', async () => {
      const services = ['qribar', 'nfc-reviews', 'automation', 'custom'];

      mockWebhookDataSource.sendLead.mockResolvedValue(true);

      for (const service of services) {
        const lead = new LeadEntity({ ...validLeadData, service });
        await repository.submitLead(lead);
      }

      expect(mockWebhookDataSource.sendLead).toHaveBeenCalledTimes(4);
    });

    it('should accept plain Lead object', async () => {
      mockWebhookDataSource.sendLead.mockResolvedValue(true);

      const result = await repository.submitLead(validLeadData);

      expect(result).toBe(true);
      expect(mockWebhookDataSource.sendLead).toHaveBeenCalled();
    });
  });
});
