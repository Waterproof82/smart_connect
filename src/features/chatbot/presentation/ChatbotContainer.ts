// presentation/containers/ChatbotContainer.ts

import { ChatRepositoryImpl } from '../../chatbot/data/repositories/ChatRepositoryImpl';

// También importa el tipo de Supabase
import { SupabaseClient } from '@supabase/supabase-js';
import { GenerateResponseUseCase } from '../../chatbot/domain/usecases/GenerateResponseUseCase';

export function createChatbotContainer(supabase: SupabaseClient) {
  // ✅ SIMPLE: Solo necesitas el repository
  const chatRepository = new ChatRepositoryImpl(supabase);
  
  const generateResponseUseCase = new GenerateResponseUseCase(chatRepository);

  return {
    generateResponseUseCase,
  };
}

// Alias export for compatibility with barrel
export { createChatbotContainer as getChatbotContainer };