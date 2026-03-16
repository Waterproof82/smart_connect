import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, User, Bot, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { createChatbotContainer } from './ChatbotContainer';
import { MessageEntity, ChatSessionEntity, type Message } from '../domain/entities';
import { sanitizeInput } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';
import { supabase } from '@shared/supabaseClient';
import { getAppSettings } from '@shared/services/settingsService';

function getSessionIdentifier(): string {
  const key = 'sc_chat_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

const container = createChatbotContainer(supabase);

export const ExpertAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const settings = await getAppSettings();
      if (settings.whatsappPhone) {
        setWhatsappPhone(settings.whatsappPhone.replaceAll(/[^\d+]/g, ''));
      }
    };
    fetchWhatsApp();
  }, []);

  const [chatSession, setChatSession] = useState(() => new ChatSessionEntity());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatSession.messages, isLoading]);

  const handleSendMessage = useCallback(async (message: string, currentMessages: Message[]) => {
    setIsLoading(true);
    try {
      const response = await container.generateResponseUseCase.execute({
        userQuery: message,
        conversationHistory: currentMessages,
        useRAG: true,
        ragOptions: { topK: 5, threshold: 0.4, source: null },
      });
      const assistantEntity = new MessageEntity({ role: 'assistant', content: response });
      setChatSession(prev => prev.addMessage(assistantEntity));
    } catch {
      const errorEntity = new MessageEntity({ role: 'assistant', content: 'Hubo un error al conectar con el asistente. Por favor, intenta de nuevo.' });
      setChatSession(prev => prev.addMessage(errorEntity));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userIdentifier = getSessionIdentifier();
    const isAllowed = await rateLimiter.checkLimit(userIdentifier, RateLimitPresets.CHATBOT);
    if (!isAllowed) {
      const errorEntity = new MessageEntity({ role: 'assistant', content: 'Has enviado demasiados mensajes. Por favor, espera un minuto antes de continuar.' });
      setChatSession(prev => prev.addMessage(errorEntity));
      return;
    }

    let sanitizedInput: string;
    try {
      sanitizedInput = sanitizeInput(input.trim(), 'chatbot_message', 4000);
    } catch {
      const errorEntity = new MessageEntity({ role: 'assistant', content: 'Tu mensaje es demasiado largo. Máximo 4000 caracteres.' });
      setChatSession(prev => prev.addMessage(errorEntity));
      setInput('');
      return;
    }

    setInput('');
    const userEntity = new MessageEntity({ role: 'user', content: sanitizedInput });
    const updatedSession = chatSession.addMessage(userEntity);
    setChatSession(updatedSession);
    await handleSendMessage(sanitizedInput, updatedSession.messages);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-[400px] h-[550px] max-h-[80vh] bg-sc-dark-alt border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 bg-blue-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Asistente Experto</h4>
                <p className="text-[10px] text-blue-100 opacity-70">Entrenado con IA</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cerrar chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {chatSession.isEmpty() && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h5 className="font-bold mb-2">¿Cómo puedo ayudarte?</h5>
                <p className="text-xs text-gray-500 mb-4">Pregúntame sobre QRIBAR, automatización con n8n o cómo mejorar tus reseñas en Google.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['¿Qué es QRIBAR?', '¿Cómo funcionan las tarjetas NFC?', 'Quiero automatizar mi negocio'].map((prompt) => (
                    <button key={prompt} onClick={() => setInput(prompt)} className="text-xs bg-blue-600/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-600/20 transition-colors">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatSession.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-sc-dark-input border-t border-white/5">
            <div className="relative flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje" className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-blue-500 transition-colors" />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Enviar mensaje" className="w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {whatsappPhone && (
          <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebc57] text-white px-5 py-3 rounded-full shadow-lg transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-bold hidden sm:block">WhatsApp</span>
          </a>
        )}

        <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOpen ? 'bg-white/20' : 'bg-blue-600'}`}>
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="text-sm font-bold hidden sm:block">Asistente Experto</span>
        </button>
      </div>
    </div>
  );
};