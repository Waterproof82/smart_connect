/**
 * settingsService Tests
 *
 * Shared service tests for landing page settings retrieval.
 */

interface ChainMock {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
}

function createChain(result: { data: Record<string, unknown> | null; error: { message?: string } | null }): ChainMock {
  const chain = {} as ChainMock;
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.single = jest.fn(() => Promise.resolve(result));
  return chain;
}

const mockFrom = jest.fn();

jest.mock('@shared/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { getAppSettings } from '@/shared/services/settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  describe('getAppSettings', () => {
    it('should map n8n_enabled=true from the row to n8nEnabled', async () => {
      mockFrom.mockReturnValue(
        createChain({
          data: {
            n8n_webhook_url: 'https://n8n.example.com/webhook',
            n8n_enabled: true,
            contact_email: 'contact@example.com',
            whatsapp_phone: '',
            physical_address: '',
          },
          error: null,
        })
      );

      const settings = await getAppSettings();

      expect(settings.n8nEnabled).toBe(true);
    });

    it('should default n8nEnabled to false when the query returns an error', async () => {
      mockFrom.mockReturnValue(createChain({ data: null, error: { message: 'boom' } }));

      const settings = await getAppSettings();

      expect(settings.n8nEnabled).toBe(false);
    });

    it('should default n8nEnabled to false when data is missing', async () => {
      mockFrom.mockReturnValue(createChain({ data: null, error: null }));

      const settings = await getAppSettings();

      expect(settings.n8nEnabled).toBe(false);
    });
  });
});
