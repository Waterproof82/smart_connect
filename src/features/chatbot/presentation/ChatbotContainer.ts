// presentation/containers/ChatbotContainer.ts

import { ChatRepositoryImpl } from '../../chatbot/data/repositories/ChatRepositoryImpl';
import { getSupabase } from '@shared/supabaseClient';
import { GenerateResponseUseCase } from '../../chatbot/domain/usecases/GenerateResponseUseCase';

/**
 * Resolves the Supabase client itself via the async `getSupabase()`
 * chokepoint (U3) — no longer takes it as a caller-supplied argument.
 * Removes the Presentation-layer client leak: `ExpertAssistantWithRAG.tsx`
 * used to import `supabase` statically purely to pass it through here.
 *
 * A `getSupabase()` rejection propagates to the caller, which decides the
 * fallback UX (see `ExpertAssistantWithRAG.tsx`'s existing error-message
 * catch path).
 */
export async function createChatbotContainer() {
  const supabase = await getSupabase();
  // ✅ SIMPLE: Solo necesitas el repository
  const chatRepository = new ChatRepositoryImpl(supabase);

  const generateResponseUseCase = new GenerateResponseUseCase(chatRepository);

  return {
    generateResponseUseCase,
  };
}

// Alias export for compatibility with barrel
export { createChatbotContainer as getChatbotContainer };
