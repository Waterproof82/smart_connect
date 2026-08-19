/**
 * SupabaseSettingsRepository Tests
 *
 * Clean Architecture: Data Layer Tests
 */

interface ChainMock {
  select: jest.Mock;
  eq: jest.Mock;
  update: jest.Mock;
  single: jest.Mock;
}

function createChain(result: { data: Record<string, unknown> | null; error: { code?: string; message?: string } | null }): ChainMock {
  const chain = {} as ChainMock;
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.single = jest.fn(() => Promise.resolve(result));
  return chain;
}

const mockFrom = jest.fn();

jest.mock('@shared/supabaseClientSync', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { SupabaseSettingsRepository } from '@/features/admin/data/repositories/SupabaseSettingsRepository';

describe('SupabaseSettingsRepository', () => {
  let repository: SupabaseSettingsRepository;

  beforeEach(() => {
    mockFrom.mockReset();
    repository = new SupabaseSettingsRepository();
  });

  describe('getSettings', () => {
    it('should map n8n_enabled=true from the row to n8nEnabled', async () => {
      const chain = createChain({
        data: {
          id: 'global',
          n8n_webhook_url: 'https://n8n.example.com/webhook',
          n8n_enabled: true,
          contact_email: 'contact@example.com',
          whatsapp_phone: '',
          physical_address: '',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const settings = await repository.getSettings();

      expect(settings.n8nEnabled).toBe(true);
    });

    it('should default n8nEnabled to false when the row value is null', async () => {
      const chain = createChain({
        data: {
          id: 'global',
          n8n_webhook_url: '',
          n8n_enabled: null,
          contact_email: '',
          whatsapp_phone: '',
          physical_address: '',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const settings = await repository.getSettings();

      expect(settings.n8nEnabled).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('should include n8n_enabled as a boolean in the update payload', async () => {
      const chain = createChain({
        data: {
          id: 'global',
          n8n_webhook_url: 'https://n8n.example.com/webhook',
          n8n_enabled: true,
          contact_email: '',
          whatsapp_phone: '',
          physical_address: '',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      await repository.updateSettings({ n8nEnabled: true });

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ n8n_enabled: true })
      );
    });
  });
});
