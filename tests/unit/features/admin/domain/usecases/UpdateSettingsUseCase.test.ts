/**
 * UpdateSettingsUseCase Tests
 *
 * Clean Architecture: Domain Layer - Use Case Testing
 */

import { UpdateSettingsUseCase } from '@/features/admin/domain/usecases/UpdateSettingsUseCase';
import { ISettingsRepository } from '@/features/admin/domain/repositories/ISettingsRepository';
import { Settings } from '@/features/admin/domain/entities/Settings';

describe('UpdateSettingsUseCase', () => {
  let useCase: UpdateSettingsUseCase;
  let mockRepository: ISettingsRepository;

  const buildSettings = (overrides: Partial<{ n8nWebhookUrl: string; n8nEnabled: boolean }> = {}) => {
    const now = new Date();
    return Settings.create({
      id: 'global',
      n8nWebhookUrl: overrides.n8nWebhookUrl ?? '',
      n8nEnabled: overrides.n8nEnabled ?? false,
      contactEmail: 'contact@example.com',
      whatsappPhone: '',
      physicalAddress: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  beforeEach(() => {
    mockRepository = {
      getSettings: jest.fn().mockResolvedValue(buildSettings()),
      updateSettings: jest.fn().mockImplementation(async () => buildSettings()),
    };
    useCase = new UpdateSettingsUseCase(mockRepository);
  });

  it('should allow enabling n8n when a valid webhook URL is provided in the same update', async () => {
    await useCase.execute({
      n8nEnabled: true,
      n8nWebhookUrl: 'https://n8n.example.com/webhook',
    });

    expect(mockRepository.updateSettings).toHaveBeenCalledWith({
      n8nEnabled: true,
      n8nWebhookUrl: 'https://n8n.example.com/webhook',
    });
  });

  it('should throw when enabling n8n with an empty webhook URL in the same update', async () => {
    await expect(
      useCase.execute({ n8nEnabled: true, n8nWebhookUrl: '' })
    ).rejects.toThrow('Para activar n8n necesitás una URL de webhook válida');

    expect(mockRepository.updateSettings).not.toHaveBeenCalled();
  });

  it('should read stored settings and throw when enabling n8n without a URL in the update and the stored URL is empty', async () => {
    mockRepository.getSettings = jest.fn().mockResolvedValue(buildSettings({ n8nWebhookUrl: '' }));

    await expect(useCase.execute({ n8nEnabled: true })).rejects.toThrow(
      'Para activar n8n necesitás una URL de webhook válida'
    );

    expect(mockRepository.getSettings).toHaveBeenCalled();
    expect(mockRepository.updateSettings).not.toHaveBeenCalled();
  });

  it('should succeed enabling n8n without a URL in the update when the stored URL is valid', async () => {
    mockRepository.getSettings = jest
      .fn()
      .mockResolvedValue(buildSettings({ n8nWebhookUrl: 'https://n8n.example.com/webhook' }));

    await useCase.execute({ n8nEnabled: true });

    expect(mockRepository.updateSettings).toHaveBeenCalledWith({ n8nEnabled: true });
  });

  it('should allow disabling n8n alone without requiring a webhook URL', async () => {
    await useCase.execute({ n8nEnabled: false });

    expect(mockRepository.updateSettings).toHaveBeenCalledWith({ n8nEnabled: false });
  });
});
