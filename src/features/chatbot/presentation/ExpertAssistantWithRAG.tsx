/**
 * ExpertAssistantWithRAG Component
 * @module features/chatbot/presentation
 *
 * AI-powered chatbot with RAG (Retrieval Augmented Generation)
 * Clean Architecture: delegates UI to specialized components
 */

import React, { useState, useRef, useEffect } from "react";
import { X, Bot } from "lucide-react";
import { createChatbotContainer } from "./ChatbotContainer";
import {
  MessageEntity,
  ChatSessionEntity,
  type Message,
} from "../domain/entities";
import { sanitizeInput } from "@shared/utils/sanitizer";
import { rateLimiter, RateLimitPresets } from "@shared/utils/rateLimiter";
import { getAppSettings } from "@shared/services/settingsService";

// Extracted UI components (SRP)
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import ChatWelcome from "./components/ChatWelcome";
import ChatToggleButton from "./components/ChatToggleButton";

const getSessionIdentifier = (): string => {
  const key = "sc_chat_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `s_${Date.now().toString(36)}_${globalThis.crypto.randomUUID().slice(0, 8)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const ExpertAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  // U3: the chatbot data layer (which dynamically imports Supabase) is
  // resolved lazily on first widget OPEN, not on module load or render —
  // see design.md's "trigger = first open of the chat widget" decision.
  // A rejected promise is NOT cached (reset to null in the catch below),
  // otherwise a transient failure would permanently brick the widget.
  const containerPromiseRef = useRef<ReturnType<
    typeof createChatbotContainer
  > | null>(null);

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const settings = await getAppSettings();
      if (settings.whatsappPhone) {
        setWhatsappPhone(settings.whatsappPhone.replaceAll(/[^\d+]/g, ""));
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

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const dialog = modalRef.current;
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      setTimeout(() => firstFocusable?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          toggleBtnRef.current?.focus();
        }
        if (e.key === "Tab") {
          const focusable = dialog.querySelectorAll<HTMLElement>(
            'button, input, [tabindex]:not([tabindex="-1"])',
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      dialog.addEventListener("keydown", handleKeyDown);
      return () => {
        dialog.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleSendMessage = async (
    message: string,
    currentMessages: Message[],
  ) => {
    setIsLoading(true);
    try {
      // Belt-and-braces: normally already populated by the widget's open
      // transition (see <ChatToggleButton onToggle=... /> below), but a
      // message can theoretically be sent before that promise exists
      // (e.g. programmatic focus/paste flows) — populate it here too.
      containerPromiseRef.current ??= createChatbotContainer();
      const container = await containerPromiseRef.current;
      const response = await container.generateResponseUseCase.execute({
        userQuery: message,
        conversationHistory: currentMessages,
        useRAG: true,
        ragOptions: { topK: 5, threshold: 0.4, source: null },
      });
      const assistantEntity = new MessageEntity({
        role: "assistant",
        content: response,
      });
      setChatSession((prev) => prev.addMessage(assistantEntity));
    } catch {
      // Retry-safe: do NOT leave a rejected promise cached, or every
      // future message would fail forever on a single transient failure
      // (offline, a stale chunk after deploy).
      containerPromiseRef.current = null;
      const errorEntity = new MessageEntity({
        role: "assistant",
        content:
          "Hubo un error al conectar con el asistente. Por favor, intenta de nuevo.",
      });
      setChatSession((prev) => prev.addMessage(errorEntity));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userIdentifier = getSessionIdentifier();
    const isAllowed = await rateLimiter.checkLimit(
      userIdentifier,
      RateLimitPresets.CHATBOT,
    );
    if (!isAllowed) {
      const errorEntity = new MessageEntity({
        role: "assistant",
        content:
          "Has enviado demasiados mensajes. Por favor, espera un minuto antes de continuar.",
      });
      setChatSession((prev) => prev.addMessage(errorEntity));
      return;
    }

    let sanitizedInput: string;
    try {
      sanitizedInput = sanitizeInput(input.trim(), "chatbot_message", 4000);
    } catch {
      const errorEntity = new MessageEntity({
        role: "assistant",
        content: "Tu mensaje es demasiado largo. Máximo 4000 caracteres.",
      });
      setChatSession((prev) => prev.addMessage(errorEntity));
      setInput("");
      return;
    }

    setInput("");
    const userEntity = new MessageEntity({
      role: "user",
      content: sanitizedInput,
    });
    const updatedSession = chatSession.addMessage(userEntity);
    setChatSession(updatedSession);
    await handleSendMessage(sanitizedInput, updatedSession.messages);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <dialog
          ref={modalRef}
          aria-label="Chat con asistente experto"
          className="w-[calc(100vw-2rem)] sm:w-[90vw] md:w-[400px] h-[65vh] sm:h-[550px] max-h-[calc(100dvh-140px)] sm:max-h-[80vh] static m-0 p-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl shadow-lg flex flex-col overflow-hidden"
          open={isOpen}
        >
          <div className="p-4 bg-[var(--color-accent)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--color-overlay-strong)] rounded-lg flex items-center justify-center">
                <Bot className="text-[var(--color-on-accent)] w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--color-on-accent)]">
                  Asistente Experto
                </h3>
                <p className="text-xs text-[var(--color-on-accent-muted)]">
                  Entrenado con IA
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                toggleBtnRef.current?.focus();
              }}
              className="text-[var(--color-on-accent-muted)] hover:text-[var(--color-on-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-on-accent-muted)] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--color-overlay-medium)] transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="assertive"
          >
            {chatSession.isEmpty() ? (
              <ChatWelcome onPromptClick={handlePromptClick} />
            ) : (
              <ChatMessages
                messages={chatSession.messages}
                isLoading={isLoading}
              />
            )}
          </div>

          <div className="p-3 bg-[var(--color-bg)] border-t border-[var(--color-border)] shrink-0">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isLoading}
            />
          </div>
        </dialog>
      )}

      <ChatToggleButton
        isOpen={isOpen}
        whatsappPhone={whatsappPhone}
        buttonRef={toggleBtnRef}
        onToggle={() => {
          const opening = !isOpen;
          // Prime the chatbot data layer on the OPEN transition (not on
          // first send): the user spends a few seconds on the welcome
          // screen, so the ~53 KiB dynamically-imported chunk downloads
          // in the background and the first answer feels instant.
          if (opening && !containerPromiseRef.current) {
            containerPromiseRef.current = createChatbotContainer();
          }
          setIsOpen(opening);
        }}
      />
    </div>
  );
};

export default ExpertAssistant;
