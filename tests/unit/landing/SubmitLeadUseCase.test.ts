/**
 * Unit Tests for SubmitLeadUseCase
 * Tests lead submission orchestration with mocked repository
 */

import { SubmitLeadUseCase } from '@features/landing/domain/usecases';
import type { ILeadRepository } from '@features/landing/domain/repositories';
import { LeadEntity } from '@features/landing/domain/entities/Lead';

describe('SubmitLeadUseCase', () => {
  let mockLeadRepository: jest.Mocked<ILeadRepository>;
  let useCase: SubmitLeadUseCase;

  const validLeadData = {
    name: 'Juan Pérez',
    company: 'Tech Solutions',
    email: 'juan@techsolutions.com',
    service: 'qribar',
    message: 'Necesito información sobre el producto',
  };

  beforeEach(() => {
    mockLeadRepository = {
      submitLead: jest.fn(),
    };

    useCase = new SubmitLeadUseCase(mockLeadRepository);
  });

  describe('execute', () => {
    it('should validate and submit valid lead', async () => {
      const validLead = new LeadEntity(validLeadData);

      mockLeadRepository.submitLead.mockResolvedValue(true);

      const result = await useCase.execute(validLead);

      expect(result.success).toBe(true);
      expect(mockLeadRepository.submitLead).toHaveBeenCalledWith(validLead);
    });

    it('should return errors for invalid lead without calling repository', async () => {
      const invalidLead = new LeadEntity({
        ...validLeadData,
        email: 'invalid-email',
      });

      const result = await useCase.execute(invalidLead);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).not.toBe('');
      expect(mockLeadRepository.submitLead).not.toHaveBeenCalled();
    });

    it('should return all validation errors for completely invalid lead', async () => {
      const invalidLead = new LeadEntity({
        name: '',
        company: '',
        email: 'invalid',
        service: '',
        message: 'Short',
      });

      const result = await useCase.execute(invalidLead);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.name).not.toBe('');
      expect(result.errors?.company).not.toBe('');
      expect(result.errors?.email).not.toBe('');
      expect(result.errors?.service).not.toBe('');
      expect(result.errors?.message).not.toBe('');
      expect(mockLeadRepository.submitLead).not.toHaveBeenCalled();
    });

    it('should return success when repository succeeds', async () => {
      const lead = new LeadEntity(validLeadData);

      mockLeadRepository.submitLead.mockResolvedValue(true);

      const result = await useCase.execute(lead);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should handle repository errors gracefully', async () => {
      const lead = new LeadEntity(validLeadData);

      mockLeadRepository.submitLead.mockRejectedValue(
        new Error('Network error')
      );

      const result = await useCase.execute(lead);

      expect(result.success).toBe(false);
    });

    it('should validate all service types', async () => {
      const lead = new LeadEntity({ ...validLeadData, service: 'qribar' });

      mockLeadRepository.submitLead.mockResolvedValue(true);

      await useCase.execute(lead);

      expect(mockLeadRepository.submitLead).toHaveBeenCalledWith(lead);
    });

    it('should accept plain Lead object and convert to LeadEntity', async () => {
      mockLeadRepository.submitLead.mockResolvedValue(true);

      const result = await useCase.execute(validLeadData);

      expect(result.success).toBe(true);
      expect(mockLeadRepository.submitLead).toHaveBeenCalled();
    });
  });
});
