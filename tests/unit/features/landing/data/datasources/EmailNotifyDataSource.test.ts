/**
 * EmailNotifyDataSource Tests
 *
 * Clean Architecture: Data Layer Tests
 * Verifies the email fallback channel (ADR-5) calls the `notify-lead` Edge
 * Function with the exact payload and interprets its response correctly.
 */

// EmailNotifyDataSource imports ConsoleLogger via the @core/domain/usecases barrel,
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

// The datasource resolves an un-injected client via the async getSupabase()
// chokepoint (import.meta.env + dynamic import under the hood). Mock it so
// this suite never touches the real module.
const mockGetSupabase = jest.fn();
jest.mock('@shared/supabaseClient', () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
}));

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EmailNotifyDataSource,
  LeadNotificationPayload,
} from '@/features/landing/data/datasources/EmailNotifyDataSource';

const buildPayload = (): LeadNotificationPayload => ({
  name: 'Ada Lovelace',
  company: 'Analytical Engines Inc',
  email: 'ada@example.com',
  service: 'Consultoría IA',
  message: 'Hola, quiero más info',
  submittedAt: '2026-08-10T00:00:00.000Z',
});

function buildClient(invokeImpl: jest.Mock): SupabaseClient {
  return {
    functions: { invoke: invokeImpl },
  } as unknown as SupabaseClient;
}

describe('EmailNotifyDataSource', () => {
  beforeEach(() => {
    mockGetSupabase.mockReset();
  });

  it('invokes the notify-lead function with the exact payload as the body', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const ds = new EmailNotifyDataSource(buildClient(invoke));
    const payload = buildPayload();

    await ds.sendLead(payload);

    expect(invoke).toHaveBeenCalledWith('notify-lead', { body: payload });
  });

  it('returns true when the function responds with { ok: true }', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const ds = new EmailNotifyDataSource(buildClient(invoke));

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(true);
  });

  it('returns false when the invoke call returns an error', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const ds = new EmailNotifyDataSource(buildClient(invoke));

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('returns false when the function responds with { ok: false }', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: { ok: false }, error: null });
    const ds = new EmailNotifyDataSource(buildClient(invoke));

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('returns false when invoke throws', async () => {
    const invoke = jest.fn().mockRejectedValue(new Error('network down'));
    const ds = new EmailNotifyDataSource(buildClient(invoke));

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('resolves the client via getSupabase() when constructed without an explicit client', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: { ok: true }, error: null });
    mockGetSupabase.mockResolvedValue(buildClient(invoke));
    const ds = new EmailNotifyDataSource();

    const result = await ds.sendLead(buildPayload());

    expect(mockGetSupabase).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith('notify-lead', { body: buildPayload() });
    expect(result).toBe(true);
  });

  it('returns false (not a throw) when getSupabase() rejects', async () => {
    mockGetSupabase.mockRejectedValue(new Error('chunk fetch failed'));
    const ds = new EmailNotifyDataSource();

    const result = await ds.sendLead(buildPayload());

    expect(result).toBe(false);
  });

  it('does NOT call getSupabase() when an explicit client is injected', async () => {
    const invoke = jest.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const ds = new EmailNotifyDataSource(buildClient(invoke));

    await ds.sendLead(buildPayload());

    expect(mockGetSupabase).not.toHaveBeenCalled();
  });
});
