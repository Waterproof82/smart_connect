/**
 * N8NWebhookDataSource Tests
 *
 * Clean Architecture: Data Layer Tests
 * Regression-first: proves the fake-success bypass (ADR-3, consumer half) is gone.
 */

// N8NWebhookDataSource imports ConsoleLogger via the @core/domain/usecases barrel,
// which transitively pulls in NoOpSecurityLogger -> supabaseClient (import.meta.env).
// Mock the barrel so this suite never touches the real Supabase client module.
jest.mock('@core/domain/usecases', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import { N8NWebhookDataSource, WebhookPayload } from '@/features/landing/data/datasources/N8NWebhookDataSource';

const buildPayload = (): WebhookPayload => ({
  nombre: 'Ada Lovelace',
  empresa: 'Analytical Engines Inc',
  email: 'ada@example.com',
  servicio_interes: 'Consultoría IA',
  mensaje_cuerpo: 'Hola, quiero más info',
  timestamp: '2026-08-10T00:00:00.000Z',
});

describe('N8NWebhookDataSource', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false and does NOT call fetch when the URL is empty', async () => {
    const ds = new N8NWebhookDataSource('');
    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns false and does NOT call fetch when the URL is whitespace only', async () => {
    const ds = new N8NWebhookDataSource('   ');
    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns false and does NOT call fetch when the URL is not a valid http(s) URL', async () => {
    const ds = new N8NWebhookDataSource('not-a-url');
    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('attempts a fetch for the reserved .invalid TLD (no magic-substring bypass) and returns false when it fails', async () => {
    fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));
    const ds = new N8NWebhookDataSource('https://placeholder-webhook-url.invalid');

    const result = await ds.sendLead(buildPayload());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('attempts a fetch for a URL containing "your_" (proves the magic-substring bypass is gone)', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const ds = new N8NWebhookDataSource('https://your_n8n_instance.example.com/webhook');

    const result = await ds.sendLead(buildPayload());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('returns true when the webhook responds ok', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const ds = new N8NWebhookDataSource('https://n8n.example.com/webhook');

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(buildPayload()),
      }),
    );
  });

  it('returns false when the webhook responds with a non-ok status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    const ds = new N8NWebhookDataSource('https://n8n.example.com/webhook');

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const ds = new N8NWebhookDataSource('https://n8n.example.com/webhook');

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('accepts http:// URLs (self-hosted/LAN n8n)', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const ds = new N8NWebhookDataSource('http://192.168.1.10:5678/webhook/lead');

    const result = await ds.sendLead(buildPayload());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });
});
