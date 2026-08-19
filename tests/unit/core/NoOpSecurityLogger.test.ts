/**
 * NoOpSecurityLogger / createSupabasePersistence Tests
 *
 * Clean Architecture: infrastructure factory tests.
 * Verifies the Supabase-backed persistence adapter resolves the client via
 * the async `getSupabase()` chokepoint (U3) instead of a static import,
 * and that a chokepoint rejection (offline, stale chunk) is surfaced as
 * a graceful `{ error }` result — never an unhandled rejection.
 */

// This repo auto-mocks '@core/domain/usecases/NoOpSecurityLogger' project-wide
// (see tests/__mocks__/@core/domain/usecases/NoOpSecurityLogger.ts — Jest treats
// the `@core/...` path alias as a scoped-package-style specifier and picks up
// the adjacent manual mock automatically). This suite tests the REAL module,
// so it must explicitly opt out.
jest.unmock('@core/domain/usecases/NoOpSecurityLogger');

const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));
const mockGetSupabase = jest.fn();

jest.mock('@shared/supabaseClient', () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
}));

import { createSupabasePersistence } from '@core/domain/usecases/NoOpSecurityLogger';

describe('createSupabasePersistence', () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockFrom.mockClear();
    mockGetSupabase.mockReset();
    mockGetSupabase.mockResolvedValue({ from: mockFrom });
  });

  it('resolves the client via getSupabase() before inserting', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const persistence = createSupabasePersistence();

    await persistence.insert({ codigo: 'XSS_ATTEMPT' });

    expect(mockGetSupabase).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('security_logs');
    expect(mockInsert).toHaveBeenCalledWith({ codigo: 'XSS_ATTEMPT' });
  });

  it('returns { error: null } on a successful insert', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const persistence = createSupabasePersistence();

    const result = await persistence.insert({ codigo: 'XSS_ATTEMPT' });

    expect(result).toEqual({ error: null });
  });

  it('returns the error message when the insert call reports an error', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'RLS violation' } });
    const persistence = createSupabasePersistence();

    const result = await persistence.insert({ codigo: 'XSS_ATTEMPT' });

    expect(result).toEqual({ error: { message: 'RLS violation' } });
  });

  it('does not throw and returns a graceful error when getSupabase() rejects', async () => {
    mockGetSupabase.mockRejectedValue(new Error('chunk fetch failed'));
    const persistence = createSupabasePersistence();

    const result = await persistence.insert({ codigo: 'XSS_ATTEMPT' });

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toContain('chunk fetch failed');
  });
});
