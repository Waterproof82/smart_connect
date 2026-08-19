/**
 * ChatbotContainer Tests
 *
 * Clean Architecture: composition root test.
 * Verifies `createChatbotContainer()` resolves the Supabase client itself
 * via the async `getSupabase()` chokepoint (U3), no longer taking it as a
 * caller-supplied argument — removing the Presentation-layer client leak
 * (`ExpertAssistantWithRAG.tsx` used to import `supabase` just to pass it
 * through).
 */

const mockGetSupabase = jest.fn();
jest.mock('@shared/supabaseClient', () => ({
  getSupabase: (...args: unknown[]) => mockGetSupabase(...args),
}));

const mockChatRepositoryImplCtor = jest.fn();
jest.mock('@features/chatbot/data/repositories/ChatRepositoryImpl', () => ({
  ChatRepositoryImpl: class {
    constructor(...args: unknown[]) {
      mockChatRepositoryImplCtor(...args);
    }
  },
}));

import { createChatbotContainer } from '@/features/chatbot/presentation/ChatbotContainer';

describe('createChatbotContainer', () => {
  beforeEach(() => {
    mockGetSupabase.mockReset();
    mockChatRepositoryImplCtor.mockReset();
  });

  it('resolves the client via getSupabase() (no argument taken)', async () => {
    const fakeClient = { __kind: 'fake-client' };
    mockGetSupabase.mockResolvedValue(fakeClient);

    await createChatbotContainer();

    expect(mockGetSupabase).toHaveBeenCalledTimes(1);
    expect(mockChatRepositoryImplCtor).toHaveBeenCalledWith(fakeClient);
  });

  it('returns an object exposing generateResponseUseCase', async () => {
    mockGetSupabase.mockResolvedValue({ __kind: 'fake-client' });

    const container = await createChatbotContainer();

    expect(container.generateResponseUseCase).toBeDefined();
  });

  it('propagates a getSupabase() rejection to the caller (caller decides fallback UX)', async () => {
    mockGetSupabase.mockRejectedValue(new Error('chunk fetch failed'));

    await expect(createChatbotContainer()).rejects.toThrow('chunk fetch failed');
  });
});
