import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, User, Bot, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { createChatbotContainer } from './ChatbotContainer';
import { MessageEntity, ChatSessionEntity, type Message } from '../domain/entities';
import { sanitizeInput } from '@shared/utils/sanitizer';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';
import { supabase } from '@shared/supabaseClient';
import { getAppSettings } from '@shared/services/settingsService';

let _container: ReturnType<typeof createChatbotContainer> | null = null;
const getContainer = () => {
  if (!_container) _container = createChatbotContainer(supabase);
  return _container;
};

const getSessionIdentifier = (): string => {
  const key = 'sc_chat_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const ExpertAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

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
      const response = await getContainer().generateResponseUseCase.execute({
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
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end gap-4">
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat con asistente experto"
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setIsOpen(false); toggleBtnRef.current?.focus(); }
            if (e.key === 'Tab') {
              const focusable = e.currentTarget.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }}
          className="mb-4 w-[85vw] sm:w-[90vw] md:w-[400px] h-[60vh] sm:h-[550px] max-h-[calc(100dvh-120px)] sm:max-h-[80vh] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 bg-[var(--color-accent)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Asistente Experto</h4>
                <p className="text-[10px] text-white/70">Entrenado con IA</p>
              </div>
            </div>
            <button onClick={() => { setIsOpen(false); toggleBtnRef.current?.focus(); }} className="text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cerrar chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {chatSession.isEmpty() && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h5 className="font-bold mb-2">¿Cómo puedo ayudarte?</h5>
                <p className="text-xs text-muted mb-4">Pregúntame sobre QRIBAR, automatización con n8n o cómo mejorar tus reseñas en Google.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                  {['¿Qué es QRIBAR?', '¿Cómo funcionan las tarjetas NFC?', 'Quiero automatizar mi negocio'].map((prompt) => (
                    <button key={prompt} onClick={() => setInput(prompt)} className="text-xs bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] px-3 py-2 sm:py-2 rounded-full hover:bg-[var(--color-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] transition-colors min-h-[44px]">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatSession.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[var(--color-primary)]" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[var(--color-accent)] text-white rounded-tr-none' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-default rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
            <div className="relative flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Escribe tu mensaje..." aria-label="Escribe tu mensaje" autoComplete="off" className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm text-default outline-none focus:border-[var(--color-primary)] transition-colors min-h-[44px]" />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} aria-label="Enviar mensaje" className="w-11 h-11 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {whatsappPhone && (
          <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp" className="flex items-center gap-2 sm:gap-3 bg-whatsapp hover:bg-whatsapp-hover focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] text-white px-4 py-3 sm:px-5 rounded-full shadow-lg transition-colors min-h-[48px]">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-bold hidden sm:block">WhatsApp</span>
          </a>
        )}

        <button ref={toggleBtnRef} onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 min-h-[48px] ${isOpen ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOpen ? 'bg-white/20' : 'bg-[var(--color-accent)]'}`}>
            <Bot className="text-white w-5 h-5" />
          </div>
          <span className="text-sm font-bold hidden sm:block">Asistente Experto</span>
        </button>
      </div>
    </div>
  );
};