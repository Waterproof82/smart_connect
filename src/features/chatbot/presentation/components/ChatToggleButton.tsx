import React, { RefObject } from "react";
import { Bot, MessageCircle } from "lucide-react";

interface ChatToggleButtonProps {
  isOpen: boolean;
  whatsappPhone?: string;
  buttonRef: RefObject<HTMLButtonElement>;
  onToggle: () => void;
}

export const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({
  isOpen,
  whatsappPhone,
  buttonRef,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-3">
      {whatsappPhone && (
        <a
          href={`https://wa.me/${whatsappPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="flex items-center gap-2 sm:gap-3 bg-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] text-[var(--color-on-accent)] px-4 py-3 sm:px-5 rounded-full shadow-lg transition-colors min-h-[44px]"
        >
          Contactar
          <MessageCircle className="w-4 h-4" />
        </a>
      )}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 min-h-[44px] ${isOpen ? "bg-[var(--color-accent)] text-[var(--color-on-accent)]" : "bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"}`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${isOpen ? "bg-[var(--color-overlay-strong)]" : "bg-[var(--color-accent)]"}`}
        >
          <Bot className="text-[var(--color-on-accent)] w-5 h-5" />
        </div>
        <span className="text-sm font-bold hidden sm:block">
          Asistente Experto
        </span>
      </button>
    </div>
  );
};

export default ChatToggleButton;
