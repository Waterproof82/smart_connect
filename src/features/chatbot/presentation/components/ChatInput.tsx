import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex gap-2">
      <label htmlFor="chatbot-input" className="sr-only">
        Escribe tu mensaje
      </label>
      <input
        id="chatbot-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu mensaje..."
        aria-label="Escribe tu mensaje"
        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-sm text-default outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors min-h-[44px]"
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensaje"
        className="w-11 h-11 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
      >
        <Send className="w-4 h-4 text-[var(--color-on-accent)]" />
      </button>
    </div>
  );
};

export default ChatInput;
