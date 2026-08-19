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
const mockGetSupabase = jest.fn();

jest.mock('@shared/supabaseClient', () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
}));

import { getAppSettings } from '@/shared/services/settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetSupabase.mockReset();
    mockGetSupabase.mockResolvedValue({
      from: (...args: unknown[]) => mockFrom(...args),
    });
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

    it('should return default settings when getSupabase() rejects (e.g. offline chunk fetch)', async () => {
      mockGetSupabase.mockReset();
      mockGetSupabase.mockRejectedValue(new Error('chunk fetch failed'));

      const settings = await getAppSettings();

      expect(settings.n8nEnabled).toBe(false);
      expect(settings.whatsappPhone).toBe('');
    });

    it('resolves the client via getSupabase() (async chokepoint), not a static import', async () => {
      mockFrom.mockReturnValue(createChain({ data: null, error: null }));

      await getAppSettings();

      expect(mockGetSupabase).toHaveBeenCalledTimes(1);
    });
  });
});
