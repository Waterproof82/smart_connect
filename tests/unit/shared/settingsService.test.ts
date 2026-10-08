/**
 * settingsService Tests
 *
 * Shared service tests for landing page settings retrieval.
 *
 * S5 (SDD `landing-main-thread-tbt`): `getAppSettings()` no longer resolves
 * the Supabase SDK client (`getSupabase()`/`@shared/supabaseClient`) — it
 * issues a plain PostgREST `fetch` with the anon key, so `vendor-supabase`
 * is never requested on public pages just to read a settings row. Mocks
 * `global.fetch` directly instead of the Supabase client.
 */

const mockEnv = { url: 'https://test.supabase.co', key: 'test-anon-key' };

jest.mock('@shared/config/env.config', () => ({
  ENV: {
    get SUPABASE_URL() {
      return mockEnv.url;
    },
    get SUPABASE_ANON_KEY() {
      return mockEnv.key;
    },
  },
}));

const mockFetch = jest.fn();

import {
  getAppSettings,
  resetAppSettingsCache,
} from '@/shared/services/settingsService';

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockEnv.url = 'https://test.supabase.co';
  mockEnv.key = 'test-anon-key';
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  resetAppSettingsCache();
});

describe('settingsService', () => {
  describe('getAppSettings', () => {
    it('requests the app_settings row via a plain PostgREST fetch with an explicit column list (anon no longer has table-level SELECT — sdd/notify-lead-antibot)', async () => {
      mockFetch.mockResolvedValue(jsonResponse([]));

      await getAppSettings();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe(
        'https://test.supabase.co/rest/v1/app_settings?id=eq.global&select=id,contact_email,whatsapp_phone,physical_address',
      );
      expect(init.headers).toMatchObject({
        apikey: 'test-anon-key',
        Authorization: 'Bearer test-anon-key',
      });
    });

    it('NEVER uses a wildcard select — anon only has column-level grants post-migration (regression guard)', async () => {
      mockFetch.mockResolvedValue(jsonResponse([]));

      await getAppSettings();

      const [url] = mockFetch.mock.calls[0];
      expect(url).not.toContain('select=*');
    });

    it('maps the snake_case row to the public AppSettings camelCase shape (n8n fields are no longer part of the client contract)', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse([
          {
            contact_email: 'contact@example.com',
            whatsapp_phone: '+34600000000',
            physical_address: 'Tacoronte',
          },
        ]),
      );

      const settings = await getAppSettings();

      expect(settings).toEqual({
        contactEmail: 'contact@example.com',
        whatsappPhone: '+34600000000',
        physicalAddress: 'Tacoronte',
      });
    });

    it('falls back to default settings on a network error', async () => {
      mockFetch.mockRejectedValue(new Error('offline'));

      const settings = await getAppSettings();

      expect(settings).toEqual({
        contactEmail: '',
        whatsappPhone: '',
        physicalAddress: '',
      });
    });

    it('falls back to default settings on a non-OK response', async () => {
      mockFetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));

      const settings = await getAppSettings();

      expect(settings.whatsappPhone).toBe('');
    });

    it('falls back to default settings when the row is missing (empty array)', async () => {
      mockFetch.mockResolvedValue(jsonResponse([]));

      const settings = await getAppSettings();

      expect(settings.contactEmail).toBe('');
    });

    it('falls back to default settings when env vars are missing, without calling fetch', async () => {
      mockEnv.url = '';
      mockEnv.key = '';

      const settings = await getAppSettings();

      expect(settings.contactEmail).toBe('');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getAppSettings caching (shared across useWhatsappPhone + Contact)', () => {
    it('dedupes two concurrent calls into exactly one fetch', async () => {
      let resolveFetch: (value: unknown) => void = () => {};
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const p1 = getAppSettings();
      const p2 = getAppSettings();
      await Promise.resolve();
      resolveFetch(jsonResponse([{ whatsapp_phone: '+34600000000' }]));

      const [a, b] = await Promise.all([p1, p2]);

      expect(a).toEqual(b);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not poison the cache on failure — the next call retries (fetch called again)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('offline'));
      mockFetch.mockResolvedValueOnce(
        jsonResponse([{ whatsapp_phone: '+34611111111' }]),
      );

      const first = await getAppSettings();
      const second = await getAppSettings();

      expect(first.whatsappPhone).toBe('');
      expect(second.whatsappPhone).toBe('+34611111111');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('memoizes the value obtained after a retry — a third call makes no further fetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('offline'));
      mockFetch.mockResolvedValueOnce(
        jsonResponse([{ whatsapp_phone: '+34611111111' }]),
      );

      await getAppSettings();
      await getAppSettings();
      const third = await getAppSettings();

      expect(third.whatsappPhone).toBe('+34611111111');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
